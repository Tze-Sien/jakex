import { LLMClient, type CompletionRequest } from "@repo/llm-service"
import { ACCOUNT_ANALYSIS_PROMPT_V1 } from "./prompts/account-analysis-v1"
import { formatAnalysisInput } from "./formatters"
import { AnalysisOutputSchema, type AnalysisInput, type AnalysisResult } from "./schemas"

/**
 * Meta Ads-specific LLM client wrapper
 *
 * Handles:
 * - Prompt versioning (v1.0.0, v2.0.0, etc.)
 * - Data formatting for Meta Ads domain
 * - Output schema validation
 *
 * Usage:
 * ```ts
 * const llmClient = new LLMClient({ groqApiKey: "..." })
 * const metaAdsClient = new MetaAdsAnalysisClient(llmClient, "v1.0.0")
 * const result = await metaAdsClient.analyze(analysisInput)
 * ```
 */
export class MetaAdsAnalysisClient {
  constructor(
    private llmClient: LLMClient,
    private promptVersion: string = "v1.0.0"
  ) {}

  /**
   * Analyze Meta Ads performance data
   *
   * @param input - Analysis input with metrics, entity context, etc.
   * @returns Analysis result with insights and recommendations
   */
  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    // Get prompt based on version (application manages versions)
    const systemPrompt = this.getPrompt(this.promptVersion)

    // Format user message (application-specific formatting)
    const userMessage = formatAnalysisInput(input)

    // Call generic LLM service
    const result = await this.llmClient.complete({
      systemPrompt,
      userMessage,
      outputSchema: AnalysisOutputSchema,
      cacheKey: `meta-ads:${input.entityType}:${input.entityId}:${this.promptVersion}`,
    } as CompletionRequest<typeof AnalysisOutputSchema._type>)

    return result as AnalysisResult
  }

  /**
   * Get prompt by version
   */
  private getPrompt(version: string): string {
    switch (version) {
      case "v1.0.0":
        return ACCOUNT_ANALYSIS_PROMPT_V1
      // Future versions can be added here:
      // case "v2.0.0":
      //   return ACCOUNT_ANALYSIS_PROMPT_V2
      default:
        throw new Error(`Unknown prompt version: ${version}`)
    }
  }

  /**
   * Get current prompt version
   */
  getPromptVersion(): string {
    return this.promptVersion
  }

  /**
   * Change prompt version for A/B testing
   */
  setPromptVersion(version: string): void {
    this.promptVersion = version
  }
}
