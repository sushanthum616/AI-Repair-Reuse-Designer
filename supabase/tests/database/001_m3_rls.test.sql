begin;

create extension if not exists pgtap with schema extensions;

select plan(21);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'deletion_jobs', 'deletion jobs table exists');

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'owner-one@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'owner-two@example.test');

set local role anon;
select throws_ok(
  'select id from public.profiles',
  '42501',
  'permission denied for table profiles',
  'anonymous users have no profile table privilege'
);
select throws_ok(
  'select id from public.projects',
  '42501',
  'permission denied for table projects',
  'anonymous users have no project table privilege'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq(
  'select id from public.profiles',
  array['11111111-1111-4111-8111-111111111111'::uuid],
  'a user sees only their profile'
);

select lives_ok(
  $$update public.profiles set display_name = 'Owner One' where id = '11111111-1111-4111-8111-111111111111'$$,
  'a user can update user-authored profile fields'
);

select throws_ok(
  $$update public.profiles set account_state = 'deleting' where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table profiles',
  'a user cannot forge account lifecycle state'
);

select lives_ok(
  $$insert into public.projects (title) values ('Owner one project')$$,
  'an active user can create an owned project without supplying ownership'
);

select results_eq(
  $$select owner_id from public.projects where title = 'Owner one project'$$,
  array['11111111-1111-4111-8111-111111111111'::uuid],
  'project ownership is assigned from verified auth identity'
);

select throws_ok(
  $$insert into public.projects (owner_id, title) values ('22222222-2222-4222-8222-222222222222', 'Forged')$$,
  '42501',
  'permission denied for table projects',
  'a user cannot supply a forged owner column'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is_empty(
  $$select id from public.projects where owner_id = '11111111-1111-4111-8111-111111111111'$$,
  'another user cannot read foreign projects'
);

select is_empty(
  $$update public.projects set title = 'Hacked' where owner_id = '11111111-1111-4111-8111-111111111111' returning id$$,
  'another user cannot update foreign projects'
);

select is_empty(
  $$delete from public.projects where owner_id = '11111111-1111-4111-8111-111111111111' returning id$$,
  'another user cannot delete foreign projects'
);

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select ok(
  public.begin_account_deletion() is not null,
  'an authenticated user can begin account deletion'
);

select results_eq(
  $$select account_state::text from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
  array['deleting'],
  'deletion marks the account before cleanup'
);

select is(
  public.begin_account_deletion(),
  public.begin_account_deletion(),
  'begin account deletion is idempotent'
);

select throws_ok(
  $$insert into public.projects (title) values ('Too late')$$,
  '55000',
  'account is not active',
  'a deleting account cannot create new work'
);

select throws_ok(
  $$delete from public.profiles where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501',
  'permission denied for table profiles',
  'a user cannot delete the lifecycle guard directly'
);

reset role;
delete from auth.users where id = '11111111-1111-4111-8111-111111111111';

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is_empty('select id from public.profiles', 'a stale token sees no deleted profile');
select throws_ok(
  $$insert into public.projects (title) values ('Stale token write')$$,
  '55000',
  'account is not active',
  'a stale token cannot write after terminal auth deletion'
);

select * from finish();
rollback;
