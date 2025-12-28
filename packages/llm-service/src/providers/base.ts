import type { AnalysisInput, AnalysisOutput, LLMProvider, LLMResponseMetadata } from "../types"

export interface ProviderConfig {
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
  timeout?: number
}

export abstract class BaseProvider {
  protected config: ProviderConfig
  protected providerName: LLMProvider

  constructor(providerName: LLMProvider, config: ProviderConfig) {
    this.providerName = providerName
    this.config = {
      maxTokens: 4000, // Increased for Chinese language output which requires more tokens
      temperature: 0.3, // Lower temperature for more consistent analysis
      timeout: 30000, // 30 seconds
      ...config,
    }
  }

  /**
   * Execute the analysis request
   */
  abstract execute(input: AnalysisInput, systemPrompt: string): Promise<{
    output: AnalysisOutput
    metadata: Omit<LLMResponseMetadata, "traceId" | "attemptNumber" | "usedFallback">
  }>

  /**
   * Format the input data for the specific provider's API
   */
  protected abstract formatInput(input: AnalysisInput, systemPrompt: string): unknown

  /**
   * Parse the provider's response into our standard format
   */
  protected abstract parseResponse(response: unknown): AnalysisOutput

  /**
   * Calculate cost based on token usage
   */
  protected abstract calculateCost(inputTokens: number, outputTokens: number): number

  /**
   * Health check for the provider
   */
  abstract healthCheck(): Promise<boolean>

  /**
   * Get provider name
   */
  getProviderName(): LLMProvider {
    return this.providerName
  }

  /**
   * Get model name
   */
  getModel(): string {
    return this.config.model
  }
}
