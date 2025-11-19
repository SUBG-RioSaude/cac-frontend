import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

import type { Usuario } from '@/types/auth'

import { createServiceLogger } from '../logger'

import { hasAuthCookies } from './auth'
import { useMeQuery } from './auth-queries'
import { useAuthStore } from './auth-store'

const authContextLogger = createServiceLogger('auth-context')

interface AuthContextValue {
  usuario: Usuario | null
  estaAutenticado: boolean
  carregando: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient()

  // Estado reativo para cookies
  const [hasCookies, setHasCookies] = useState(hasAuthCookies())

  // Só busca usuário atual se houver cookies válidos
  const {
    data: usuario,
    isLoading,
    error,
  } = useMeQuery({
    enabled: hasCookies,
  })

  // Monitora invalidação da query 'me' para atualizar hasCookies
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        const { queryKey } = event.query
        if (Array.isArray(queryKey) && queryKey[0] === 'me') {
          const cookiesExistem = hasAuthCookies()
          authContextLogger.debug(
            {
              eventType: event.type,
              cookiesExistem,
            },
            'Query cache atualizada, verificando cookies',
          )
          setHasCookies(cookiesExistem)
        }
      }
    })

    return () => unsubscribe()
  }, [queryClient])

  // Verifica cookies periodicamente para detectar mudanças
  // IMPORTANTE: Roda sempre, não apenas quando isLoading, para detectar
  // quando tokens são adicionados (ex: após troca de senha)
  useEffect(() => {
    const interval = setInterval(() => {
      const cookiesExistem = hasAuthCookies()
      setHasCookies((prev) => {
        if (cookiesExistem !== prev) {
          authContextLogger.debug(
            {
              cookiesExistem,
              hasCookiesPrevious: prev,
              isLoading,
            },
            'Cookies mudaram - polling detectou alteração',
          )
          return cookiesExistem
        }
        return prev
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  // Renovação proativa de token a cada 12 minutos (80% do tempo de vida de 15min)
  useEffect(() => {
    // Só ativa se estiver autenticado
    if (!hasCookies || !usuario) {
      authContextLogger.debug(
        {
          action: 'token-renewal-timer',
          status: 'not-started',
          hasCookies,
          hasUsuario: !!usuario
        },
        'Timer de renovação NÃO iniciado - falta cookies ou usuário',
      )
      return
    }

    authContextLogger.info(
      {
        action: 'token-renewal-timer',
        status: 'started',
        hasCookies,
        usuarioId: usuario.id,
        usuarioEmail: usuario.email
      },
      '🟢 Timer de renovação proativa INICIADO (intervalo: 12 minutos)',
    )

    const interval = setInterval(async () => {
      // Verifica se o token realmente precisa ser renovado antes de tentar
      const { getToken, isTokenNearExpiry } = await import('./auth')
      const token = getToken()

      if (!token) {
        authContextLogger.warn(
          { action: 'token-renewal-timer', status: 'no-token' },
          'Token não encontrado, pulando renovação proativa',
        )
        return
      }

      // Apenas renova se estiver próximo de expirar (menos de 5 minutos)
      if (isTokenNearExpiry(token, 5)) {
        authContextLogger.info(
          { action: 'token-renewal-timer', status: 'executing' },
          '🔄 Token próximo de expirar, renovando proativamente',
        )
        const renovado = await useAuthStore.getState().renovarToken()
        if (!renovado) {
          authContextLogger.warn(
            { action: 'token-renewal-timer', status: 'failed' },
            'Falha na renovação proativa, próxima tentativa em 12min',
          )
        }
      } else {
        authContextLogger.debug(
          { action: 'token-renewal-timer', status: 'skipped' },
          'Token ainda válido, renovação proativa não necessária',
        )
      }
    }, 12 * 60 * 1000) // 12 minutos

    return () => {
      authContextLogger.warn(
        {
          action: 'token-renewal-timer',
          status: 'stopped',
          hasCookies,
          hasUsuario: !!usuario,
          usuarioId: usuario?.id
        },
        '🔴 Timer de renovação proativa ENCERRADO - dependências mudaram!',
      )
      clearInterval(interval)
    }
  }, [hasCookies, usuario])

  // ⭐ LOG ADICIONAL: Monitora mudanças nas dependências do timer
  useEffect(() => {
    authContextLogger.debug(
      {
        action: 'timer-dependencies-changed',
        hasCookies,
        hasUsuario: !!usuario,
        usuarioId: usuario?.id,
        usuarioEmail: usuario?.email,
      },
      '🔄 Dependências do timer mudaram (hasCookies ou usuario)',
    )
  }, [hasCookies, usuario])

  const value: AuthContextValue = {
    usuario: usuario ?? null,
    estaAutenticado: hasCookies && !!usuario,
    carregando: hasCookies ? isLoading : false,
  }

  // Debug logs
  useEffect(() => {
    authContextLogger.debug(
      {
        hasCookies,
        hasUsuario: !!usuario,
        isLoading,
        hasError: !!error,
        estaAutenticado: value.estaAutenticado,
        usuarioId: usuario?.id,
        usuarioEmail: usuario?.email,
      },
      'AuthContext state atualizado',
    )
  }, [hasCookies, usuario, isLoading, error, value.estaAutenticado])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para acessar o contexto de autenticação
 *
 * @returns Objeto com usuario, estaAutenticado e carregando
 * @throws Error se usado fora do AuthProvider
 *
 * @example
 * ```tsx
 * const { usuario, estaAutenticado, carregando } = useAuth()
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}
