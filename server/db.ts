import dotenv from 'dotenv';
dotenv.config();

import * as schema from "@shared/schema";

// Use SQLite for development if no DATABASE_URL is provided
const isDevelopment = process.env.NODE_ENV !== 'production';
const useSQLite = isDevelopment && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sqlite'));

if (useSQLite) {
  console.log('📦 Using SQLite database for development');
  const Database = require('better-sqlite3');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  
  const sqlite = new Database(process.env.DATABASE_URL?.replace('sqlite://', '') || './data/dev.db');
  export const db = drizzle({ client: sqlite, schema });
  export const pool = null; // SQLite doesn't use connection pools
} else {
  console.log('🐘 Using PostgreSQL database');
  const { Pool } = require('pg');
  const { drizzle } = require('drizzle-orm/node-postgres');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle({ client: pool, schema });
}
