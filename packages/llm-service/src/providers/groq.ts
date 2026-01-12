import Groq from "groq-sdk"
import { AnalysisOutputSchema, LLMError, TimeoutError, type AnalysisInput, type AnalysisOutput } from "../types"

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
 * Handles all interactions with the Groq API for LLM inference
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

  async execute(input: AnalysisInput, systemPrompt: string) {
    const startTime = Date.now()

    try {
      const messages = this.formatInput(input, systemPrompt)

      const response = await Promise.race([
        this.client.chat.completions.create({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          response_format: { type: "json_object" }, // Force JSON output
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new TimeoutError("groq", this.config.timeout)), this.config.timeout)
        ),
      ])

      const latencyMs = Date.now() - startTime

      if (!response.choices[0]?.message?.content) {
        throw new LLMError("Empty response from Groq", "groq", "EMPTY_RESPONSE")
      }

      const output = this.parseResponse(response.choices[0].message.content)

      const inputTokens = response.usage?.prompt_tokens ?? 0
      const outputTokens = response.usage?.completion_tokens ?? 0
      const totalTokens = response.usage?.total_tokens ?? 0

      return {
        output,
        metadata: {
          provider: "groq" as const,
          model: this.config.model,
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

  private formatInput(input: AnalysisInput, systemPrompt: string) {
    const userMessage = this.buildUserMessage(input)

    return [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userMessage },
    ]
  }

  private parseResponse(response: string): AnalysisOutput {
    try {
      const parsed = JSON.parse(response)
      return AnalysisOutputSchema.parse(parsed)
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

  private buildUserMessage(input: AnalysisInput): string {
    const metricChanges = input.previousMetrics
      ? {
          spendChange: ((input.metrics.spend - input.previousMetrics.spend) / input.previousMetrics.spend) * 100,
          impressionsChange:
            ((input.metrics.impressions - input.previousMetrics.impressions) / input.previousMetrics.impressions) *
            100,
          ctrChange: ((input.metrics.ctr - input.previousMetrics.ctr) / input.previousMetrics.ctr) * 100,
          roasChange:
            input.metrics.roas && input.previousMetrics.roas
              ? ((input.metrics.roas - input.previousMetrics.roas) / input.previousMetrics.roas) * 100
              : null,
        }
      : null

    return `Analyze the following ${input.entityType} performance data:

**Entity:** ${input.entityType === "campaign" ? input.campaign?.name : input.entityType === "adSet" ? input.adSet?.name : input.ad?.name}

**Time Period:** ${input.dataRangeStart} to ${input.dataRangeEnd}

${input.businessContext ? `**Business Context:**
- Industry: ${input.businessContext.industry ?? "Not specified"}
- Product Type: ${input.businessContext.productType ?? "Not specified"}
- Ad Type: ${input.businessContext.adType ?? "Not specified"}` : ""}

**Current Metrics:**
- Spend: $${(input.metrics.spend / 100).toFixed(2)}
- Impressions: ${input.metrics.impressions.toLocaleString()}
- Clicks: ${input.metrics.clicks.toLocaleString()}
- CTR: ${input.metrics.ctr.toFixed(2)}%
- CPC: $${(input.metrics.cpc / 100).toFixed(2)}
- CPM: $${(input.metrics.cpm / 100).toFixed(2)}
- Conversions: ${input.metrics.conversions}
${input.metrics.costPerConversion ? `- Cost per Conversion: $${(input.metrics.costPerConversion / 100).toFixed(2)}` : ""}
${input.metrics.roas ? `- ROAS: ${input.metrics.roas.toFixed(2)}x` : ""}

${metricChanges ? `**Changes from Previous Period:**
- Spend: ${metricChanges.spendChange > 0 ? "+" : ""}${metricChanges.spendChange.toFixed(1)}%
- Impressions: ${metricChanges.impressionsChange > 0 ? "+" : ""}${metricChanges.impressionsChange.toFixed(1)}%
- CTR: ${metricChanges.ctrChange > 0 ? "+" : ""}${metricChanges.ctrChange.toFixed(1)}%
${metricChanges.roasChange !== null ? `- ROAS: ${metricChanges.roasChange > 0 ? "+" : ""}${metricChanges.roasChange.toFixed(1)}%` : ""}` : ""}

${input.campaign ? `**Campaign Context:**
- Objective: ${input.campaign.objective}
- Daily Budget: ${input.campaign.dailyBudget ? `$${(input.campaign.dailyBudget / 100).toFixed(2)}` : "Not set"}
- Lifetime Budget: ${input.campaign.lifetimeBudget ? `$${(input.campaign.lifetimeBudget / 100).toFixed(2)}` : "Not set"}
- Status: ${input.campaign.status}` : ""}

${input.adSet ? `**Ad Set Context:**
- Optimization Goal: ${input.adSet.optimizationGoal ?? "Not set"}
- Bid Strategy: ${input.adSet.bidStrategy ?? "Not set"}
- Daily Budget: ${input.adSet.dailyBudget ? `$${(input.adSet.dailyBudget / 100).toFixed(2)}` : "Not set"}
- Status: ${input.adSet.status}` : ""}

${input.ad ? `**Ad Creative:**
- Type: ${input.ad.creativeType ?? "Unknown"}
- Headline: ${input.ad.headline ?? "N/A"}
- Body Text: ${input.ad.bodyText ?? "N/A"}
- Call to Action: ${input.ad.callToAction ?? "N/A"}
- Status: ${input.ad.status}` : ""}

Provide a comprehensive analysis with specific, actionable recommendations.`
  }
}
