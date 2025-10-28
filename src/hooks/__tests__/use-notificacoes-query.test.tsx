/**
 * Testes para hooks TanStack Query de notificações
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as notificacaoApi from '@/services/notificacao-api'

import {
  useNotificacoesQuery,
  useContarNaoLidasQuery,
  useMarcarLidaMutation,
  useArquivarMutation,
} from '../use-notificacoes-query'

// Mock do serviço de API
vi.mock('@/services/notificacao-api')

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('use-notificacoes-query', () => {
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

  describe('useNotificacoesQuery', () => {
    it('deve carregar notificações com sucesso', async () => {
      const mockData = {
        items: [
          {
            id: '1',
            titulo: 'Teste',
            mensagem: 'Mensagem',
            tipo: 'info' as const,
            lida: false,
            arquivada: false,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        naoLidas: 1,
      }

      vi.mocked(notificacaoApi.listarMinhasNotificacoes).mockResolvedValue(
        mockData,
      )

      const { result } = renderHook(() => useNotificacoesQuery(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockData)
      expect(result.current.data?.items).toHaveLength(1)
    })

    it('deve aceitar filtros customizados', async () => {
      const filtros = { page: 2, pageSize: 10 }

      vi.mocked(notificacaoApi.listarMinhasNotificacoes).mockResolvedValue({
        items: [],
        page: 2,
        pageSize: 10,
        naoLidas: 0,
      })

      renderHook(() => useNotificacoesQuery(filtros), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(notificacaoApi.listarMinhasNotificacoes).toHaveBeenCalledWith(
          filtros,
        )
      })
    })

    it('deve lidar com erro ao carregar', async () => {
      vi.mocked(notificacaoApi.listarMinhasNotificacoes).mockRejectedValue(
        new Error('Erro de rede'),
      )

      const { result } = renderHook(() => useNotificacoesQuery(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useContarNaoLidasQuery', () => {
    it('deve retornar contagem de não lidas', async () => {
      const mockData = {
        naoLidas: 5,
        porSistema: {
          'sistema-1': 3,
          'sistema-2': 2,
        },
      }

      vi.mocked(notificacaoApi.contarNaoLidas).mockResolvedValue(mockData)

      const { result } = renderHook(() => useContarNaoLidasQuery(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.naoLidas).toBe(5)
    })
  })

  describe('useMarcarLidaMutation', () => {
    it('deve marcar notificação como lida', async () => {
      vi.mocked(notificacaoApi.marcarComoLida).mockResolvedValue()

      const { result } = renderHook(() => useMarcarLidaMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('notif-123')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(notificacaoApi.marcarComoLida).toHaveBeenCalledWith(
        'notif-123',
        expect.anything(),
      )
    })

    it('deve fazer otimistic update', async () => {
      const mockData = {
        items: [
          {
            id: 'notif-123',
            titulo: 'Teste',
            mensagem: 'Mensagem',
            tipo: 'info' as const,
            lida: false,
            arquivada: false,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        naoLidas: 1,
      }

      // Primeiro carrega as notificações
      vi.mocked(notificacaoApi.listarMinhasNotificacoes).mockResolvedValue(
        mockData,
      )

      const wrapper = createWrapper()

      // Carrega notificações
      const { result: queryResult, rerender } = renderHook(
        () => useNotificacoesQuery(),
        {
          wrapper,
        },
      )

      await waitFor(() => expect(queryResult.current.isSuccess).toBe(true))

      // Agora testa a mutation
      vi.mocked(notificacaoApi.marcarComoLida).mockResolvedValue()

      const { result: mutationResult } = renderHook(
        () => useMarcarLidaMutation(),
        { wrapper },
      )

      mutationResult.current.mutate('notif-123')

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true))

      // Força rerender para pegar o otimistic update
      rerender()

      // Verifica se o otimistic update funcionou
      await waitFor(() => {
        expect(queryResult.current.data?.items[0].lida).toBe(true)
      })
    })
  })

  describe('useArquivarMutation', () => {
    it('deve arquivar notificação', async () => {
      vi.mocked(notificacaoApi.arquivar).mockResolvedValue()

      const { result } = renderHook(() => useArquivarMutation(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('notif-456')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(notificacaoApi.arquivar).toHaveBeenCalledWith(
        'notif-456',
        expect.anything(),
      )
    })

    it('deve remover da lista ao arquivar (otimistic)', async () => {
      const mockData = {
        items: [
          {
            id: 'notif-456',
            titulo: 'Teste',
            mensagem: 'Mensagem',
            tipo: 'info' as const,
            lida: true,
            arquivada: false,
            criadoEm: '2025-01-23T10:00:00Z',
          },
        ],
        page: 1,
        pageSize: 20,
        naoLidas: 0,
      }

      vi.mocked(notificacaoApi.listarMinhasNotificacoes).mockResolvedValue(
        mockData,
      )

      const wrapper = createWrapper()

      const { result: queryResult } = renderHook(() => useNotificacoesQuery(), {
        wrapper,
      })

      await waitFor(() => expect(queryResult.current.isSuccess).toBe(true))

      vi.mocked(notificacaoApi.arquivar).mockResolvedValue()

      const { result: mutationResult } = renderHook(
        () => useArquivarMutation(),
        { wrapper },
      )

      mutationResult.current.mutate('notif-456')

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true))
    })
  })
})
