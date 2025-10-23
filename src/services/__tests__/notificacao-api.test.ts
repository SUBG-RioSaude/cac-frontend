/**
 * Testes para o serviço de API de notificações
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosResponse } from 'axios'

import { apiGateway } from '@/lib/axios'
import * as notificacaoApi from '../notificacao-api'
import type { NotificacaoUsuario } from '@/types/notificacao'

// Mock do apiGateway
vi.mock('@/lib/axios', () => ({
  apiGateway: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.listarMinhasNotificacoes()

      expect(apiGateway.get).toHaveBeenCalledWith(
        expect.stringContaining('/minhas'),
        expect.objectContaining({
          params: { page: 1, pageSize: 20 },
        }),
      )
      expect(resultado).toEqual(mockData)
    })

    it('deve aceitar filtros customizados', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { items: [], page: 2, pageSize: 10, naoLidas: 0 },
      } as AxiosResponse)

      await notificacaoApi.listarMinhasNotificacoes({ page: 2, pageSize: 10 })

      expect(apiGateway.get).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.contarNaoLidas()

      expect(apiGateway.get).toHaveBeenCalledWith(
        expect.stringContaining('/nao-lidas'),
      )
      expect(resultado).toEqual(mockData)
      expect(resultado.naoLidas).toBe(5)
    })
  })

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Sucesso' },
      } as AxiosResponse)

      await notificacaoApi.marcarComoLida('notif-123')

      expect(apiGateway.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-123/marcar-lida'),
      )
    })
  })

  describe('arquivar', () => {
    it('deve arquivar notificação', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Arquivada' },
      } as AxiosResponse)

      await notificacaoApi.arquivar('notif-456')

      expect(apiGateway.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-456/arquivar'),
      )
    })
  })

  describe('desarquivar', () => {
    it('deve desarquivar notificação', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Desarquivada' },
      } as AxiosResponse)

      await notificacaoApi.desarquivar('notif-789')

      expect(apiGateway.put).toHaveBeenCalledWith(
        expect.stringContaining('/notif-789/desarquivar'),
      )
    })
  })

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas como lidas sem filtro', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Todas marcadas' },
      } as AxiosResponse)

      await notificacaoApi.marcarTodasComoLidas()

      expect(apiGateway.put).toHaveBeenCalledWith(
        expect.stringContaining('/marcar-todas-lidas'),
        null,
        expect.objectContaining({
          params: undefined,
        }),
      )
    })

    it('deve aceitar filtro por sistema', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Marcadas do sistema' },
      } as AxiosResponse)

      await notificacaoApi.marcarTodasComoLidas('sistema-123')

      expect(apiGateway.put).toHaveBeenCalledWith(
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
      vi.mocked(apiGateway.put).mockResolvedValue({
        data: { message: 'Arquivadas' },
      } as AxiosResponse)

      await notificacaoApi.arquivarTodasLidas()

      expect(apiGateway.put).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockData,
      } as AxiosResponse)

      const resultado = await notificacaoApi.listarArquivadas()

      expect(apiGateway.get).toHaveBeenCalledWith(
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
      vi.mocked(apiGateway.delete).mockResolvedValue({
        data: {},
      } as AxiosResponse)

      await notificacaoApi.deletarNotificacao('notif-delete')

      expect(apiGateway.delete).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockPreferencias,
      } as AxiosResponse)

      const resultado = await notificacaoApi.obterPreferencias()

      expect(apiGateway.get).toHaveBeenCalledWith('/api/preferencias/minhas')
      expect(resultado).toEqual(mockPreferencias)
    })
  })

  describe('atualizarPreferencia', () => {
    it('deve atualizar preferência', async () => {
      const mockPreferencia = {
        id: 'pref-1',
        habilitada: false,
      }

      vi.mocked(apiGateway.put).mockResolvedValue({
        data: mockPreferencia,
      } as AxiosResponse)

      const resultado = await notificacaoApi.atualizarPreferencia(
        'pref-1',
        false,
      )

      expect(apiGateway.put).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.post).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse)

      const resultado = await notificacaoApi.toggleSeguir({
        sistemaId: 'sistema-1',
        entidadeOrigemId: 'entidade-1',
      })

      expect(apiGateway.post).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse)

      const resultado = await notificacaoApi.verificarSeguindo(
        'sistema-1',
        'entidade-1',
      )

      expect(apiGateway.get).toHaveBeenCalledWith(
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

      vi.mocked(apiGateway.get).mockResolvedValue({
        data: mockSaude,
      } as AxiosResponse)

      const resultado = await notificacaoApi.verificarSaude()

      expect(apiGateway.get).toHaveBeenCalledWith('/api/health')
      expect(resultado.status).toBe('Healthy')
    })
  })
})
