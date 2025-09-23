import { createLogger } from './browser-logger'
import type { LogContext, StructuredLogger } from './types'

// Singleton logger instance
let loggerInstance: StructuredLogger

export const getLogger = (): StructuredLogger => {
  if (!loggerInstance) {
    loggerInstance = createLogger()
  }
  return loggerInstance
}

// Conveniência: logger global para uso direto
export const logger = getLogger()

// Factory functions para loggers com contexto específico
export const createModuleLogger = (
  module: string,
  component?: string,
): StructuredLogger => {
  return logger.withContext({ module, component })
}

export const createComponentLogger = (
  component: string,
  module?: string,
): StructuredLogger => {
  return logger.withContext({ module, component })
}

export const createServiceLogger = (service: string): StructuredLogger => {
  return logger.withContext({ module: 'service', component: service })
}

export const createHookLogger = (
  hook: string,
  module?: string,
): StructuredLogger => {
  return logger.withContext({ module: module || 'hooks', component: hook })
}

// Utility functions para contextos comuns
export const withUserContext = (
  userId: string,
  sessionId?: string,
): StructuredLogger => {
  return logger.withContext({ userId, sessionId })
}

export const withBusinessContext = (context: {
  contractId?: string
  companyId?: string
  unitId?: string
  supplierId?: string
  employeeId?: string
}): StructuredLogger => {
  return logger.withContext(context)
}

// Performance helpers
export const timeOperation = <T>(
  operationName: string,
  operation: () => T | Promise<T>,
  context?: LogContext,
): Promise<T> => {
  const timeEnd = logger.performance.time(operationName, context)

  const executeOperation = async (): Promise<T> => {
    try {
      const result = await Promise.resolve(operation())
      timeEnd()
      return result
    } catch (error) {
      timeEnd()
      logger.error(
        {
          ...context,
          error: error instanceof Error ? error.message : String(error),
          operation: operationName,
        },
        `Operation failed: ${operationName}`,
      )
      throw error
    }
  }

  return executeOperation()
}

// Error logging utilities
export const logError = (
  error: Error,
  context?: LogContext,
  customMessage?: string,
): void => {
  logger.error(
    {
      ...context,
      error: error.message,
      stack: error.stack,
      name: error.name,
    },
    customMessage || error.message,
  )
}

export const logWarning = (warning: string, context?: LogContext): void => {
  logger.warn(context || {}, warning)
}

export const logInfo = (message: string, context?: LogContext): void => {
  logger.info(context || {}, message)
}

export const logDebug = (message: string, context?: LogContext): void => {
  logger.debug(context || {}, message)
}

// Re-export types for convenience
export type {
  LogContext,
  StructuredLogger,
  LogLevel,
  LogEnvironment,
} from './types'

// Version info
export const LOGGER_VERSION = '1.0.0'
