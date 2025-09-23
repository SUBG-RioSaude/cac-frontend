import pino from 'pino'
import type { StructuredLogger, LogContext, LogMetrics } from './types'
import {
  loggerConfig,
  browserTransports,
  performanceConfig,
  contextDefaults,
} from './config'

class BrowserLogger {
  private logger: pino.Logger
  private context: LogContext = {}
  private timers: Map<string, number> = new Map()

  constructor() {
    this.logger = pino({
      level: loggerConfig.level,
      browser: {
        asObject: true,
        serialize: true,
        transmit: {
          level: loggerConfig.level,
          send: this.handleLog.bind(this),
        },
      },
      base: loggerConfig.base,
      redact: loggerConfig.redact,
      formatters: {
        level: (label: string) => ({ level: label }),
        log: (object: Record<string, unknown>) => ({
          ...contextDefaults,
          ...this.context,
          ...object,
          timestamp: new Date().toISOString(),
        }),
      },
    })
  }

  private handleLog(level: string, logEvent: LogMetrics) {
    if (loggerConfig.environment === 'test') return

    const formattedLog = this.formatForConsole(level, logEvent)

    switch (level) {
      case 'trace':
      case 'debug':
        if (loggerConfig.environment === 'development') {
          console.debug(formattedLog)
        }
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
      case 'fatal':
        console.error(formattedLog)
        break
      default:
        console.log(formattedLog)
    }
  }

  private formatForConsole(level: string, logEvent: LogMetrics): string {
    if (!loggerConfig.pretty) {
      return JSON.stringify(logEvent)
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const levelFormatted = level.toUpperCase().padEnd(5)
    const module = logEvent.context?.module
      ? `[${logEvent.context.module}]`
      : ''
    const component = logEvent.context?.component
      ? `[${logEvent.context.component}]`
      : ''

    let message = `${timestamp} ${levelFormatted} ${module}${component} ${logEvent.message}`

    // Adicionar contexto relevante
    if (logEvent.context) {
      const relevantContext = { ...logEvent.context }
      delete relevantContext.module
      delete relevantContext.component

      if (Object.keys(relevantContext).length > 0) {
        message += ` | ${JSON.stringify(relevantContext)}`
      }
    }

    return message
  }

  withContext(newContext: LogContext): StructuredLogger {
    const logger = new BrowserLogger()
    logger.context = { ...this.context, ...newContext }
    return logger as StructuredLogger
  }

  private logWithContext(
    level: string,
    contextOrMessage: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) {
    let context: LogContext = {}
    let message: string = ''

    if (typeof contextOrMessage === 'string') {
      message = contextOrMessage
    } else if (contextOrMessage instanceof Error) {
      context = {
        error: contextOrMessage.message,
        stack: contextOrMessage.stack,
        name: contextOrMessage.name,
      }
      message = msg || contextOrMessage.message
    } else {
      context = contextOrMessage
      message = msg || 'Log entry'
    }

    const finalContext = { ...this.context, ...context }

    this.logger[level as keyof pino.Logger](finalContext, message, ...args)
  }

  // Métodos de logging
  trace(
    contextOrMessage: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('trace', contextOrMessage, msg, ...args)
  }

  debug(
    contextOrMessage: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('debug', contextOrMessage, msg, ...args)
  }

  info(
    contextOrMessage: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('info', contextOrMessage, msg, ...args)
  }

  warn(
    contextOrMessage: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('warn', contextOrMessage, msg, ...args)
  }

  error(
    contextOrMessage: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('error', contextOrMessage, msg, ...args)
  }

  fatal(
    contextOrMessage: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) {
    this.logWithContext('fatal', contextOrMessage, msg, ...args)
  }

  // Performance tracking
  performance = {
    time: (label: string, context: LogContext = {}) => {
      if (!performanceConfig.enabled) return () => {}

      const startTime = performance.now()
      this.timers.set(label, startTime)

      this.debug(
        {
          ...context,
          performance: { action: 'start', label },
        },
        `Performance timer started: ${label}`,
      )

      return () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        this.timers.delete(label)

        const perfContext = {
          ...context,
          performance: {
            action: 'end',
            label,
            duration: Math.round(duration),
            slow: duration > performanceConfig.threshold.slow,
            very_slow: duration > performanceConfig.threshold.very_slow,
          },
        }

        if (duration > performanceConfig.threshold.very_slow) {
          this.warn(
            perfContext,
            `Performance timer completed (VERY SLOW): ${label} took ${duration.toFixed(2)}ms`,
          )
        } else if (duration > performanceConfig.threshold.slow) {
          this.warn(
            perfContext,
            `Performance timer completed (SLOW): ${label} took ${duration.toFixed(2)}ms`,
          )
        } else {
          this.debug(
            perfContext,
            `Performance timer completed: ${label} took ${duration.toFixed(2)}ms`,
          )
        }
      }
    },

    mark: (label: string, context: LogContext = {}) => {
      if (!performanceConfig.enabled) return

      this.debug(
        {
          ...context,
          performance: { action: 'mark', label, timestamp: performance.now() },
        },
        `Performance mark: ${label}`,
      )
    },
  }
}

export const createLogger = (): StructuredLogger => {
  return new BrowserLogger() as StructuredLogger
}
