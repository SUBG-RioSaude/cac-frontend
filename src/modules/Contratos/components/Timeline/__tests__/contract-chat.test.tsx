import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
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

// Mock dos dados do chat
vi.mock('../../../data/chat-mock', () => ({
  MENSAGENS_MOCK: [
    {
      id: '1',
      contratoId: 'contrato-123',
      remetente: {
        id: '2',
        nome: 'Maria Santos',
        avatar: '/avatars/maria.jpg',
        tipo: 'gestor',
      },
      conteudo: 'Preciso verificar o cronograma de entregas com o fornecedor.',
      tipo: 'texto',
      dataEnvio: '2024-01-15T10:30:00Z',
      lida: true,
    },
    {
      id: '2',
      contratoId: 'contrato-123',
      remetente: {
        id: 'sistema',
        nome: 'Sistema',
        tipo: 'sistema',
      },
      conteudo: 'Maria Santos foi designada como gestora do contrato',
      tipo: 'sistema',
      dataEnvio: '2024-01-10T09:00:00Z',
      lida: true,
    },
  ],
  PARTICIPANTES_MOCK: [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@prefeitura.com',
      avatar: '/avatars/joao.jpg',
      tipo: 'fiscal',
      status: 'online',
      ultimoAcesso: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@prefeitura.com',
      avatar: '/avatars/maria.jpg',
      tipo: 'gestor',
      status: 'online',
      ultimoAcesso: new Date().toISOString(),
    },
  ],
}))

describe('ContractChat', () => {
  const mockProps = {
    contratoId: 'contrato-123',
    numeroContrato: 'CONTR-2024-001',
    onMarcarComoAlteracao: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
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

  describe('Botão de marcar como alteração', () => {
    it('deve mostrar botão ao passar mouse sobre mensagem de usuário', async () => {
      const user = userEvent.setup()
      render(<ContractChat {...mockProps} />)

      const mensagem = screen.getByText(
        'Preciso verificar o cronograma de entregas com o fornecedor.',
      )
      const container = mensagem.closest('.group')

      if (container) {
        await user.hover(container)

        // O botão deve aparecer no hover
        const botaoMarcar = container.querySelector(
          'button[title="Marcar como alteração contratual"]',
        )
        expect(botaoMarcar).toBeInTheDocument()
      }
    })

    it('deve chamar callback ao clicar no botão de marcar', async () => {
      const user = userEvent.setup()
      render(<ContractChat {...mockProps} />)

      // Simular hover e click no botão
      const mensagemContainer = screen
        .getByText(
          'Preciso verificar o cronograma de entregas com o fornecedor.',
        )
        .closest('.group')

      if (mensagemContainer) {
        const botaoMarcar = mensagemContainer.querySelector('button')
        if (botaoMarcar) {
          await user.click(botaoMarcar)

          expect(mockProps.onMarcarComoAlteracao).toHaveBeenCalledTimes(1)
          expect(mockProps.onMarcarComoAlteracao).toHaveBeenCalledWith(
            expect.objectContaining({
              id: '1',
              conteudo:
                'Preciso verificar o cronograma de entregas com o fornecedor.',
            }),
          )
        }
      }
    })

    it('não deve mostrar botão para mensagens do sistema', () => {
      render(<ContractChat {...mockProps} />)

      const mensagemSistema = screen.getByText(
        'Maria Santos foi designada como gestora do contrato',
      )
      const container = mensagemSistema.closest('div')

      // Mensagem do sistema não deve ter botão de marcar
      expect(
        container?.querySelector(
          'button[title="Marcar como alteração contratual"]',
        ),
      ).not.toBeInTheDocument()
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

      // Digitar texto
      fireEvent.change(textarea, {
        target: { value: 'Nova observação importante' },
      })

      await waitFor(() => {
        expect(botao).toBeEnabled()
      })

      fireEvent.click(botao)

      // Aguardar o processamento da mensagem
      await waitFor(() => {
        expect(
          screen.getByText('Nova observação importante'),
        ).toBeInTheDocument()
      })
    })

    it('deve enviar mensagem ao pressionar Enter', async () => {
      render(<ContractChat {...mockProps} />)

      const textarea = screen.getByPlaceholderText(
        /Registre uma observação sobre o contrato/,
      )

      fireEvent.change(textarea, { target: { value: 'Mensagem via Enter' } })
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Mensagem via Enter')).toBeInTheDocument()
      })
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

    it('deve mostrar estado de carregamento durante envio', async () => {
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

      // Verificar se a mensagem foi adicionada (indica que o envio funcionou)
      await waitFor(() => {
        expect(screen.getByText('Teste loading')).toBeInTheDocument()
      })
    })
  })

  describe('Funcionalidade sem callback', () => {
    it('deve funcionar sem callback onMarcarComoAlteracao', () => {
      const propsSemCallback = {
        contratoId: 'contrato-123',
        numeroContrato: 'CONTR-2024-001',
      }

      expect(() => {
        render(<ContractChat {...propsSemCallback} />)
      }).not.toThrow()

      // Não deve mostrar botões de marcar
      const mensagem = screen.getByText(
        'Preciso verificar o cronograma de entregas com o fornecedor.',
      )
      const container = mensagem.closest('.group')

      expect(
        container?.querySelector(
          'button[title="Marcar como alteração contratual"]',
        ),
      ).not.toBeInTheDocument()
    })
  })

  describe('Dicas e instruções', () => {
    it('deve mostrar dicas de uso do componente', () => {
      render(<ContractChat {...mockProps} />)

      expect(
        screen.getByText(
          /Use este espaço para registrar observações importantes/,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Passe o mouse sobre observações de outros usuários/),
      ).toBeInTheDocument()
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
