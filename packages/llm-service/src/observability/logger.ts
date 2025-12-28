/**
 * Structured logging for LLM requests
 *
 * Best Practice: Use JSON logging with correlation IDs for distributed tracing
 * Reference: https://www.helicone.ai/blog/llm-observability
 */

export interface LogContext {
  traceId: string
  provider?: string
  model?: string
  entityId?: string
  entityType?: string
  [key: string]: unknown
}

export class LLMLogger {
  constructor(private serviceName: string = "llm-service") {}

  info(message: string, context: LogContext) {
    this.log("INFO", message, context)
  }

  warn(message: string, context: LogContext) {
    this.log("WARN", message, context)
  }

  error(message: string, context: LogContext, error?: Error) {
    this.log("ERROR", message, {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  private log(level: string, message: string, context: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context,
    }

    // In production, send to logging service (e.g., Datadog, CloudWatch)
    console.log(JSON.stringify(logEntry))
  }
}

export const logger = new LLMLogger()
