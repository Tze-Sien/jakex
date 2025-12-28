# @repo/llm-service

Production-grade LLM service for analyzing Meta Ads campaign performance using Groq's fast inference.

## Features

- **Multi-Provider Architecture**: Primary Groq support with extensible provider system
- **Reliability Patterns**: Circuit breakers, retry logic with exponential backoff, rate limiting
- **Cost Optimization**: Smart caching (1-hour TTL), token usage tracking
- **Observability**: Structured logging, metrics collection, distributed tracing
- **Type Safety**: Full TypeScript with Zod validation
- **Versioned Prompts**: Rollback-capable prompt management system
- **Manglish Support**: Specialized analysis for Malaysian Chinese (mixed language) ad content

## Installation

This is an internal workspace package. Add it to your dependencies:

```json
{
  "dependencies": {
    "@repo/llm-service": "workspace:*"
  }
}
```

## Quick Start

```typescript
import { LLMClient } from "@repo/llm-service"

// Initialize client
const client = new LLMClient({
  groqApiKey: process.env.GROQ_API_KEY!,
  groqModel: "openai/gpt-oss-120b", // optional, defaults to Qwen for Chinese language support
  enableCache: true, // optional, defaults to true
  enableCircuitBreaker: true, // optional, defaults to true
  enableRateLimiting: true, // optional, defaults to true
})

// Analyze campaign performance
const result = await client.analyze({
  entityType: "campaign",
  entityId: "campaign-uuid",
  reportId: "report-uuid",
  dataRangeStart: "2025-12-20T00:00:00Z",
  dataRangeEnd: "2025-12-27T00:00:00Z",
  metrics: {
    spend: 150000, // in cents
    impressions: 500000,
    clicks: 10000,
    conversions: 250,
    ctr: 0.02,
    cpc: 1500,
    cpm: 3000,
    costPerConversion: 60000,
    roas: 3.2,
  },
  campaign: {
    name: "Summer Sale Campaign",
    objective: "CONVERSIONS",
    dailyBudget: 50000,
    lifetimeBudget: null,
    status: "ACTIVE",
  },
})

console.log(result.output.overallAssessment)
console.log(result.output.keyFindings)
console.log(result.output.recommendations)
console.log(`Cost: $${result.metadata.costUsd.toFixed(4)}`)
console.log(`Latency: ${result.metadata.latencyMs}ms`)
```

## Environment Variables

```bash
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (with defaults)
LLM_CACHE_TTL_MS=3600000                    # 1 hour
LLM_MAX_RETRIES=3
LLM_CIRCUIT_BREAKER_THRESHOLD=5
LLM_CIRCUIT_BREAKER_RESET_MS=60000          # 1 minute
LLM_GROQ_RATE_LIMIT=30                      # requests per minute
```

## Architecture

```
LLMClient (Orchestrator)
├── GroqProvider (Primary)
├── CircuitBreaker (Prevent cascading failures)
├── RateLimiter (Token bucket, 30 req/min)
├── CacheManager (1-hour TTL)
├── PromptManager (Versioned prompts)
└── Observability (Logger + Metrics)
```

## Key Components

### Providers

Extensible provider system with abstract base class:

```typescript
import { GroqProvider } from "@repo/llm-service"

const provider = new GroqProvider({
  apiKey: process.env.GROQ_API_KEY!,
  model: "openai/gpt-oss-120b", // or "openai/gpt-oss-120b"
  temperature: 0.3,
  maxTokens: 2000,
  timeout: 30000,
})
```

### Reliability

**Circuit Breaker**: Prevents traffic to failing providers
- Opens after 5 consecutive failures
- Half-open state allows 3 test requests
- Resets after 1 minute

**Retry Logic**: Exponential backoff with jitter
- Max 3 attempts
- Initial delay: 1s, max delay: 30s
- Only retries transient errors (timeout, rate limit, 5xx)

**Rate Limiting**: Token bucket algorithm
- 30 requests per minute for Groq
- Automatic token refill

### Caching

Smart caching based on:
- Entity ID + Data range + Prompt version
- Default TTL: 1 hour
- Automatic cleanup every 5 minutes

### Observability

**Structured Logging**:
```typescript
import { logger } from "@repo/llm-service"

logger.info("Analysis started", {
  traceId: "uuid",
  entityId: "campaign-123",
})
```

**Metrics Collection**:
```typescript
const metrics = client.getMetrics(300000) // Last 5 minutes
console.log(metrics.byProvider.groq.p95LatencyMs)
console.log(metrics.byProvider.groq.successRate)
```

### Prompts

Version-controlled prompts with rollback:

```typescript
import { promptManager } from "@repo/llm-service"

// Get active prompt
const prompt = promptManager.getPrompt("campaign")

// Switch to different version
promptManager.setActiveVersion("campaign", "v1.1.0")

// List all prompts
const all = promptManager.listPrompts()
```

## Health Check

