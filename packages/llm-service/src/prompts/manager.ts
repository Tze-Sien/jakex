import { ACCOUNT_ANALYSIS_PROMPT_V1 } from "./templates/account-analysis"

export interface PromptTemplate {
  version: string
  entityType: "account"
  systemPrompt: string
  lastUpdated: string
  testCases?: Array<{ input: unknown; expectedOutput: unknown }>
}

/**
 * Manages versioned prompts with rollback capability
 *
 * Best Practice: Version control all prompts to enable A/B testing and rollback
 *
 * Note: This uses a unified account-level prompt since analysis is done
 * at the report level (entire account) rather than individual entities.
 */
export class PromptManager {
  private prompts: Map<string, PromptTemplate> = new Map()
  private activeVersions: Map<string, string> = new Map() // entityType -> version

  constructor() {
    this.loadPrompts()
  }

  /**
   * Load all prompt templates
   */
  private loadPrompts() {
    // Register unified account-level analysis prompt
    this.registerPrompt({
      version: "v1.0.0",
      entityType: "account",
      systemPrompt: ACCOUNT_ANALYSIS_PROMPT_V1,
      lastUpdated: "2025-12-27",
    })

    // Set default active version
    this.activeVersions.set("account", "v1.0.0")
  }

  /**
   * Register a new prompt template
   */
  registerPrompt(template: PromptTemplate) {
    const key = `${template.entityType}:${template.version}`
    this.prompts.set(key, template)
  }

  /**
   * Get the active prompt (always returns account-level prompt)
   */
  getPrompt(): PromptTemplate {
    const version = this.activeVersions.get("account") ?? "v1.0.0"
    const key = `account:${version}`
    const prompt = this.prompts.get(key)

    if (!prompt) {
      throw new Error(`No prompt found for account version ${version}`)
    }

    return prompt
  }

  /**
   * Get a specific version of the account prompt
   */
  getPromptVersion(version: string): PromptTemplate {
    const key = `account:${version}`
    const prompt = this.prompts.get(key)

    if (!prompt) {
      throw new Error(`No prompt found for account version ${version}`)
    }

    return prompt
  }

  /**
   * Set the active version for the account prompt
   */
  setActiveVersion(version: string) {
    const key = `account:${version}`
    if (!this.prompts.has(key)) {
      throw new Error(`Cannot activate non-existent prompt ${key}`)
    }
    this.activeVersions.set("account", version)
  }

  /**
   * List all available prompts
   */
  listPrompts(): PromptTemplate[] {
    return Array.from(this.prompts.values())
  }

  /**
   * Get active version number
   */
  getActiveVersion(): string {
    return this.activeVersions.get("account") ?? "v1.0.0"
  }
}

// Export singleton instance
export const promptManager = new PromptManager()
