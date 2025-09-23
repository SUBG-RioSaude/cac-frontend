import { useAuthStore } from '@/lib/auth/auth-store'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { hasAuthCookies } from '@/lib/auth/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const navigate = useNavigate()

  // Hook para verificar autenticação ao montar o componente
  const useAuthGuard = (requireAuth = true, requireGuest = false) => {
    const { estaAutenticado, carregando, verificarAutenticacao } = authStore

    useEffect(() => {
      // Verifica se existem cookies de autenticação
      if (hasAuthCookies()) {
        verificarAutenticacao()
      } else {
        // Se não há cookies, define como não autenticado
        // O store já gerencia isso automaticamente
      }
    }, [verificarAutenticacao])

    useEffect(() => {
      if (!carregando) {
        // Rota que requer autenticação
        if (requireAuth && !estaAutenticado) {
          const currentPath = window.location.pathname
          sessionStorage.setItem('redirectAfterLogin', currentPath)
          navigate('/login', { replace: true })
        }

        // Rota que requer usuário não autenticado
        if (requireGuest && estaAutenticado) {
          const redirectPath =
            sessionStorage.getItem('redirectAfterLogin') || '/'
          sessionStorage.removeItem('redirectAfterLogin')
          navigate(redirectPath, { replace: true })
        }
      }
    }, [estaAutenticado, carregando, requireAuth, requireGuest])

    return { estaAutenticado, carregando }
  }

  // Hook para redirecionar após login bem-sucedido
  const useRedirectAfterLogin = () => {
    const { estaAutenticado } = authStore

    useEffect(() => {
      if (estaAutenticado) {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      }
    }, [estaAutenticado])

    return { estaAutenticado }
  }

  // Hook para verificar se precisa trocar senha
  const useCheckPasswordChange = () => {
    const { usuario, estaAutenticado } = authStore

    useEffect(() => {
      if (estaAutenticado && usuario?.precisaTrocarSenha) {
        navigate('/trocar-senha', { replace: true })
      }
    }, [estaAutenticado, usuario])

    return { usuario, estaAutenticado }
  }

  return {
    ...authStore,
    useAuthGuard,
    useRedirectAfterLogin,
    useCheckPasswordChange,
  }
}