```typescript
const health = await client.getHealth()
console.log(health)
// {
//   groq: {
//     healthy: true,
//     circuitBreaker: { state: "CLOSED", failureCount: 0 },
//     rateLimiter: { availableTokens: 28, maxTokens: 30 }
//   },
//   cache: { totalEntries: 12, validEntries: 12 },
//   overall: true
// }
```

## Cost Tracking

All responses include cost information:

```typescript
const result = await client.analyze(input)
console.log(`Cost: $${result.metadata.costUsd.toFixed(6)}`)
// Groq pricing: ~$0.27 per 1M tokens (input + output)
```

## Error Handling

```typescript
import { LLMError, RateLimitError, TimeoutError } from "@repo/llm-service"

try {
  const result = await client.analyze(input)
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`)
  } else if (error instanceof TimeoutError) {
    console.log("Request timeout")
  } else if (error instanceof LLMError) {
    console.log(`LLM Error: ${error.code} - ${error.message}`)
  }
}
```

## Best Practices

1. **Reuse Client Instance**: Create one client instance per application lifecycle
2. **Monitor Metrics**: Track success rate, latency, and costs
3. **Set Appropriate Timeouts**: Default 30s is suitable for most cases
4. **Handle Circuit Breaker**: Implement graceful degradation when circuit opens
5. **Cache Awareness**: Consider cache TTL when analyzing frequently updated data
6. **Prompt Versioning**: Test new prompts before deploying to production

## Manglish Ad Copy Analysis

The LLM service includes specialized prompts for analyzing **Malaysian Chinese (Manglish)** ad content - a natural mixture of Chinese, English, and Malay commonly used in Malaysian advertising.

**Important:** All analysis outputs are returned in **Mandarin Chinese (简体中文)** to serve Malaysian Chinese users directly.

**Model Recommendation:** The service defaults to **Qwen 2.5 72B** (`openai/gpt-oss-120b`) via Groq, which excels at Chinese language understanding and generation. Qwen models are specifically optimized for multilingual tasks including Chinese-English code-switching, making them ideal for Manglish content analysis.

### What Gets Analyzed

For Manglish ad copy, the LLM provides:

1. **Language Composition Breakdown**
   - Identifies which parts are Chinese, English, or Malay
   - Analyzes code-switching effectiveness and naturalness

2. **Cultural Resonance**
   - Evaluates cultural relevance to Malaysian Chinese audience
   - Assesses local context appropriateness (festivals, values, humor)

3. **Effectiveness Scoring** (1-10 scale)
   - Cultural relevance
   - Language mixing effectiveness
   - Emotional impact
   - Message clarity

4. **Strategic Recommendations**
   - Language mix optimization (when to use more Chinese vs English)
   - Culturally appropriate CTA alternatives
   - A/B testing suggestions for language variations

### Example

```typescript
import { LLMClient } from "@repo/llm-service"

const client = new LLMClient({
  groqApiKey: process.env.GROQ_API_KEY!,
})

// Analyze Manglish ad
const result = await client.analyze({
  entityType: "ad",
  entityId: "ad-uuid",
  reportId: "report-uuid",
  // ... metrics data ...
  ad: {
    name: "CNY Special Ad",
    headline: "年终大促销！Save up to 70% 😍",
    bodyText: "还在等什么？Limited stock! 赶快抢购你最爱的产品。",
    callToAction: "Shop Now",
    // ... other fields ...
  },
})

// Get language-specific insights (in Mandarin Chinese)
console.log(result.output.creativeAnalysis)
// Example output (in Mandarin):
// "语言组成分析：标题使用70%中文（'年终大促销'）配30%英文（'Save up to 70%'），
// 情感词汇主要用中文以增强本地共鸣...
//
// 文化相关性评分: 9/10 - 'CNY'和红包emoji强烈共鸣马来西亚华人
// 语言混合效果: 8/10 - 中英切换自然，英文用于优惠数字更清晰
// 情感冲击力: 9/10 - '赶快抢购'创造紧迫感
// 信息清晰度: 8/10 - 尽管混合语言，信息传达清楚"
```

### Demo

Run the Manglish analysis demo:

```bash
cd packages/llm-service
GROQ_API_KEY=your_key bun run examples/manglish-ad-analysis.ts
```

This demonstrates analysis of different Manglish mixing patterns:
- High mixing (Chinese emotional + English CTA)
- Moderate mixing (English dominant with Chinese keywords)
- Festival-themed (Cultural context like CNY)

### Key Features

✅ **Non-Agentic Approach**: Single LLM call with structured prompting for efficiency
✅ **Chain-of-Thought**: Prompts guide LLM to think through language analysis systematically
✅ **Cultural Awareness**: Specialized understanding of Malaysian market context
✅ **Actionable Insights**: Specific recommendations, not generic advice

## References

- [Groq API Documentation](https://console.groq.com/docs/overview)
- [Production LLM Best Practices](https://latitude-blog.ghost.io/blog/10-best-practices-for-production-grade-llm-prompt-engineering/)
- [LLM Observability Guide](https://www.helicone.ai/blog/llm-observability)
- [Circuit Breakers in LLM Apps](https://portkey.ai/blog/retries-fallbacks-and-circuit-breakers-in-llm-apps/)
