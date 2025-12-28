import { createHash } from "crypto"

/**
 * Generate SHA256 hash for input data
 */
export function hashInput(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex")
}
