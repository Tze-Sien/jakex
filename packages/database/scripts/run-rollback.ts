import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: "../../.env" });
config({ path: "../../apps/web/.env.local" });
config({ path: "../../apps/web/.env" });

async function runRollback() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found");
    process.exit(1);
  }

  console.log("🔗 Connecting to database...");
  
  const sql = postgres(databaseUrl, { max: 1 });
  
  try {
    const rollbackSql = readFileSync(
      join(__dirname, "rollback_to_simple_archive.sql"),
      "utf-8"
    );

    console.log("📝 Running rollback to simple archive approach...\n");
    
    await sql.unsafe(rollbackSql);
    
    console.log("✅ Rollback completed successfully!");
    console.log("\nChanges applied:");
    console.log("  ✓ Removed supabase_user_id column");
    console.log("  ✓ Kept archived_at column");
    console.log("  ✓ Restored trigger: profile.id = auth.users.id");
    console.log("\nSimple archive approach:");
    console.log("  • When user deletes account → archived_at is set");
    console.log("  • User is deleted from Supabase auth");
    console.log("  • New signup = new ID = new profile");
    
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runRollback();
