import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth/auth-store'

interface ProtectedRouteProps {
  requireAuth?: boolean
  requireGuest?: boolean
  requirePasswordChange?: boolean
  require2FA?: boolean
  children?: React.ReactNode
}

// Componente para rotas que requerem autenticação completa
export function ProtectedRoute({ 
  requireAuth = true, 
  requireGuest = false, 
  requirePasswordChange = false,
  require2FA = false,
  children
}: ProtectedRouteProps) {
  const { usuario, estaAutenticado, carregando } = useAuthStore()
  const location = useLocation()

  // Aguarda a verificação inicial de autenticação
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Rota que requer usuário não autenticado (login, registro, etc.)
  if (requireGuest && estaAutenticado) {
    // Se já está autenticado, redireciona para a página principal
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
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
export function AuthGuard() {
  const { estaAutenticado, verificarAutenticacao } = useAuthStore()

  // Verifica autenticação ao montar o componente
  React.useEffect(() => {
    verificarAutenticacao()
  }, [verificarAutenticacao])

  if (!estaAutenticado) {
    return null
  }

  return <Outlet />
}

// Componente para rotas de autenticação (fluxo de login)
export function AuthFlowRoute() {
  const { estaAutenticado, usuario } = useAuthStore()

  // Se já está autenticado e não precisa trocar senha, redireciona
  if (estaAutenticado && !usuario?.precisaTrocarSenha) {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
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
export function AuthFlowGuard() {
  const { estaAutenticado, usuario } = useAuthStore()
  const location = useLocation()

  // Se não está autenticado, permite acesso às rotas de auth
  if (!estaAutenticado) {
    return <Outlet />
  }

  // Verifica se está no fluxo de recuperação de senha
  const contexto = sessionStorage.getItem('auth_context')
  const isPasswordRecoveryFlow = contexto === 'password_recovery' || contexto === 'password_reset'
  
  // Se está no fluxo de recuperação de senha, permite acesso às rotas de auth
  if (isPasswordRecoveryFlow) {
    return <Outlet />
  }

  // Se está autenticado mas precisa trocar senha
  if (estaAutenticado && usuario?.precisaTrocarSenha) {
    // Se não estiver na rota de troca de senha, redireciona
    if (location.pathname !== '/trocar-senha') {
      return <Navigate to="/trocar-senha" replace />
    }
    return <Outlet />
  }

  // Se está autenticado e não precisa trocar senha, redireciona para principal
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
  sessionStorage.removeItem('redirectAfterLogin')
  return <Navigate to={redirectPath} replace />
}
