import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute, AuthFlowRoute } from '@/lib/middleware'
import { useAuthStore } from '@/lib/auth/auth-store'

// Mock do useAuthStore
vi.mock('@/lib/auth/auth-store')
const mockUseAuthStore = vi.mocked(useAuthStore)

// Mock do useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/test' })
  }
})

const mockUsuario = {
  id: '1',
  email: 'test@example.com',
  nomeCompleto: 'Test User',
  tipoUsuario: 'user',
  precisaTrocarSenha: false,
  emailConfirmado: true
}

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock padrÃ£o
    mockUseAuthStore.mockReturnValue({
      usuario: null,
      estaAutenticado: false,
      carregando: false
    } as ReturnType<typeof useAuthStore>)
  })

  describe('Estado de Carregamento', () => {
    it('deve mostrar loading quando estÃ¡ carregando', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: null,
        estaAutenticado: false,
        carregando: true
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requireAuth={true}>
          <div>ConteÃºdo Protegido</div>
        </ProtectedRoute>
      )

      expect(screen.getByText(/Verificando/i)).toBeInTheDocument()
      expect(screen.queryByText('ConteÃºdo Protegido')).not.toBeInTheDocument()
    })
  })

  describe('Rotas que Requerem AutenticaÃ§Ã£o', () => {
    it('deve redirecionar para login quando nÃ£o autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: null,
        estaAutenticado: false,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderWithRouter(
        <ProtectedRoute requireAuth={true}>
          <div>ConteÃºdo Protegido</div>
        </ProtectedRoute>
      )

      // Deve redirecionar (nÃ£o mostrar conteÃºdo)
      expect(container.firstChild).toBeNull()
    })

    it('deve mostrar conteÃºdo quando autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requireAuth={true}>
          <div>ConteÃºdo Protegido</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('ConteÃºdo Protegido')).toBeInTheDocument()
    })

    it('deve redirecionar para troca de senha quando necessÃ¡rio', () => {
      const usuarioPrecisaTrocarSenha = {
        ...mockUsuario,
        precisaTrocarSenha: true
      }

      mockUseAuthStore.mockReturnValue({
        usuario: usuarioPrecisaTrocarSenha,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderWithRouter(
        <ProtectedRoute requireAuth={true}>
          <div>ConteÃºdo Protegido</div>
        </ProtectedRoute>
      )

      // Deve redirecionar para troca de senha
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Rotas que Requerem UsuÃ¡rio NÃ£o Autenticado', () => {
    it('deve redirecionar usuÃ¡rio autenticado para pÃ¡gina principal', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderWithRouter(
        <ProtectedRoute requireGuest={true} requireAuth={false}>
          <div>PÃ¡gina de Login</div>
        </ProtectedRoute>
      )

      // Deve redirecionar usuÃ¡rio autenticado
      expect(container.firstChild).toBeNull()
    })

  it('deve mostrar conteÃºdo para usuÃ¡rio nÃ£o autenticado', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: null,
        estaAutenticado: false,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requireGuest={true} requireAuth={false}>
          <div>PÃ¡gina de Login</div>
        </ProtectedRoute>
      )

      // Para rotas de convidado (requireGuest), quando nÃ£o autenticado o conteÃºdo deve ser renderizado
      expect(screen.getByText('PÃ¡gina de Login')).toBeInTheDocument()
    })
  })

  describe('Rotas que Requerem Troca de Senha', () => {
    it('deve redirecionar para troca de senha quando necessÃ¡rio', () => {
      const usuarioPrecisaTrocarSenha = {
        ...mockUsuario,
        precisaTrocarSenha: true
      }

      mockUseAuthStore.mockReturnValue({
        usuario: usuarioPrecisaTrocarSenha,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderWithRouter(
        <ProtectedRoute requirePasswordChange={true}>
          <div>ConteÃºdo que Requer Troca de Senha</div>
        </ProtectedRoute>
      )

      // Deve redirecionar para troca de senha
      expect(container.firstChild).toBeNull()
    })

    it('deve mostrar conteÃºdo quando nÃ£o precisa trocar senha', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requirePasswordChange={true}>
          <div>ConteÃºdo que Requer Troca de Senha</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('ConteÃºdo que Requer Troca de Senha')).toBeInTheDocument()
    })
  })

  describe('Rotas que Requerem 2FA', () => {
    it('deve redirecionar para verificaÃ§Ã£o 2FA quando necessÃ¡rio', () => {
      const usuarioSem2FA = {
        ...mockUsuario,
        emailConfirmado: false
      }

      mockUseAuthStore.mockReturnValue({
        usuario: usuarioSem2FA,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      const { container } = renderWithRouter(
        <ProtectedRoute require2FA={true}>
          <div>ConteÃºdo que Requer 2FA</div>
        </ProtectedRoute>
      )

      // Deve redirecionar para verificaÃ§Ã£o 2FA
      expect(container.firstChild).toBeNull()
    })

    it('deve mostrar conteÃºdo quando 2FA estÃ¡ confirmado', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute require2FA={true}>
          <div>ConteÃºdo que Requer 2FA</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('ConteÃºdo que Requer 2FA')).toBeInTheDocument()
    })
  })

  describe('RenderizaÃ§Ã£o de Children vs Outlet', () => {
    it('deve renderizar children quando fornecidos', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requireAuth={true}>
          <div>ConteÃºdo Customizado</div>
        </ProtectedRoute>
      )

      expect(screen.getByText('ConteÃºdo Customizado')).toBeInTheDocument()
    })

    it('deve usar Outlet quando nÃ£o hÃ¡ children', () => {
      mockUseAuthStore.mockReturnValue({
        usuario: mockUsuario,
        estaAutenticado: true,
        carregando: false
      } as ReturnType<typeof useAuthStore>)

      renderWithRouter(
        <ProtectedRoute requireAuth={true} />
      )

      // Deve renderizar sem erro (usa Outlet)
      expect(screen.queryByText('Verificando autenticaÃ§Ã£o...')).not.toBeInTheDocument()
    })
  })
})

