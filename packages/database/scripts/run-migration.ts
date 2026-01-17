import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: "../../.env" });
config({ path: "../../apps/web/.env.local" });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    console.log("\nPlease set DATABASE_URL in one of these locations:");
    console.log("  - /Users/tzesien/Desktop/jakex/.env");
    console.log("  - /Users/tzesien/Desktop/jakex/apps/web/.env.local");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");
  
  const sql = postgres(databaseUrl, { max: 1 });
  
  try {
    // Read the migration SQL file
    const migrationSql = readFileSync(
      join(__dirname, "account_deletion_migration.sql"),
      "utf-8"
    );

    console.log("📝 Running migration SQL...\n");
    
    // Execute the migration
    await sql.unsafe(migrationSql);
    
    console.log("✅ Migration completed successfully!");
    console.log("\nChanges applied:");
    console.log("  ✓ Added supabase_user_id column to profiles table");
    console.log("  ✓ Added archived_at column to profiles table");
    console.log("  ✓ Migrated existing profile data");
    console.log("  ✓ Created indexes for performance");
    console.log("  ✓ Updated handle_new_user trigger function");
    console.log("  ✓ Recreated on_auth_user_created trigger");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
