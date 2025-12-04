/**
 * Centralized logging utility
 * In production, consider integrating with Sentry or similar service
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage('info', message, context)
    console.log(formatted)
    // In production, send to logging service
    if (!this.isDevelopment) {
      // TODO: Send to logging service (Sentry, LogRocket, etc.)
    }
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted)
    if (!this.isDevelopment) {
      // TODO: Send to logging service
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    }
    const formatted = this.formatMessage('error', message, errorContext)
    console.error(formatted)
    
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      // TODO: Send to Sentry or similar
      // Example: Sentry.captureException(error, { extra: context })
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context)
      console.debug(formatted)
    }
  }
}

export const logger = new Logger()



