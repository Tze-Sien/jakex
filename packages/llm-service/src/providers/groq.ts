import Groq from "groq-sdk"
import { z } from "zod"
import { LLMError, TimeoutError } from "../types"

export interface GroqProviderConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
}

/**
 * Groq LLM Provider
 *
 * Generic provider for interacting with Groq API
 * Accepts any system prompt, user message, and output schema
 */
export class GroqProvider {
  private client: Groq
  private config: Required<GroqProviderConfig>

  constructor(config: GroqProviderConfig) {
    this.config = {
      model: "openai/gpt-oss-120b", // Default to Qwen for better Chinese language support
      maxTokens: 4000, // Increased for Chinese language output which requires more tokens
      temperature: 0.3, // Lower temperature for more consistent analysis
      timeout: 30000, // 30 seconds
      ...config,
    }
    this.client = new Groq({ apiKey: this.config.apiKey })
  }

  async execute<TOutput>(
    systemPrompt: string,
    userMessage: string,
    outputSchema: z.ZodType<TOutput>,
    configOverrides?: Partial<GroqProviderConfig>
  ) {
    const startTime = Date.now()

    // Merge config overrides
    const effectiveConfig = {
      model: configOverrides?.model ?? this.config.model,
      maxTokens: configOverrides?.maxTokens ?? this.config.maxTokens,
      temperature: configOverrides?.temperature ?? this.config.temperature,
      timeout: configOverrides?.timeout ?? this.config.timeout,
    }

    try {
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userMessage },
      ]

      const response = await Promise.race([
        this.client.chat.completions.create({
          model: effectiveConfig.model,
          messages,
          temperature: effectiveConfig.temperature,
          max_tokens: effectiveConfig.maxTokens,
          response_format: { type: "json_object" }, // Force JSON output
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new TimeoutError("groq", effectiveConfig.timeout)), effectiveConfig.timeout)
        ),
      ])

      const latencyMs = Date.now() - startTime

      if (!response.choices[0]?.message?.content) {
        throw new LLMError("Empty response from Groq", "groq", "EMPTY_RESPONSE")
      }

      const output = this.parseResponse(response.choices[0].message.content, outputSchema)

      const inputTokens = response.usage?.prompt_tokens ?? 0
      const outputTokens = response.usage?.completion_tokens ?? 0
      const totalTokens = response.usage?.total_tokens ?? 0

      return {
        output,
        metadata: {
          provider: "groq" as const,
          model: effectiveConfig.model,
          inputTokens,
          outputTokens,
          totalTokens,
          latencyMs,
          costUsd: this.calculateCost(inputTokens, outputTokens),
        },
      }
    } catch (error) {
      if (error instanceof TimeoutError) throw error

      if (error instanceof Groq.APIError) {
        if (error.status === 429) {
          throw new LLMError("Rate limit exceeded", "groq", "RATE_LIMIT", 429, true)
        }
        if (error.status && error.status >= 500) {
          throw new LLMError(error.message, "groq", "SERVER_ERROR", error.status, true)
        }
      }

      throw new LLMError(
        error instanceof Error ? error.message : "Unknown error",
        "groq",
        "EXECUTION_ERROR"
      )
    }
  }

  private parseResponse<TOutput>(response: string, schema: z.ZodType<TOutput>): TOutput {
    try {
      const parsed = JSON.parse(response)
      return schema.parse(parsed)
    } catch (error) {
      throw new LLMError(
        `Failed to parse Groq response: ${error instanceof Error ? error.message : "Unknown error"}`,
        "groq",
        "PARSE_ERROR"
      )
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Groq pricing (as of 2025): ~$0.27/M input tokens, ~$0.27/M output tokens for Llama 3.3 70B
    const INPUT_COST_PER_1M = 0.27
    const OUTPUT_COST_PER_1M = 0.27

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_1M
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M

    return inputCost + outputCost
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: "user", content: "Health check" }],
        max_tokens: 5,
      })
      return !!response.choices[0]?.message?.content
    } catch {
      return false
    }
  }

  getProviderName(): "groq" {
    return "groq"
  }

  getModel(): string {
    return this.config.model
  }
}
