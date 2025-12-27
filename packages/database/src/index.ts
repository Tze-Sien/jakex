// Re-export everything from schema
export * from "./schema";

// Re-export database client
export * from "./client";

// Re-export drizzle utilities for convenience
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  exists,
  notExists,
  between,
  notBetween,
  like,
  ilike,
  notLike,
  notIlike,
  not,
  and,
  or,
  asc,
  desc,
  sql,
} from "drizzle-orm";

// Export default db instance for convenience
import { getDb } from "./client";
export const db = getDb().db;
export const client = getDb().client;
