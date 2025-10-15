/**
 * Retry Utility
 * Provides exponential backoff retry logic for transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Check if error is retryable (network, timeout, rate limit)
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const code = error.code || '';

  // Network errors
  if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ECONNREFUSED') {
    return true;
  }

  // HTTP errors
  if (error.status) {
    // 408 Request Timeout
    // 429 Too Many Requests
    // 502 Bad Gateway
    // 503 Service Unavailable
    // 504 Gateway Timeout
    if ([408, 429, 502, 503, 504].includes(error.status)) {
      return true;
    }
  }

  // Azure-specific errors
  if (message.includes('throttle') || message.includes('rate limit')) {
    return true;
  }

  // Git clone errors (temporary network issues)
  if (message.includes('failed to clone') || message.includes('could not resolve host')) {
    return true;
  }

  return false;
}

/**
 * Retry only if error is retryable
 */
export async function retryOnTransientError<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    ...options,
    onRetry: (error, attempt) => {
      if (!isRetryableError(error)) {
        console.log(`[Retry] Non-retryable error, failing immediately:`, error.message);
        throw error;
      }

      console.log(`[Retry] Attempt ${attempt} failed (retryable):`, error.message);
      options.onRetry?.(error, attempt);
    }
  });
}
