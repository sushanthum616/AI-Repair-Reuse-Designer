import { spawn, spawnSync } from "node:child_process";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  throw new Error("Usage: node scripts/with-local-supabase.mjs <command> [...args]");
}

const status = spawnSync("supabase", ["status", "-o", "env"], {
  encoding: "utf8",
  env: process.env,
});

if (status.status !== 0) {
  if (status.stderr) process.stderr.write(status.stderr);
  if (status.error) process.stderr.write(`${status.error.message}\n`);
  throw new Error("The local Supabase stack is not available. Run npm run db:start first.");
}

const local = Object.fromEntries(
  `${status.stdout}\n${status.stderr}`
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], unquote(match[2])]),
);

const child = spawn(command, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: local.PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: local.SECRET_KEY,
    SUPABASE_URL: local.API_URL,
    SUPABASE_PUBLISHABLE_KEY: local.PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: local.SECRET_KEY,
    SUPABASE_MAILPIT_URL: local.MAILPIT_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
});

child.on("close", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

function unquote(value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value);
  }
  return value;
}
