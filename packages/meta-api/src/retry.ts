/**
 * Retry utilities with exponential backoff for Meta API calls
 *
 * Handles transient failures and rate limits with intelligent retry logic.
 */

export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = "RetryError";
  }
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 5,
  initialDelayMs: 1000,
  maxDelayMs: 60000, // 1 minute max
  backoffMultiplier: 2,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EAI_AGAIN",
  ],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as any;

  // Network errors
  if (err.code && retryableErrors.includes(err.code)) {
    return true;
  }

  // Meta API errors
  if (err.error?.error_subcode) {
    const subcode = err.error.error_subcode;
    // Temporary errors that should be retried
    return [
      1, // Temporary issue
      2, // Temporary API error
      17, // User request limit reached
      80001, // Temporary server error
      80002, // API temporarily unavailable
    ].includes(subcode);
  }

  // HTTP status codes
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number {
  const exponentialDelay =
    initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  const clampedDelay = Math.min(exponentialDelay, maxDelayMs);

  // Add jitter (±25%) to prevent thundering herd
  const jitter = clampedDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(clampedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param config - Retry configuration
 * @returns Result of the function
 * @throws RetryError if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableErrors,
  } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, retryableErrors)) {
        throw lastError;
      }

      const delay = calculateDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier
      );

      console.warn(
        `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        {
          error: lastError.message,
          attempt,
          delay,
        }
      );

      await sleep(delay);
    }
  }

  throw new RetryError(
    `Failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError!
  );
}

/**
 * Decorator for retry logic (for class methods)
 *
 * @example
 * class MyService {
 *   @Retry({ maxAttempts: 3 })
 *   async fetchData() {
 *     // ...
 *   }
 * }
 */
export function Retry(config: RetryConfig = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}
