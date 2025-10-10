import type { Logger as PinoLogger, Level, LevelWithSilent } from 'pino'

export type LogLevel = Level
export type LogLevelWithSilent = LevelWithSilent

export type LogEnvironment = 'development' | 'production' | 'test'

export interface LogContext {
  module?: string
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  requestId?: string
  contractId?: string
  companyId?: string
  unitId?: string
  supplierId?: string
  employeeId?: string
  [key: string]: unknown
}

export interface LoggerConfig {
  level: LogLevelWithSilent
  environment: LogEnvironment
  pretty?: boolean
  redact?: string[]
  base?: Record<string, unknown>
}

export interface StructuredLogger {
  readonly raw: PinoLogger
  withContext: (context: LogContext) => StructuredLogger
  performance: {
    time: (label: string, context?: LogContext) => () => void
    mark: (label: string, context?: LogContext) => void
  }
  error: (
    context: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) => void
  warn: (context: LogContext | string, msg?: string, ...args: unknown[]) => void
  info: (context: LogContext | string, msg?: string, ...args: unknown[]) => void
  debug: (
    context: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) => void
  trace: (
    context: LogContext | string,
    msg?: string,
    ...args: unknown[]
  ) => void
  fatal: (
    context: LogContext | Error | string,
    msg?: string,
    ...args: unknown[]
  ) => void
}

export interface BrowserLoggerTransport {
  level: LogLevel
  target: 'console' | 'storage' | 'remote'
  options?: {
    colorize?: boolean
    levelFirst?: boolean
    translateTime?: boolean | string
    ignore?: string
  }
}

export interface LogMetrics {
  timestamp: number
  level: LogLevel
  message: string
  context: LogContext
  stack?: string
  performance?: {
    duration?: number
    memory?: number
  }
  extra?: unknown[]
}
