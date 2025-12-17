/**
 * Structured logging utility for debugging production issues
 * Provides verbose error context for network failures, database operations, and API calls
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  operation?: string
  collection?: string
  cartId?: string
  orderId?: string
  productId?: string
  endpoint?: string
  method?: string
  duration?: number
  statusCode?: number
  [key: string]: unknown
}

interface ErrorDetails {
  message: string
  name?: string
  stack?: string
  cause?: unknown
  code?: string
  digest?: string
}

function getTimestamp(): string {
  return new Date().toISOString()
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function extractErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    const details: ErrorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }

    // Extract cause chain for network errors
    if ('cause' in error && error.cause) {
      details.cause = extractErrorDetails(error.cause)
    }

    // Extract digest for Next.js errors
    if ('digest' in error) {
      details.digest = String((error as any).digest)
    }

    // Extract error code (common for network errors)
    if ('code' in error) {
      details.code = String((error as any).code)
    }

    return details
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return { message: String(error) }
}

function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): string {
  const logObject: Record<string, unknown> = {
    timestamp: getTimestamp(),
    level: level.toUpperCase(),
    message,
    env: process.env.NODE_ENV,
  }

  if (context) {
    logObject.context = context
  }

  if (error) {
    logObject.error = extractErrorDetails(error)
  }

  return JSON.stringify(logObject)
}

function log(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
  const formatted = formatLog(level, message, context, error)

  switch (level) {
    case 'debug':
      if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
        console.debug(formatted)
      }
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: unknown) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) => log('error', message, context, error),

  /**
   * Log an operation with timing
   */
  async withTiming<T>(
    operation: string,
    context: LogContext,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    const requestId = context.requestId || generateRequestId()

    logger.debug(`Starting ${operation}`, { ...context, requestId })

    try {
      const result = await fn()
      const duration = Date.now() - startTime

      logger.debug(`Completed ${operation}`, { ...context, requestId, duration })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error(`Failed ${operation}`, { ...context, requestId, duration }, error)

      throw error
    }
  },

  /**
   * Create a scoped logger for a specific request/operation
   */
  scope(baseContext: LogContext) {
    const requestId = baseContext.requestId || generateRequestId()
    const scopedContext = { ...baseContext, requestId }

    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...scopedContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...scopedContext, ...context }),
      warn: (message: string, context?: LogContext, error?: unknown) =>
        logger.warn(message, { ...scopedContext, ...context }, error),
      error: (message: string, context?: LogContext, error?: unknown) =>
        logger.error(message, { ...scopedContext, ...context }, error),
      requestId,
    }
  },
}

/**
 * Enhanced fetch wrapper with automatic logging
 */
export async function fetchWithLogging(
  url: string,
  options?: RequestInit & { operation?: string }
): Promise<Response> {
  const startTime = Date.now()
  const requestId = generateRequestId()
  const method = options?.method || 'GET'
  const operation = options?.operation || `${method} ${url}`

  logger.debug(`Fetch request started`, {
    requestId,
    operation,
    endpoint: url,
    method,
  })

  try {
    const response = await fetch(url, options)
    const duration = Date.now() - startTime

    if (!response.ok) {
      logger.warn(`Fetch request failed with status ${response.status}`, {
        requestId,
        operation,
        endpoint: url,
        method,
        statusCode: response.status,
        duration,
      })
    } else {
      logger.debug(`Fetch request completed`, {
        requestId,
        operation,
        endpoint: url,
        method,
        statusCode: response.status,
        duration,
      })
    }

    return response
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error(`Fetch request error`, {
      requestId,
      operation,
      endpoint: url,
      method,
      duration,
    }, error)

    throw error
  }
}

export { generateRequestId }