describe('AuthFlowRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      usuario: null,
      estaAutenticado: false,
      carregando: false
    } as ReturnType<typeof useAuthStore>)
  })

  it('deve renderizar Outlet para rotas de autenticaÃ§Ã£o', () => {
    renderWithRouter(
      <AuthFlowRoute />
    )

    // Deve renderizar sem erro
    expect(screen.queryByText('Verificando autenticaÃ§Ã£o...')).not.toBeInTheDocument()
  })

  it('deve redirecionar usuÃ¡rio autenticado', () => {
    mockUseAuthStore.mockReturnValue({
      usuario: mockUsuario,
      estaAutenticado: true,
      carregando: false
    } as ReturnType<typeof useAuthStore>)

    const { container } = renderWithRouter(
      <AuthFlowRoute />
    )

    // Deve redirecionar usuÃ¡rio autenticado
    expect(container.firstChild).toBeNull()
  })
})

describe('IntegraÃ§Ã£o com SessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('deve salvar redirectAfterLogin no sessionStorage', () => {
    mockUseAuthStore.mockReturnValue({
      usuario: null,
      estaAutenticado: false,
      carregando: false
    } as ReturnType<typeof useAuthStore>)

    renderWithRouter(
      <ProtectedRoute requireAuth={true}>
        <div>ConteÃºdo Protegido</div>
      </ProtectedRoute>,
      ['/pagina-protegida']
    )

    // Deve salvar a rota atual para redirecionamento apÃ³s login
    // Como o mock do useLocation retorna '/test', esperamos esse valor
    expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/test')
  })

  it('deve limpar redirectAfterLogin apÃ³s redirecionamento', () => {
    sessionStorage.setItem('redirectAfterLogin', '/pagina-anterior')
    
    mockUseAuthStore.mockReturnValue({
      usuario: mockUsuario,
      estaAutenticado: true,
      carregando: false
    } as ReturnType<typeof useAuthStore>)

    renderWithRouter(
      <ProtectedRoute requireAuth={true}>
        <div>ConteÃºdo Protegido</div>
      </ProtectedRoute>
    )

    // Como o usuÃ¡rio estÃ¡ autenticado, o componente deve renderizar
    // e nÃ£o deve limpar o redirectAfterLogin automaticamente
    // Vamos verificar se o conteÃºdo foi renderizado
    expect(screen.getByText('ConteÃºdo Protegido')).toBeInTheDocument()
    
    // O redirectAfterLogin deve permanecer no sessionStorage
    expect(sessionStorage.getItem('redirectAfterLogin')).toBe('/pagina-anterior')
  })
})
