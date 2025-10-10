import type {
  LoggerConfig,
  LogEnvironment,
  BrowserLoggerTransport,
} from './types'

const getEnvironment = (): LogEnvironment => {
  if (import.meta.env.NODE_ENV === 'test') return 'test'
  if (import.meta.env.NODE_ENV === 'production') return 'production'
  return 'development'
}

const isDevelopment = getEnvironment() === 'development'
const isProduction = getEnvironment() === 'production'
const isTest = getEnvironment() === 'test'

export const loggerConfig: LoggerConfig = {
  level: isDevelopment ? 'debug' : isProduction ? 'info' : 'silent',
  environment: getEnvironment(),
  pretty: isDevelopment,
  redact: [
    'password',
    'token',
    'authorization',
    'cookie',
    'refreshToken',
    'accessToken',
    'cpf',
    'rg',
    'cnpj',
  ],
  base: {
    app: 'cac-frontend',
    version: '1.0.0',
    environment: getEnvironment(),
    timestamp: () => Date.now(),
  },
}

export const browserTransports: BrowserLoggerTransport[] = [
  {
    level: isDevelopment ? 'trace' : 'info',
    target: 'console',
    options: {
      colorize: isDevelopment,
      levelFirst: true,
      translateTime: isDevelopment ? 'HH:MM:ss' : false,
      ignore: isProduction ? 'pid,hostname' : undefined,
    },
  },
]

export const performanceConfig = {
  enabled: !isTest,
  threshold: {
    slow: 1000, // 1s
    very_slow: 5000, // 5s
  },
}

export const contextDefaults = {
  app: 'cac-frontend',
  environment: getEnvironment(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  url: typeof window !== 'undefined' ? window.location.href : undefined,
}
