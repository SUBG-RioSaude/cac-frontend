import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getDocumentos,
  saveDocumentosMultiplos,
  saveDocumentoStatus,
  uploadDocumento,
  deleteDocumento,
  updateDocumento,
  createDocumento,
} from '../documentos-service'
import type {
  DocumentoApiResponse,
  SaveDocumentosMultiplosPayload,
  DocumentoMultiplo,
} from '@/modules/Contratos/types/contrato'

// Mock do axios
const mockExecuteWithFallback = vi.fn()
vi.mock('@/lib/axios', () => ({
  executeWithFallback: (...args: unknown[]) => mockExecuteWithFallback(...args),
}))

describe('documentos-service', () => {
  const contratoId = 'contrato-123'

  const mockDocumentoApiResponse: DocumentoApiResponse = {
    id: 'doc-1',
    contratoId,
    tipoDocumento: 'TermoReferencia',
    tipoDocumentoNumero: 1,
    nomeTipoDocumento: 'Termo de Referência/Edital',
    urlDocumento: 'https://exemplo.com',
    dataEntrega: '2025-01-01T10:00:00Z',
    observacoes: 'Documento teste',
    ativo: true,
    dataCadastro: '2025-01-01T10:00:00Z',
    dataAtualizacao: '2025-01-01T10:00:00Z',
    usuarioCadastroId: 'user-1',
    usuarioAtualizacaoId: 'user-1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDocumentos', () => {
    it('deve buscar documentos de um contrato', async () => {
      const mockResponse = [mockDocumentoApiResponse]
      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const result = await getDocumentos(contratoId)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: `/documentos-contrato/contrato/${contratoId}`,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'doc-1',
        contratoId,
        nome: 'Termo de Referência/Edital',
        tipo: '1', // Mapeado de TermoReferencia para 1
        status: 'conferido', // Mapeado de ativo: true
        linkExterno: 'https://exemplo.com',
      })
    })

    it('deve retornar array vazio para contratoId vazio', async () => {
      const result = await getDocumentos('')

      expect(result).toEqual([])
      expect(mockExecuteWithFallback).not.toHaveBeenCalled()
    })

    it('deve mapear "sem url" para linkExterno null', async () => {
      const mockResponseComSemUrl = [
        {
          ...mockDocumentoApiResponse,
          urlDocumento: 'sem url',
        },
      ]

      mockExecuteWithFallback.mockResolvedValue({ data: mockResponseComSemUrl })

      const result = await getDocumentos(contratoId)

      expect(result[0].linkExterno).toBe(null)
    })

    it('deve mapear campo ativo para status', async () => {
      const mockResponseInativo = [
        {
          ...mockDocumentoApiResponse,
          ativo: false,
        },
      ]

      mockExecuteWithFallback.mockResolvedValue({ data: mockResponseInativo })

      const result = await getDocumentos(contratoId)

      expect(result[0].status).toBe('pendente')
    })
  })

  describe('saveDocumentosMultiplos', () => {
    const mockPayload: SaveDocumentosMultiplosPayload = {
      documentos: [
        {
          tipoDocumento: 1,
          urlDocumento: 'https://exemplo.com',
          dataEntrega: '2025-01-01T10:00:00Z',
          observacoes: 'Teste',
          selecionado: true,
        },
      ],
    }

    it('deve salvar múltiplos documentos', async () => {
      const mockResponse = [mockDocumentoApiResponse]
      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const result = await saveDocumentosMultiplos(contratoId, mockPayload)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: `/documentos-contrato/contrato/${contratoId}/multiplos`,
        data: mockPayload,
      })

      expect(result).toHaveLength(1)
      expect(result[0].tipo).toBe('1')
    })

    it('deve lidar com erro da API', async () => {
      const errorMessage = 'Erro ao salvar documentos'
      mockExecuteWithFallback.mockRejectedValue(new Error(errorMessage))

      await expect(
        saveDocumentosMultiplos(contratoId, mockPayload),
      ).rejects.toThrow(errorMessage)
    })
  })

  describe('saveDocumentoStatus', () => {
    const mockDocumento: DocumentoMultiplo = {
      tipoDocumento: 1,
      urlDocumento: 'sem url',
      dataEntrega: '2025-01-01T10:00:00Z',
      observacoes: '',
      selecionado: true,
    }

    it('deve salvar status de documento individual', async () => {
      const mockResponse = [mockDocumentoApiResponse]
      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const result = await saveDocumentoStatus(contratoId, mockDocumento)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: `/documentos-contrato/contrato/${contratoId}/multiplos`,
        data: {
          documentos: [mockDocumento],
        },
      })

      expect(result).toHaveLength(1)
    })
  })

  describe('uploadDocumento', () => {
    it('deve fazer upload de arquivo', async () => {
      const mockFormData = new FormData()
      const mockResponse = mockDocumentoApiResponse
      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const result = await uploadDocumento(contratoId, mockFormData)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: '/documentos-contrato',
        data: mockFormData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteDocumento', () => {
    it('deve excluir documento', async () => {
      const documentoId = 'doc-1'
      mockExecuteWithFallback.mockResolvedValue({ data: undefined })

      await deleteDocumento(documentoId)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'delete',
        url: `/documentos-contrato/${documentoId}`,
      })
    })
  })

  describe('updateDocumento', () => {
    it('deve atualizar documento existente', async () => {
      const documentoId = 'doc-1'
      const payload = {
        urlDocumento: 'https://novo-url.com',
        observacoes: 'Nova observação',
      }

      mockExecuteWithFallback.mockResolvedValue({
        data: mockDocumentoApiResponse,
      })

      const result = await updateDocumento(documentoId, payload)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'put',
        url: `/documentos-contrato/${documentoId}`,
        data: payload,
      })

      expect(result.tipo).toBe('1')
    })
  })

  describe('createDocumento', () => {
    it('deve criar novo documento', async () => {
      const payload = {
        contratoId,
        tipoDocumento: 1,
        urlDocumento: 'https://exemplo.com',
        dataEntrega: '2025-01-01T10:00:00Z',
        observacoes: 'Novo documento',
      }

      mockExecuteWithFallback.mockResolvedValue({
        data: mockDocumentoApiResponse,
      })

      const result = await createDocumento(payload)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: '/documentos-contrato',
        data: payload,
      })

      expect(result.nome).toBe('Termo de Referência/Edital')
    })
  })

  describe('Mapeamento de tipos', () => {
    it('deve mapear tipos de documento corretamente', async () => {
      const tiposParaTestar = [
        { api: 'TermoReferencia', numero: 1 },
        { api: 'Homologacao', numero: 2 },
        { api: 'AtaRegistroPrecos', numero: 3 },
        { api: 'GarantiaContratual', numero: 4 },
        { api: 'Contrato', numero: 5 },
        { api: 'PublicacaoPNCP', numero: 6 },
        { api: 'PublicacaoExtrato', numero: 7 },
      ]

      for (const { api, numero } of tiposParaTestar) {
        const mockResponse = [
          {
            ...mockDocumentoApiResponse,
            tipoDocumento: api,
          },
        ]

        mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

        const result = await getDocumentos(contratoId)

        expect(result[0].tipo).toBe(numero.toString())
      }
    })

    it('deve lidar com tipo desconhecido', async () => {
      const mockResponse = [
        {
          ...mockDocumentoApiResponse,
          tipoDocumento: 'TipoDesconhecido',
        },
      ]

      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const result = await getDocumentos(contratoId)

      expect(result[0].tipo).toBe('0') // Fallback para tipo desconhecido
    })
  })
})
