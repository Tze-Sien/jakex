/**
 * @repo/llm-service - LLM service abstraction for Meta Ads analysis
 *
 * This package provides:
 * - LLM client for ad performance analysis
 * - Type definitions for analysis input/output
 */

// Main client
export { LLMClient, type LLMClientConfig } from "./client"

// Types
export type {
  AnalysisInput,
  AnalysisOutput,
  AnalysisResult,
  Recommendation,
  LLMResponseMetadata,
} from "./types"
