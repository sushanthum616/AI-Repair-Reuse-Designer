create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create type public.account_state as enum ('active', 'deleting');
create type public.project_status as enum (
  'draft',
  'active',
  'paused',
  'completed',
  'archived',
  'deleting'
);
create type public.deletion_job_status as enum (
  'requested',
  'cleaning',
  'auth_deletion_pending',
  'failed'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  skill_level text check (skill_level is null or skill_level in ('beginner', 'intermediate', 'advanced')),
  preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(preferences) = 'object'),
  account_state public.account_state not null default 'active',
  deletion_requested_at timestamptz,
  deletion_operation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_deletion_state_consistent check (
    (account_state = 'active' and deletion_requested_at is null and deletion_operation_id is null)
    or
    (account_state = 'deleting' and deletion_requested_at is not null and deletion_operation_id is not null)
  )
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  item_type text check (item_type is null or char_length(item_type) <= 120),
  materials text[] not null default '{}',
  damage_description text check (damage_description is null or char_length(damage_description) <= 4000),
  intended_use text check (intended_use is null or char_length(intended_use) <= 1000),
  skill_level text check (skill_level is null or skill_level in ('beginner', 'intermediate', 'advanced')),
  budget_minor integer check (budget_minor is null or budget_minor >= 0),
  currency_code text check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),
  constraints jsonb not null default '{}'::jsonb check (jsonb_typeof(constraints) = 'object'),
  status public.project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  unique (owner_id, id)
);

create index projects_owner_updated_idx on public.projects (owner_id, updated_at desc);
create index projects_owner_status_idx on public.projects (owner_id, status);

create table public.deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  status public.deletion_job_status not null default 'requested',
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.profiles
  add constraint profiles_deletion_operation_fk
  foreign key (deletion_operation_id)
  references public.deletion_jobs (id)
  on delete set null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

create trigger deletion_jobs_set_updated_at
before update on public.deletion_jobs
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.guard_project_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  requester uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if requester is not null then
      new.owner_id := requester;
    elsif current_user not in ('postgres', 'service_role') then
      raise exception 'authentication required' using errcode = '28000';
    end if;
  elsif new.owner_id is distinct from old.owner_id then
    raise exception 'project ownership is immutable' using errcode = '42501';
  end if;

  perform 1
  from public.profiles
  where id = new.owner_id and account_state = 'active'
  for update;

  if not found then
    raise exception 'account is not active' using errcode = '55000';
  end if;

  return new;
end;
$$;

create trigger projects_guard_write
before insert or update on public.projects
for each row execute function private.guard_project_write();

create or replace function public.begin_account_deletion()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := (select auth.uid());
  existing_state public.account_state;
  operation_id uuid;
begin
  if requester is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select account_state, deletion_operation_id
  into existing_state, operation_id
  from public.profiles
  where id = requester
  for update;

  if not found then
    raise exception 'account profile not found' using errcode = 'P0002';
  end if;

  if existing_state = 'deleting' then
    return operation_id;
  end if;

  operation_id := pg_catalog.gen_random_uuid();

  insert into public.deletion_jobs (id, owner_id)
  values (operation_id, requester)
  on conflict (owner_id) do update
    set attempt_count = public.deletion_jobs.attempt_count + 1,
        last_error_code = null
  returning id into operation_id;

  update public.profiles
  set account_state = 'deleting',
      deletion_requested_at = pg_catalog.now(),
      deletion_operation_id = operation_id
  where id = requester;

  return operation_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.deletion_jobs enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own_active
on public.profiles for update
to authenticated
using ((select auth.uid()) = id and account_state = 'active')
with check ((select auth.uid()) = id and account_state = 'active');

create policy projects_select_own
on public.projects for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy projects_insert_own_active
on public.projects for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.account_state = 'active'
  )
);

create policy projects_update_own_active
on public.projects for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.account_state = 'active'
  )
)
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.account_state = 'active'
  )
);

create policy projects_delete_own_active
on public.projects for delete
to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.profiles
    where profiles.id = (select auth.uid()) and profiles.account_state = 'active'
  )
);

revoke all on public.profiles, public.projects, public.deletion_jobs from anon, authenticated;

grant usage on schema public to authenticated, service_role;
grant select on public.profiles, public.projects to authenticated;
grant update (display_name, locale, skill_level, preferences) on public.profiles to authenticated;
grant insert (
  title,
  description,
  item_type,
  materials,
  damage_description,
  intended_use,
  skill_level,
  budget_minor,
  currency_code,
  constraints
) on public.projects to authenticated;
grant update (
  title,
  description,
  item_type,
  materials,
  damage_description,
  intended_use,
  skill_level,
  budget_minor,
  currency_code,
  constraints
) on public.projects to authenticated;
grant delete on public.projects to authenticated;

grant all on public.profiles, public.projects, public.deletion_jobs to service_role;

revoke all on function public.begin_account_deletion() from public, anon;
grant execute on function public.begin_account_deletion() to authenticated, service_role;

comment on function public.begin_account_deletion() is
  'Atomically marks the authenticated account deleting and returns its idempotent operation ID.';

notify pgrst, 'reload schema';
