import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { env } from "./config/environment";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Enhanced connection configuration for Azure PostgreSQL compatibility
const createDatabaseConnection = () => {
  const connectionString = env.DATABASE_URL;
  
  // Parse connection string to detect provider
  const isAzurePostgreSQL = connectionString.includes('.postgres.database.azure.com');
  const isNeonDB = connectionString.includes('.neon.tech');
  
  if (isAzurePostgreSQL) {
    console.log("🔵 Using Azure Database for PostgreSQL");
    // For Azure PostgreSQL, we need to ensure SSL and proper connection pooling
    const poolConfig = {
      connectionString: connectionString,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    };
    
    return new Pool(poolConfig);
  } else if (isNeonDB) {
    console.log("🟢 Using Neon Database");
    return new Pool({ connectionString });
  } else {
    console.log("🐘 Using standard PostgreSQL");
    // Standard PostgreSQL configuration
    const poolConfig = {
      connectionString: connectionString,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
    
    return new Pool(poolConfig);
  }
};

export const pool = createDatabaseConnection();
export const db = drizzle({ client: pool, schema });

// Test database connection on startup
export const testDatabaseConnection = async () => {
  try {
    const start = Date.now();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    
    const duration = Date.now() - start;
    console.log(`✅ Database connected successfully (${duration}ms)`);
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};
