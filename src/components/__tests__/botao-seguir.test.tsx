/**
 * Testes para componente BotaoSeguir e suas variantes
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as subscricoesApi from '@/services/notificacao-api'

import {
  BotaoSeguir,
  BotaoSeguirContrato,
  BotaoSeguirFornecedor,
  BotaoSeguirUnidade,
} from '../botao-seguir'

// Mock do serviço de API
vi.mock('@/services/notificacao-api')

// Mock das funções de configuração de sistemas
// Retorna o sistemaId original sem conversão para UUID
vi.mock('@/config/sistemas', () => ({
  obterSistemaId: vi.fn((sistema: string) => sistema),
  isSistemaValido: vi.fn(() => true),
  SISTEMA_FRONTEND_ID: '7b8659bb-1aeb-4d74-92c1-110c1d27e576',
}))

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('BotaoSeguir', () => {
  let queryClient: QueryClient

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    const Wrapper = ({ children }: { children: ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }
    return Wrapper
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Estados visuais', () => {
    it('deve renderizar em estado "não seguindo"', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(screen.getByText('Seguir')).toBeInTheDocument()
      })

      const botao = screen.getByRole('button', { name: /seguir/i })
      expect(botao).toBeInTheDocument()
      expect(botao).toHaveAttribute('aria-label', 'Seguir')
    })

    it('deve renderizar em estado "seguindo"', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: true,
        subscricaoId: 'sub-123',
      })

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(screen.getByText('Seguindo')).toBeInTheDocument()
      })

      const botao = screen.getByRole('button', { name: /deixar de seguir/i })
      expect(botao).toBeInTheDocument()
      expect(botao).toHaveAttribute('aria-label', 'Deixar de seguir')
    })

    it('deve mostrar loading durante carregamento inicial', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockImplementation(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 100))
          return { seguindo: false }
        },
      )

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      // Verifica se tem classe de loading ou está desabilitado
      const botao = screen.getByRole('button')
      expect(botao).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText('Seguir')).toBeInTheDocument()
      })
    })
  })

  describe('Interações', () => {
    it('deve alternar para "seguindo" ao clicar quando não está seguindo', async () => {
      const user = userEvent.setup()

      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      vi.mocked(subscricoesApi.toggleSeguir).mockResolvedValue({
        seguindo: true,
        mensagem: 'Seguindo',
        subscricaoId: 'sub-123',
      })

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(screen.getByText('Seguir')).toBeInTheDocument()
      })

      const botao = screen.getByRole('button', { name: /seguir/i })
      await user.click(botao)

      await waitFor(() => {
        expect(subscricoesApi.toggleSeguir).toHaveBeenCalledWith({
          sistemaId: 'test-sistema',
          entidadeOrigemId: 'entidade-123',
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Seguindo')).toBeInTheDocument()
      })
    })

    it('deve alternar para "não seguindo" ao clicar quando está seguindo', async () => {
      const user = userEvent.setup()

      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: true,
        subscricaoId: 'sub-123',
      })

      vi.mocked(subscricoesApi.toggleSeguir).mockResolvedValue({
        seguindo: false,
        mensagem: 'Deixou de seguir',
      })

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(screen.getByText('Seguindo')).toBeInTheDocument()
      })

      const botao = screen.getByRole('button', { name: /deixar de seguir/i })
      await user.click(botao)

      await waitFor(() => {
        expect(screen.getByText('Seguir')).toBeInTheDocument()
      })
    })

    it('deve desabilitar botão durante mutation', async () => {
      const user = userEvent.setup()

      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      vi.mocked(subscricoesApi.toggleSeguir).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return {
          seguindo: true,
          mensagem: 'Seguindo',
          subscricaoId: 'sub-123',
        }
      })

      render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(screen.getByText('Seguir')).toBeInTheDocument()
      })

      const botao = screen.getByRole('button', { name: /seguir/i })
      await user.click(botao)

      // Deve estar desabilitado durante mutation
      await waitFor(() => {
        expect(botao).toBeDisabled()
      })

      await waitFor(
        () => {
          expect(screen.getByText('Seguindo')).toBeInTheDocument()
          expect(botao).not.toBeDisabled()
        },
        { timeout: 3000 },
      )
    })
  })

  describe('Responsividade', () => {
    it('deve renderizar apenas ícone quando apenasIcone=true', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      const { container } = render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
          apenasIcone
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        const botao = screen.getByRole('button')
        expect(botao).toBeInTheDocument()
      })

      // Não deve ter texto visível (apenas ícone)
      const textElement = container.querySelector('span')
      expect(textElement).toBeNull()
    })
  })

  describe('Variantes especializadas', () => {
    it('BotaoSeguirContrato deve usar sistemaId="contratos"', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      render(<BotaoSeguirContrato contratoId="contrato-123" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(subscricoesApi.verificarSeguindo).toHaveBeenCalledWith(
          'contratos',
          'contrato-123',
        )
      })
    })

    it('BotaoSeguirFornecedor deve usar sistemaId="fornecedores"', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      render(<BotaoSeguirFornecedor fornecedorId="fornecedor-456" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(subscricoesApi.verificarSeguindo).toHaveBeenCalledWith(
          'fornecedores',
          'fornecedor-456',
        )
      })
    })

    it('BotaoSeguirUnidade deve usar sistemaId="unidades"', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      render(<BotaoSeguirUnidade unidadeId="unidade-789" />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(subscricoesApi.verificarSeguindo).toHaveBeenCalledWith(
          'unidades',
          'unidade-789',
        )
      })
    })
  })

  describe('Classes customizadas', () => {
    it('deve aceitar className customizada', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      const { container } = render(
        <BotaoSeguir
          entidadeOrigemId="entidade-123"
          sistemaId="test-sistema"
          className="custom-class"
        />,
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        const botao = container.querySelector('.custom-class')
        expect(botao).toBeInTheDocument()
      })
    })
  })
})
