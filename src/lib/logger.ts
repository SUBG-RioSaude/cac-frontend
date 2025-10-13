/**
 * Sistema de logging estruturado para a aplicação
 * Suporta diferentes níveis de log e contexto adicional
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>;

export interface Logger {
  trace: (message: string | LogContext, context?: string | LogContext) => void
  debug: (message: string, context?: LogContext | string) => void
  info: (message: string, context?: LogContext | string) => void
  warn: (message: string, context?: LogContext | string) => void
  error: (message: string, context?: LogContext | string) => void
}

/**
 * Formata o contexto para exibição
 */
const formatContext = (context?: LogContext | string): string => {
  if (!context) return ''
  if (typeof context === 'string') return ` - ${context}`
  try {
    return ` - ${JSON.stringify(context)}`
  } catch {
    return ' - [Contexto não serializável]'
  }
}

/**
 * Cria um logger com prefixo de serviço
 */
export const createServiceLogger = (serviceName: string): Logger => {
  const prefix = `[${serviceName}]`

  return {
    trace: (message: string | LogContext, context?: string | LogContext) => {
      if (import.meta.env.DEV) {
        // Suporta duas assinaturas: (message, context) ou (context, message)
        if (typeof message === 'string') {
          console.debug(`${prefix} [TRACE] ${message}${formatContext(context)}`)
        } else {
          console.debug(`${prefix} [TRACE] ${context as string}${formatContext(message)}`)
        }
      }
    },

    debug: (message: string, context?: LogContext | string) => {
      if (import.meta.env.DEV) {
        console.debug(`${prefix} ${message}${formatContext(context)}`)
      }
    },

    info: (message: string | LogContext, context?: string | LogContext) => {
      // Suporta duas assinaturas: (message, context) ou (context, message)
      if (typeof message === 'string') {
        console.info(`${prefix} ${message}${formatContext(context)}`)
      } else {
        // Primeiro parâmetro é um objeto (contexto), segundo é a mensagem
        console.info(`${prefix} ${context as string}${formatContext(message)}`)
      }
    },

    warn: (message: string, context?: LogContext | string) => {
      console.warn(`${prefix} ⚠️ ${message}${formatContext(context)}`)
    },

    error: (message: string, context?: LogContext | string) => {
      console.error(`${prefix} ❌ ${message}${formatContext(context)}`)
    },
  }
}

/**
 * Cria um logger com prefixo de componente
 */
export const createComponentLogger = (componentName: string): Logger => {
  return createServiceLogger(`component:${componentName}`)
}

/**
 * Cria um logger com prefixo de hook
 */
export const createHookLogger = (hookName: string, module?: string): Logger => {
  const name = module ? `hook:${module}:${hookName}` : `hook:${hookName}`
  return createServiceLogger(name)
}

/**
 * Logger global padrão
 */
export const logger = createServiceLogger('app')
