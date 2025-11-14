/**
 * Testes para o serviço de API de notificações
 */

import type { AxiosResponse } from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { NotificacaoUsuario } from '@/types/notificacao'

// Hoisted mocks - executam ANTES de qualquer import
const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(() => {}), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
}))

// Mock do getToken
vi.mock('@/lib/auth/auth', () => ({
  getToken: vi.fn(() => 'mock-token'),
}))

// Mock do axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}))

import * as notificacaoApi from '../notificacao-api'

describe('notificacao-api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listarMinhasNotificacoes', () => {
    it('deve listar notificações com paginação padrão', async () => {
      const mockData = {
        items: [
          {
            id: '1',
            titulo: 'Teste',
            mensagem: 'Mensagem teste',
            tipo: 'info',
            lida: false,
            arquivada: false,
            criadoEm: '2025-01-23T10:00:00Z',
          } as NotificacaoUsuario,
        ],
        page: 1,
        pageSize: 20,
        naoLidas: 1,
      }

      mockAxiosInstance.get.mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.listarMinhasNotificacoes()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/minhas'),
        expect.objectContaining({
          params: { page: 1, pageSize: 20 },
        }),
      )
      expect(resultado).toEqual(mockData)
    })

    it('deve aceitar filtros customizados', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { items: [], page: 2, pageSize: 10, naoLidas: 0 },
      } as AxiosResponse)

      await notificacaoApi.listarMinhasNotificacoes({ page: 2, pageSize: 10 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { page: 2, pageSize: 10 },
        }),
      )
    })
  })

  describe('contarNaoLidas', () => {
    it('deve retornar contagem de não lidas', async () => {
      const mockData = {
        naoLidas: 5,
        porSistema: {
          'sistema-1': 3,
          'sistema-2': 2,
        },
      }

      mockAxiosInstance.get.mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.contarNaoLidas()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/nao-lidas'),
      )
      expect(resultado).toEqual(mockData)
      expect(resultado.naoLidas).toBe(5)
    })
  })

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Sucesso' },
      } as AxiosResponse)

      await notificacaoApi.marcarComoLida('notif-123')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-123/marcar-lida'),
      )
    })
  })

  describe('arquivar', () => {
    it('deve arquivar notificação', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Arquivada' },
      } as AxiosResponse)

      await notificacaoApi.arquivar('notif-456')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-456/arquivar'),
      )
    })
  })

  describe('desarquivar', () => {
    it('deve desarquivar notificação', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Desarquivada' },
      } as AxiosResponse)

      await notificacaoApi.desarquivar('notif-789')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-789/desarquivar'),
      )
    })
  })

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas como lidas sem filtro', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Todas marcadas' },
      } as AxiosResponse)

      await notificacaoApi.marcarTodasComoLidas()

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/marcar-todas-lidas'),
        null,
        expect.objectContaining({
          params: undefined,
        }),
      )
    })

    it('deve aceitar filtro por sistema', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Marcadas do sistema' },
      } as AxiosResponse)

      await notificacaoApi.marcarTodasComoLidas('sistema-123')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.any(String),
        null,
        expect.objectContaining({
          params: { sistemaId: 'sistema-123' },
        }),
      )
    })
  })

  describe('arquivarTodasLidas', () => {
    it('deve arquivar todas lidas', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        data: { message: 'Arquivadas' },
      } as AxiosResponse)

      await notificacaoApi.arquivarTodasLidas()

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/arquivar-todas-lidas'),
        null,
        expect.any(Object),
      )
    })
  })

  describe('listarArquivadas', () => {
    it('deve listar notificações arquivadas', async () => {
      const mockData = {
        items: [],
        page: 1,
        pageSize: 20,
        totalArquivadas: 0,
      }

      mockAxiosInstance.get.mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.listarArquivadas()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/arquivadas'),
        expect.objectContaining({
          params: { page: 1, pageSize: 20 },
        }),
      )
      expect(resultado).toEqual(mockData)
    })
  })

  describe('deletarNotificacao', () => {
    it('deve deletar notificação permanentemente', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        data: {},
      } as AxiosResponse)

      await notificacaoApi.deletarNotificacao('notif-delete')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        expect.stringContaining('/notif-delete'),
      )
    })
  })

  describe('obterPreferencias', () => {
    it('deve retornar preferências do usuário', async () => {
      const mockPreferencias = [
        {
          id: 'pref-1',
          sistemaId: 'sistema-1',
          tipoNotificacao: 'vencimento',
          habilitada: true,
          criadoEm: '2025-01-01T00:00:00Z',
        },
      ]

      mockAxiosInstance.get.mockResolvedValue({
        data: mockPreferencias,
      } as AxiosResponse)

      const resultado = await notificacaoApi.obterPreferencias()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/preferencias/minhas',
      )
      expect(resultado).toEqual(mockPreferencias)
    })
  })

  describe('atualizarPreferencia', () => {
    it('deve atualizar preferência', async () => {
      const mockPreferencia = {
        id: 'pref-1',
        habilitada: false,
      }

      mockAxiosInstance.put.mockResolvedValue({
        data: mockPreferencia,
      } as AxiosResponse)

      const resultado = await notificacaoApi.atualizarPreferencia(
        'pref-1',
        false,
      )

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/api/preferencias/pref-1',
        false,
      )
      expect(resultado.id).toBe('pref-1')
    })
  })

  describe('toggleSeguir', () => {
    it('deve alternar seguimento de entidade', async () => {
      const mockResponse = {
        seguindo: true,
        mensagem: 'Seguindo entidade',
        subscricaoId: 'sub-123',
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse)

      const resultado = await notificacaoApi.toggleSeguir({
        sistemaId: 'sistema-1',
        entidadeOrigemId: 'entidade-1',
      })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/subscricoes/seguir',
        {
          sistemaId: 'sistema-1',
          entidadeOrigemId: 'entidade-1',
        },
      )
      expect(resultado.seguindo).toBe(true)
    })
  })

  describe('verificarSeguindo', () => {
    it('deve verificar status de seguimento', async () => {
      const mockResponse = {
        seguindo: false,
      }

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse)

      const resultado = await notificacaoApi.verificarSeguindo(
        'sistema-1',
        'entidade-1',
      )

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/subscricoes/estou-seguindo',
        expect.objectContaining({
          params: {
            sistemaId: 'sistema-1',
            entidadeOrigemId: 'entidade-1',
          },
        }),
      )
      expect(resultado.seguindo).toBe(false)
    })
  })

  describe('verificarSaude', () => {
    it('deve retornar status de saúde da API', async () => {
      const mockSaude = {
        status: 'Healthy',
        service: 'EGestao-Notificacao',
        version: '1.0.0',
        timestamp: '2025-01-23T10:00:00Z',
      }

      mockAxiosInstance.get.mockResolvedValue({
        data: mockSaude,
      } as AxiosResponse)

      const resultado = await notificacaoApi.verificarSaude()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/health')
      expect(resultado.status).toBe('Healthy')
    })
  })
})
