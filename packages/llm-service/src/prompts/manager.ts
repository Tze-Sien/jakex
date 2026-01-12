import { ACCOUNT_ANALYSIS_PROMPT_V1 } from "./templates/account-analysis"

/**
 * Simple prompt manager for account-level analysis
 *
 * Provides the system prompt for account analysis
 */
export class PromptManager {
  private readonly systemPrompt: string

  constructor() {
    this.systemPrompt = ACCOUNT_ANALYSIS_PROMPT_V1
  }

  /**
   * Get the account-level analysis system prompt
   */
  getPrompt(): string {
    return this.systemPrompt
  }
}

// Export singleton instance
export const promptManager = new PromptManager()
