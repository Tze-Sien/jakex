import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres.js connection
// Use connection pooling for serverless environments
const client = postgres(connectionString, {
  prepare: false, // Disable prefetch for Supabase
  max: 1, // Adjust based on your needs
});

// Create drizzle database instance with schema
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client };

// Export type for the database instance
export type Database = typeof db;
