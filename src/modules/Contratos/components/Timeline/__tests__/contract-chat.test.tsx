import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ContractChat } from '../contract-chat'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const mockMensagens = [
  {
    id: '1',
    contratoId: 'contrato-123',
    remetente: {
      id: '2',
      nome: 'Maria Santos',
      avatar: '/avatars/maria.jpg',
      tipo: 'gestor' as const,
    },
    conteudo: 'Preciso verificar o cronograma de entregas com o fornecedor.',
    tipo: 'texto' as const,
    dataEnvio: '2024-01-15T10:30:00Z',
    lida: true,
  },
  {
    id: '2',
    contratoId: 'contrato-123',
    remetente: {
      id: 'sistema',
      nome: 'Sistema',
      tipo: 'sistema' as const,
    },
    conteudo: 'Maria Santos foi designada como gestora do contrato',
    tipo: 'sistema' as const,
    dataEnvio: '2024-01-10T09:00:00Z',
    lida: true,
  },
]

const mockUseContractChatMessages = vi.fn(() => ({
  mensagens: mockMensagens,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
  hasNextPage: false,
  fetchNextPage: vi.fn(),
  isFetchingNextPage: false,
}))

const mockSendMutation = {
  mutate: vi.fn(),
  isPending: false,
}

const mockRealtime = {
  connectionState: 'connected' as const,
  isConnected: true,
  isConnecting: false,
  error: null,
  startTyping: vi.fn(),
  stopTyping: vi.fn(),
}

vi.mock('@/modules/Contratos/hooks/use-chat', () => ({
  useContractChatMessages: (...args: unknown[]) =>
    mockUseContractChatMessages(...args),
  useSendChatMessage: () => mockSendMutation,
  useUpdateChatMessage: vi.fn(),
  useDeleteChatMessage: vi.fn(),
  useChatEstatisticas: vi.fn(),
  useContractChatRealtime: () => mockRealtime,
}))

vi.mock('@/lib/auth/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    usuario: {
      id: '1',
      nomeCompleto: 'João Silva',
      email: 'joao@prefeitura.com',
      tipoUsuario: 'gestor',
      precisaTrocarSenha: false,
      emailConfirmado: true,
      ativo: true,
    },
  })),
}))

// Mock das funções de autenticação JWT
vi.mock('@/lib/auth/auth', () => ({
  getToken: vi.fn(() => 'mock-jwt-token'),
  getTokenInfo: vi.fn(() => ({
    usuarioId: '1',
    nomeCompleto: 'João Silva',
    sub: 'joao@prefeitura.com',
    tipoUsuario: 'gestor',
    exp: new Date(Date.now() + 3600000), // 1 hora no futuro
    iss: 'test-issuer',
    aud: 'test-audience',
  })),
}))

describe('ContractChat', () => {
  const mockProps = {
    contratoId: 'contrato-123',
    numeroContrato: 'CONTR-2024-001',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContractChatMessages.mockClear()
    mockSendMutation.mutate.mockClear()
    mockSendMutation.isPending = false
    mockRealtime.startTyping.mockClear()
    mockRealtime.stopTyping.mockClear()
  })

  describe('Renderização inicial', () => {
    it('deve renderizar header com título e informações do contrato', () => {
      render(<ContractChat {...mockProps} />)

      expect(screen.getByText('Observações do Contrato')).toBeInTheDocument()
      expect(screen.getByText(/CONTR-2024-001/)).toBeInTheDocument()
      expect(
        screen.getByText(/Registre observações e acompanhamento/),
      ).toBeInTheDocument()
    })

    it('deve mostrar contador de observações (excluindo mensagens do sistema)', () => {
      render(<ContractChat {...mockProps} />)

      expect(screen.getByText('1 observações')).toBeInTheDocument()
    })

    it('deve renderizar área de input para nova observação', () => {
      render(<ContractChat {...mockProps} />)

      expect(screen.getByText('Nova Observação')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/Registre uma observação sobre o contrato/),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /registrar/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Exibição de mensagens', () => {
    it('deve renderizar mensagens do chat', () => {
      render(<ContractChat {...mockProps} />)

      expect(
        screen.getByText(
          'Preciso verificar o cronograma de entregas com o fornecedor.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Maria Santos foi designada como gestora do contrato'),
      ).toBeInTheDocument()
    })

    it('deve distinguir visualmente mensagens do sistema', () => {
      render(<ContractChat {...mockProps} />)

      // Mensagem do sistema deve ter estilo diferente
      const mensagemSistema = screen.getByText(
        'Maria Santos foi designada como gestora do contrato',
      )
      expect(mensagemSistema.closest('div')).toHaveClass('bg-blue-50')
    })

    it('deve mostrar informações do remetente para mensagens de usuários', () => {
      render(<ContractChat {...mockProps} />)

      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      expect(screen.getByText('gestor')).toBeInTheDocument()
    })

    it('deve formatar horário das mensagens corretamente', () => {
      render(<ContractChat {...mockProps} />)

      // Verificar se datas estão formatadas em pt-BR
      expect(screen.getByText(/15\/01/)).toBeInTheDocument()
      expect(screen.getByText(/10\/01/)).toBeInTheDocument()
    })
  })

  describe('Envio de nova observação', () => {
    it('deve permitir digitar nova observação', async () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )

      // Usar fireEvent que é mais direto
      fireEvent.change(textarea, {
        target: { value: 'Nova observação sobre o contrato' },
      })

      expect(textarea).toHaveValue('Nova observação sobre o contrato')
    })

    it('deve habilitar botão registrar apenas com texto', async () => {
      render(<ContractChat {...mockProps} />)

      const botao = screen.getByRole('button', { name: /registrar/i })
      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )

      // Inicialmente desabilitado
      expect(botao).toBeDisabled()

      // Após digitar, deve habilitar
      fireEvent.change(textarea, { target: { value: 'Texto' } })
      await waitFor(() => {
        expect(botao).toBeEnabled()
      })

      // Ao limpar, deve desabilitar novamente
      fireEvent.change(textarea, { target: { value: '' } })
      await waitFor(() => {
        expect(botao).toBeDisabled()
      })
    })
    it('deve enviar mensagem ao clicar em registrar', async () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )
      const botao = screen.getByRole('button', { name: /registrar/i })

      fireEvent.change(textarea, {
        target: { value: 'Nova observação importante' },
      })

      await waitFor(() => {
        expect(botao).toBeEnabled()
      })

      fireEvent.click(botao)

      await waitFor(() => {
        expect(mockSendMutation.mutate).toHaveBeenCalledWith({
          conteudo: 'Nova observação importante',
          autorId: '1',
          autorNome: 'João Silva',
        })
      })

      expect(textarea).toHaveValue('')
    })
    it('deve enviar mensagem ao pressionar Enter', async () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )
      const botao = screen.getByRole('button', { name: /registrar/i })

      fireEvent.change(textarea, { target: { value: 'Mensagem via Enter' } })
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(mockSendMutation.mutate).toHaveBeenCalledWith({
          conteudo: 'Mensagem via Enter',
          autorId: '1',
          autorNome: 'João Silva',
        })
      })

      expect(textarea).toHaveValue('')
      expect(botao).toBeDisabled()
    })

    it('deve permitir nova linha com Shift+Enter', () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )

      fireEvent.change(textarea, { target: { value: 'Primeira linha' } })
      fireEvent.keyDown(textarea, {
        key: 'Enter',
        code: 'Enter',
        shiftKey: true,
      })

      // Shift+Enter não deve enviar, então o valor deve permanecer
      expect(textarea).toHaveValue('Primeira linha')
    })
    it('deve limpar campo e parar indicador de digitação durante envio', async () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )
      const botao = screen.getByRole('button', { name: /registrar/i })

      fireEvent.change(textarea, { target: { value: 'Teste loading' } })

      await waitFor(() => {
        expect(botao).toBeEnabled()
      })

      fireEvent.click(botao)

      expect(mockSendMutation.mutate).toHaveBeenCalledWith({
        conteudo: 'Teste loading',
        autorId: '1',
        autorNome: 'João Silva',
      })
      expect(mockRealtime.stopTyping).toHaveBeenCalledTimes(1)

      await waitFor(() => {
        expect(botao).toBeDisabled()
      })
      expect(textarea).toHaveValue('')
    })

    it('deve mostrar atalhos de teclado', () => {
      render(<ContractChat {...mockProps} />)

      expect(screen.getByText('Enter')).toBeInTheDocument()
      expect(screen.getByText('Shift+Enter')).toBeInTheDocument()
      expect(screen.getByText(/para enviar/)).toBeInTheDocument()
      expect(screen.getByText(/nova linha/)).toBeInTheDocument()
    })
  })

  describe('Responsividade e UX', () => {
    it('deve aplicar classes responsivas corretas', () => {
      render(<ContractChat {...mockProps} />)

      const card = screen
        .getByText('Observações do Contrato')
        .closest('.flex.h-full')
      expect(card).toHaveClass('min-h-[700px]')
    })

    it('deve mostrar avatar do usuário atual na área de input', () => {
      render(<ContractChat {...mockProps} />)

      // Verificar se há avatares na interface (são implementados como spans, não img)
      const avatarFallbacks = document.querySelectorAll(
        '[data-slot="avatar-fallback"]',
      )

      // Deve haver pelo menos um avatar (do usuário na área de input)
      expect(avatarFallbacks.length).toBeGreaterThan(0)
    })
  })
})
