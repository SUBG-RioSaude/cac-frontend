/**
 * Testes para hooks TanStack Query de subscrições
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as subscricoesApi from '@/services/notificacao-api'

import {
  useVerificarSeguindoQuery,
  useMinhasSubscricoesQuery,
  useToggleSeguirMutation,
  useDeletarSubscricaoMutation,
} from '../use-subscricoes-query'

// Mock do serviço de API
vi.mock('@/services/notificacao-api')

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('use-subscricoes-query', () => {
  let queryClient: QueryClient

  // Wrapper com QueryClientProvider
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Desabilita retry nos testes
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

  describe('useVerificarSeguindoQuery', () => {
    it('deve verificar se está seguindo com sucesso', async () => {
      const mockResponse = {
        seguindo: true,
        subscricaoId: 'sub-123',
        criadoEm: '2025-01-23T10:00:00Z',
      }

      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue(
        mockResponse,
      )

      const { result } = renderHook(
        () => useVerificarSeguindoQuery('contratos', 'contrato-123'),
        {
          wrapper: createWrapper(),
        },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
      expect(result.current.data?.seguindo).toBe(true)
      expect(subscricoesApi.verificarSeguindo).toHaveBeenCalledWith(
        'contratos',
        'contrato-123',
      )
    })

    it('deve retornar não seguindo quando não existe subscrição', async () => {
      const mockResponse = {
        seguindo: false,
      }

      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue(
        mockResponse,
      )

      const { result } = renderHook(
        () => useVerificarSeguindoQuery('fornecedores', 'fornecedor-456'),
        {
          wrapper: createWrapper(),
        },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.seguindo).toBe(false)
    })

    it('deve lidar com erro ao verificar status', async () => {
      vi.mocked(subscricoesApi.verificarSeguindo).mockRejectedValue(
        new Error('Erro de rede'),
      )

      const { result } = renderHook(
        () => useVerificarSeguindoQuery('unidades', 'unidade-789'),
        {
          wrapper: createWrapper(),
        },
      )

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 },
      )

      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toBe('Erro de rede')
    })

    it('não deve executar query quando parametros estão vazios', () => {
      const { result } = renderHook(() => useVerificarSeguindoQuery('', ''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(subscricoesApi.verificarSeguindo).not.toHaveBeenCalled()
    })
  })

  describe('useMinhasSubscricoesQuery', () => {
    it('deve listar subscrições do usuário', async () => {
      const mockData = {
        items: [
          {
            id: 'sub-1',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-1',
            ativa: true,
            criadoEm: '2025-01-23T10:00:00Z',
          },
          {
            id: 'sub-2',
            sistemaId: 'contratos',
            entidadeOrigemId: 'contrato-2',
            ativa: true,
            criadoEm: '2025-01-23T11:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        total: 2,
      }

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue(
        mockData,
      )

      const { result } = renderHook(() => useMinhasSubscricoesQuery(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockData)
      expect(result.current.data?.items).toHaveLength(2)
    })

    it('deve aceitar filtros customizados', async () => {
      const filtros = {
        page: 2,
        pageSize: 10,
        sistemaId: 'fornecedores',
      }

      vi.mocked(subscricoesApi.listarMinhasSubscricoes).mockResolvedValue({
        items: [],
        page: 2,
        pageSize: 10,
        total: 0,
      })

      renderHook(() => useMinhasSubscricoesQuery(filtros), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(subscricoesApi.listarMinhasSubscricoes).toHaveBeenCalledWith(
          filtros.page,
          filtros.pageSize,
          filtros.sistemaId,
        )
      })
    })
  })

  describe('useToggleSeguirMutation', () => {
    it('deve seguir entidade quando não está seguindo', async () => {
      const mockResponse = {
        seguindo: true,
        mensagem: 'Você está seguindo esta entidade',
        subscricaoId: 'sub-new',
      }

      vi.mocked(subscricoesApi.toggleSeguir).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useToggleSeguirMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        sistemaId: 'contratos',
        entidadeOrigemId: 'contrato-123',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(subscricoesApi.toggleSeguir).toHaveBeenCalledWith({
        sistemaId: 'contratos',
        entidadeOrigemId: 'contrato-123',
      })
    })

    it('deve deixar de seguir quando está seguindo', async () => {
      const mockResponse = {
        seguindo: false,
        mensagem: 'Você deixou de seguir esta entidade',
      }

      vi.mocked(subscricoesApi.toggleSeguir).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useToggleSeguirMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        sistemaId: 'fornecedores',
        entidadeOrigemId: 'fornecedor-456',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.seguindo).toBe(false)
    })

    it('deve fazer optimistic update', async () => {
      // Setup inicial: não está seguindo
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: false,
      })

      const wrapper = createWrapper()

      const { result: queryResult } = renderHook(
        () => useVerificarSeguindoQuery('contratos', 'contrato-123'),
        { wrapper },
      )

      await waitFor(() => expect(queryResult.current.isSuccess).toBe(true))
      expect(queryResult.current.data?.seguindo).toBe(false)

      // Agora testa mutation com optimistic update
      vi.mocked(subscricoesApi.toggleSeguir).mockImplementation(async () => {
        // Simula delay de rede
        await new Promise((resolve) => setTimeout(resolve, 100))
        return {
          seguindo: true,
          mensagem: 'Seguindo',
          subscricaoId: 'sub-123',
        }
      })

      const { result: mutationResult } = renderHook(
        () => useToggleSeguirMutation(),
        { wrapper },
      )

      mutationResult.current.mutate({
        sistemaId: 'contratos',
        entidadeOrigemId: 'contrato-123',
      })

      // Verifica optimistic update (deve mudar antes da API responder)
      await waitFor(() => {
        const data = queryResult.current.data
        expect(data?.seguindo).toBe(true)
      })

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true))
    })

    it('deve fazer rollback em caso de erro', async () => {
      // Setup inicial: seguindo
      vi.mocked(subscricoesApi.verificarSeguindo).mockResolvedValue({
        seguindo: true,
        subscricaoId: 'sub-123',
      })

      const wrapper = createWrapper()

      const { result: queryResult } = renderHook(
        () => useVerificarSeguindoQuery('contratos', 'contrato-123'),
        { wrapper },
      )

      await waitFor(() => expect(queryResult.current.isSuccess).toBe(true))
      expect(queryResult.current.data?.seguindo).toBe(true)

      // Mutation que vai falhar
      vi.mocked(subscricoesApi.toggleSeguir).mockRejectedValue(
        new Error('Erro de rede'),
      )

      const { result: mutationResult } = renderHook(
        () => useToggleSeguirMutation(),
        { wrapper },
      )

      mutationResult.current.mutate({
        sistemaId: 'contratos',
        entidadeOrigemId: 'contrato-123',
      })

      await waitFor(() => expect(mutationResult.current.isError).toBe(true))

      // Verifica rollback (deve voltar para seguindo=true)
      expect(queryResult.current.data?.seguindo).toBe(true)
    })
  })

  describe('useDeletarSubscricaoMutation', () => {
    it('deve deletar subscrição com sucesso', async () => {
      vi.mocked(subscricoesApi.deletarSubscricao).mockResolvedValue()

      const { result } = renderHook(() => useDeletarSubscricaoMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('sub-123')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(subscricoesApi.deletarSubscricao).toHaveBeenCalledWith('sub-123')
    })

    it('deve lidar com erro ao deletar', async () => {
      vi.mocked(subscricoesApi.deletarSubscricao).mockRejectedValue(
        new Error('Erro ao deletar'),
      )

      const { result } = renderHook(() => useDeletarSubscricaoMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('sub-456')

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })
})
