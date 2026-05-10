import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

// Single connection client; Next.js dev runs hot-reload, so cache on globalThis
// to avoid exhausting connections during HMR.
const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };
const client = globalForDb.client ?? postgres(url, { max: 10 });
if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });
