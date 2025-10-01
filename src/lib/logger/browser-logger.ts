/* eslint-disable no-console */
import pino, { type Level, type LogEvent } from 'pino'

import {
  loggerConfig,
  performanceConfig,
  contextDefaults,
} from './config'
import type {
  StructuredLogger,
  LogContext,
  LogMetrics,
  LogLevel,
} from './types'


const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const normalizeMessage = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message
  if (value === undefined) return ''
  if (value === null) return 'null'

  // Verifica se é um objeto simples para evitar [object Object]
  if (typeof value === 'object') {
    try {
      // Serializa objeto para JSON
      return JSON.stringify(value, null, 0)
    } catch {
      return '[Object]'
    }
  }

  // Converte primitivos para string (boolean, number, symbol, bigint)
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(value)
}

class BrowserLogger implements StructuredLogger {
  readonly raw: pino.Logger
  private context: LogContext = {}
  private timers = new Map<string, number>()

  constructor() {
    this.raw = pino({
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

  private handleLog(level: Level, logEvent: LogEvent) {
    if (loggerConfig.environment === 'test') return

    const metrics = this.createLogMetrics(level, logEvent)
    const formattedLog = this.formatForConsole(metrics.level, metrics)

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

  private createLogMetrics(level: Level, logEvent: LogEvent): LogMetrics {
    // Cria cópia tipada das mensagens
    const messages = Array.from(logEvent.messages) as unknown[]

    let context: LogContext = {}
    if (messages.length > 0 && isPlainObject(messages[0])) {
      context = messages.shift() as LogContext
    }

    const message = normalizeMessage(messages.shift())

    return {
      timestamp: logEvent.ts,
      level,
      message,
      context: {
        ...contextDefaults,
        ...this.context,
        ...context,
      },
      extra: messages,
    }
  }

  private formatForConsole(level: LogLevel, logEvent: LogMetrics): string {
    if (!loggerConfig.pretty) {
      return JSON.stringify(logEvent)
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR')
    const levelFormatted = level.toUpperCase().padEnd(5)
    const module = logEvent.context.module
      ? `[${logEvent.context.module}]`
      : ''
    const component = logEvent.context.component
      ? `[${logEvent.context.component}]`
      : ''

    let message = `${timestamp} ${levelFormatted} ${module}${component} ${logEvent.message}`

    // Adicionar contexto relevante
    const relevantContext = { ...logEvent.context }
    delete relevantContext.module
    delete relevantContext.component

    if (Object.keys(relevantContext).length > 0) {
      message += ` | ${JSON.stringify(relevantContext)}`
    }

    if (logEvent.extra && logEvent.extra.length > 0) {
      message += ` | extras: ${logEvent.extra.map(normalizeMessage).join(' ')}`
    }

    return message
  }

  withContext(newContext: LogContext): StructuredLogger {
    const logger = new BrowserLogger()
    logger.context = { ...this.context, ...newContext }
    return logger
  }

  private logWithContext(
    level: LogLevel,
    contextOrMessage: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) {
    let context: LogContext = {}
    let message = ''

    if (typeof contextOrMessage === 'string') {
      message = contextOrMessage
    } else if (contextOrMessage instanceof Error) {
      context = {
        error: contextOrMessage.message,
        stack: contextOrMessage.stack,
        name: contextOrMessage.name,
      }
      message = msg ?? contextOrMessage.message
    } else {
      context = contextOrMessage
      message = msg ?? 'Log entry'
    }

    const finalContext = { ...this.context, ...context }

    switch (level) {
      case 'trace':
        this.raw.trace(finalContext, message, ...args)
        break
      case 'debug':
        this.raw.debug(finalContext, message, ...args)
        break
      case 'info':
        this.raw.info(finalContext, message, ...args)
        break
      case 'warn':
        this.raw.warn(finalContext, message, ...args)
        break
      case 'error':
        this.raw.error(finalContext, message, ...args)
        break
      case 'fatal':
        this.raw.fatal(finalContext, message, ...args)
        break
      default:
        this.raw.info(finalContext, message, ...args)
    }
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
      if (!performanceConfig.enabled) {
        return () => {
          // Performance tracking is disabled
        }
      }

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
  return new BrowserLogger()
}
