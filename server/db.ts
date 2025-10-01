import dotenv from 'dotenv';
dotenv.config();

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use SQLite for local development
const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
export const db = drizzle({ client: sqlite, schema });
