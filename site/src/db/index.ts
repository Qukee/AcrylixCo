import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Why a placeholder fallback?
//
// `next build` statically imports route modules to collect page data, and
// our auth route imports this file. Build environments (Railway containers,
// CI) often run *without* runtime env vars set, so we can't throw here.
//
// `postgres()` is lazy — it parses the URL but doesn't open a connection
// until the first query. A placeholder URL makes the module-load path safe.
// At runtime, if DATABASE_URL is genuinely missing, the first query will
// fail with a clear connection error pointing at the placeholder host.
const url =
  process.env.DATABASE_URL ??
  'postgresql://build-placeholder@build-placeholder:5432/build-placeholder';

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };
const client = globalForDb.client ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });
