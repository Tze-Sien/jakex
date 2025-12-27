import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDatabase(connectionString?: string) {
  const connString = connectionString || process.env.DATABASE_URL;

  if (!connString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(connString);
  const db = drizzle(client, { schema });

  return { client, db };
}

// Default instance (lazy initialization)
let _defaultDb: ReturnType<typeof createDatabase> | null = null;

export function getDb() {
  if (!_defaultDb) {
    _defaultDb = createDatabase();
  }
  return _defaultDb;
}

export type Database = ReturnType<typeof createDatabase>["db"];
