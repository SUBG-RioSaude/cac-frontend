import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { hasAuthCookies } from '@/lib/auth/auth'
import { useAuth } from '@/lib/auth/auth-context'
import { useLogoutMutation } from '@/lib/auth/auth-queries'
import { createServiceLogger } from '@/lib/logger'

const middlewareLogger = createServiceLogger('middleware')

// Flag global para indicar que logout está em andamento
// Previne múltiplas chamadas de logout simultâneas
let logoutEmAndamento = false

export const setLogoutEmAndamento = (valor: boolean) => {
  logoutEmAndamento = valor
}

interface ProtectedRouteProps {
  requireAuth?: boolean
  requireGuest?: boolean
  requirePasswordChange?: boolean
  require2FA?: boolean
  children?: React.ReactNode
}

// Componente para rotas que requerem autenticação completa
export const ProtectedRoute = ({
  requireAuth = true,
  requireGuest = false,
  requirePasswordChange = false,
  require2FA = false,
  children,
}: ProtectedRouteProps) => {
  const { usuario, estaAutenticado, carregando } = useAuth()
  const logoutMutation = useLogoutMutation()
  const location = useLocation()
  const [deveRedirecionar, setDeveRedirecionar] = React.useState(false)

  // Flag para prevenir múltiplas chamadas de logout
  const logoutEmAndamentoRef = React.useRef(false)

  // Função memorizada para realizar logout (evita recriação a cada render)
  const realizarLogoutPorInconsistencia = React.useCallback(() => {
    // Previne múltiplas chamadas se já houver logout em andamento (local ou global)
    if (logoutEmAndamentoRef.current || logoutMutation.isPending || logoutEmAndamento) {
      middlewareLogger.debug(
        { action: 'protected-route', status: 'logout-already-pending' },
        'Logout já está em andamento, ignorando nova tentativa',
      )
      return
    }

    middlewareLogger.warn(
      { action: 'protected-route', status: 'inconsistent-state' },
      'Store indica autenticado mas cookies não existem - fazendo logout',
    )

    logoutEmAndamentoRef.current = true
    logoutEmAndamento = true

    // Salva rota para redirecionamento após login
    sessionStorage.setItem('redirectAfterLogin', location.pathname)

    // Executa logout que fará reload via window.location.href
    // As flags serão resetadas automaticamente pelo reload
    logoutMutation.mutate()
    setDeveRedirecionar(true)
  }, [logoutMutation, location.pathname])

  // Validação de consistência: se store diz autenticado mas cookies não existem
  // Movido para useEffect para evitar setState durante render
  // Com debounce para evitar race condition após login
  React.useEffect(() => {
    if (!requireAuth || !estaAutenticado) {
      // Reseta flag quando não está mais autenticado
      logoutEmAndamentoRef.current = false
      return
    }

    // Aguarda 500ms para garantir que cookies foram salvos no document.cookie
    // Aumentado de 300ms para 500ms para evitar race conditions
    const timeoutId = setTimeout(() => {
      if (!hasAuthCookies()) {
        realizarLogoutPorInconsistencia()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [requireAuth, estaAutenticado, realizarLogoutPorInconsistencia])

  // Aguarda a verificação inicial de autenticação
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redireciona para login se detectada inconsistência
  if (deveRedirecionar) {
    return <Navigate to="/login" replace />
  }

  // Rota que requer usuário não autenticado (login, registro, etc.)
  if (requireGuest && estaAutenticado) {
    // Se já está autenticado, redireciona para a página principal
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') ?? '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return <Navigate to={redirectPath} replace />
  }

  // Rota que requer autenticação
  if (requireAuth && !estaAutenticado) {
    // Salva a rota atual para redirecionamento após login
    sessionStorage.setItem('redirectAfterLogin', location.pathname)
    return <Navigate to="/login" replace />
  }

  // Rota que requer troca de senha obrigatória
  if (requirePasswordChange && estaAutenticado && usuario?.precisaTrocarSenha) {
    return <Navigate to="/trocar-senha" replace />
  }

  // Rota que requer verificação 2FA
  if (require2FA && estaAutenticado && !usuario?.emailConfirmado) {
    return <Navigate to="/verificar-codigo" replace />
  }

  // Verifica se o usuário precisa trocar a senha (redirecionamento automático)
  if (requireAuth && estaAutenticado && usuario?.precisaTrocarSenha) {
    return <Navigate to="/trocar-senha" replace />
  }

  // Se tem children, renderiza os children, senão usa Outlet
  return children ? <>{children}</> : <Outlet />
}

// Componente para verificação de autenticação ao montar componentes
export const AuthGuard = () => {
  const { estaAutenticado } = useAuth()

  // Com TanStack Query, não precisa verificar manualmente
  // O useMeQuery já faz isso automaticamente

  if (!estaAutenticado) {
    return null
  }

  return <Outlet />
}

// Componente para rotas de autenticação (fluxo de login)
export const AuthFlowRoute = () => {
  const { estaAutenticado, usuario } = useAuth()

  // Se já está autenticado e não precisa trocar senha, redireciona
  if (estaAutenticado && !usuario?.precisaTrocarSenha) {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') ?? '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return <Navigate to={redirectPath} replace />
  }

  // Se precisa trocar senha, redireciona para troca de senha
  if (estaAutenticado && usuario?.precisaTrocarSenha) {
    return <Navigate to="/trocar-senha" replace />
  }

  return <Outlet />
}

// Componente para verificação de fluxo de autenticação
export const AuthFlowGuard = () => {
  const { estaAutenticado, usuario } = useAuth()
  const location = useLocation()

  // Se não está autenticado, permite acesso às rotas de auth
  if (!estaAutenticado) {
    return <Outlet />
  }

  // Se está autenticado mas precisa trocar senha
  if (usuario?.precisaTrocarSenha) {
    // Se não estiver na rota de troca de senha, redireciona
    if (location.pathname !== '/trocar-senha') {
      return <Navigate to="/trocar-senha" replace />
    }
    return <Outlet />
  }

  // Se está autenticado e não precisa trocar senha, redireciona para principal
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') ?? '/'
  sessionStorage.removeItem('redirectAfterLogin')
  return <Navigate to={redirectPath} replace />
}
