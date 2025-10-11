/**
 * Apply V2.0 Schema Migration
 * 
 * This script applies the new agent system and ejectable infrastructure tables
 * to the database. It includes safety checks and rollback capabilities.
 * 
 * Usage:
 *   npm run db:migrate:v2
 *   or
 *   tsx scripts/migrate-v2-schema.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

// Load environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkExistingTables(): Promise<string[]> {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
      'agent_sessions',
      'deployment_plans',
      'agent_actions',
      'cloud_connections',
      'ejection_exports',
      'autonomy_settings',
      'cost_alerts'
    );
  `);
  
  return result.rows.map(row => row.table_name);
}

async function applyMigration() {
  console.log('🚀 Careerate V2.0 Schema Migration');
  console.log('==================================\n');

  try {
    // Check connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Check existing tables
    console.log('🔍 Checking for existing V2.0 tables...');
    const existingTables = await checkExistingTables();
    
    if (existingTables.length > 0) {
      console.log(`⚠️  Warning: ${existingTables.length} V2.0 tables already exist:`);
      existingTables.forEach(table => console.log(`   - ${table}`));
      console.log('\n❓ Migration may have already been applied.');
      console.log('   To force re-apply, drop these tables first.\n');
      
      const continueAnyway = process.env.FORCE_MIGRATION === 'true';
      if (!continueAnyway) {
        console.log('ℹ️  Set FORCE_MIGRATION=true to continue anyway');
        console.log('   Exiting safely without changes.');
        process.exit(0);
      }
    } else {
      console.log('✅ No V2.0 tables found. Safe to proceed.\n');
    }

    // Read migration SQL
    console.log('📄 Loading migration SQL...');
    const migrationSQL = readFileSync(
      join(process.cwd(), 'migrations', '0001_add_v2_agent_tables.sql'),
      'utf-8'
    );
    console.log('✅ Migration SQL loaded\n');

    // Start transaction
    console.log('🔄 Starting transaction...');
    await pool.query('BEGIN');

    // Apply migration
    console.log('⚙️  Applying migration...\n');
    await pool.query(migrationSQL);

    // Verify tables were created
    console.log('🔍 Verifying new tables...');
    const createdTables = await checkExistingTables();
    
    if (createdTables.length === 7) {
      console.log('✅ All 7 V2.0 tables created successfully:');
      createdTables.forEach(table => console.log(`   ✓ ${table}`));
      console.log('');
    } else {
      throw new Error(`Expected 7 tables, but found ${createdTables.length}`);
    }

    // Commit transaction
    console.log('💾 Committing transaction...');
    await pool.query('COMMIT');
    console.log('✅ Migration committed successfully\n');

    // Success summary
    console.log('🎉 Migration Complete!');
    console.log('======================');
    console.log('✅ 7 new tables added:');
    console.log('   - agent_sessions');
    console.log('   - deployment_plans');
    console.log('   - agent_actions');
    console.log('   - cloud_connections');
    console.log('   - ejection_exports');
    console.log('   - autonomy_settings');
    console.log('   - cost_alerts');
    console.log('');
    console.log('📊 Database is now ready for V2.0!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('');

    // Rollback transaction
    try {
      await pool.query('ROLLBACK');
      console.log('↩️  Transaction rolled back. Database unchanged.');
    } catch (rollbackError) {
      console.error('⚠️  Rollback failed!', rollbackError);
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
applyMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

