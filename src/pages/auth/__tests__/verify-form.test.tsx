import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as authQueries from '@/lib/auth/auth-queries'

import VerifyForm from '../verify-form'

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock do sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock do auth-context
vi.mock('@/lib/auth/auth-context', async () => {
  const actual = await vi.importActual('@/lib/auth/auth-context')
  return {
    ...actual,
    useAuth: () => ({
      estaAutenticado: false,
    }),
  }
})

// Mock das mutations
vi.mock('@/lib/auth/auth-queries', () => ({
  useConfirm2FAMutation: vi.fn(),
  useLoginMutation: vi.fn(),
}))

const renderVerifyForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <VerifyForm />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('VerifyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()

    // Mock sessionStorage
    const mockEmail = 'test@example.com'
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'auth_email') return mockEmail
      if (key === 'auth_context') return 'login'
      return null
    })

    // Mock das mutations com valores padrão
    vi.mocked(authQueries.useConfirm2FAMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    } as any)

    vi.mocked(authQueries.useLoginMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as any)
  })

  describe('Renderização', () => {
    it('deve renderizar o formulário de verificação', () => {
      renderVerifyForm()

      expect(screen.getByText(/Verificação de Segurança/i)).toBeInTheDocument()
      expect(screen.getByText(/Enviamos um código de 6 dígitos para/i)).toBeInTheDocument()
    })

    it('deve exibir o email do usuário', () => {
      renderVerifyForm()

      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('deve renderizar 6 campos de input para o código', () => {
      renderVerifyForm()

      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(6)
    })

    it('deve exibir o timer de expiração', () => {
      renderVerifyForm()

      expect(screen.getByText(/Código expira em:/i)).toBeInTheDocument()
    })
  })

  describe('Funcionalidade de Paste (Ctrl+V)', () => {
    it('deve preencher todos os campos ao colar código de 6 dígitos', async () => {
      renderVerifyForm()

      const inputs = screen.getAllByRole('textbox')
      const firstInput = inputs[0] as HTMLInputElement

      // Simula evento de paste com código de 6 dígitos
      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '123456',
        },
      })

      await waitFor(() => {
        inputs.forEach((input, index) => {
          expect(input).toHaveValue(['1', '2', '3', '4', '5', '6'][index])
        })
      })
    })

    it('deve limpar caracteres não numéricos ao colar', async () => {
      renderVerifyForm()

      const inputs = screen.getAllByRole('textbox')
      const firstInput = inputs[0] as HTMLInputElement

      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '12-34 56',
        },
      })

      await waitFor(() => {
        inputs.forEach((input, index) => {
          expect(input).toHaveValue(['1', '2', '3', '4', '5', '6'][index])
        })
      })
    })

    it('não deve preencher campos se código não tiver 6 dígitos', async () => {
      renderVerifyForm()

      const inputs = screen.getAllByRole('textbox')
      const firstInput = inputs[0] as HTMLInputElement

      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '123',
        },
      })

      await waitFor(() => {
        inputs.forEach((input) => {
          expect(input).toHaveValue('')
        })
      })
    })

  })

  describe('Validação e Submit', () => {
    it('deve desabilitar botão quando código está incompleto', () => {
      renderVerifyForm()

      const submitButton = screen.getByRole('button', { name: /Verificar Código/i })
      expect(submitButton).toBeDisabled()
    })

    it('deve habilitar botão quando código está completo', async () => {
      renderVerifyForm()

      const inputs = screen.getAllByRole('textbox')

      // Preenche todos os campos
      inputs.forEach((input, index) => {
        fireEvent.change(input, { target: { value: String(index + 1) } })
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Verificar Código/i })
        expect(submitButton).toBeEnabled()
      })
    })

  })

  describe('Reenvio de código', () => {
    it('botão de reenviar deve estar desabilitado enquanto há tempo', () => {
      renderVerifyForm()

      const resendButton = screen.getByRole('button', { name: /Reenviar Código/i })
      expect(resendButton).toBeDisabled()
    })
  })

  describe('Contextos diferentes', () => {
    it('deve exibir mensagem apropriada para contexto de recuperação de senha', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'auth_email') return 'test@example.com'
        if (key === 'auth_context') return 'password_recovery'
        return null
      })

      renderVerifyForm()

      expect(screen.getByText(/Verificar Código de Recuperação/i)).toBeInTheDocument()
    })

    it('deve exibir mensagem apropriada para contexto de senha expirada', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'auth_email') return 'test@example.com'
        if (key === 'auth_context') return 'password_expired'
        return null
      })

      renderVerifyForm()

      expect(screen.getByText(/Senha Expirada - Verificar Identidade/i)).toBeInTheDocument()
    })
  })

  describe('Redirecionamentos', () => {
    it('deve redirecionar para /login se não houver email no sessionStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      renderVerifyForm()

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })
})
