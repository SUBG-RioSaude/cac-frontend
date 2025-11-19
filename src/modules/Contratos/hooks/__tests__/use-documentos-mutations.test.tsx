import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type {
  DocumentoContratoDto,
  SaveDocumentosMultiplosPayload,
} from '@/modules/Contratos/types/contrato'

import {
  useUpdateDocumentosMultiplos,
  useUpdateDocumentoStatus,
  useUploadDocumento,
  useDeleteDocumento,
} from '../use-documentos-mutations'

// Mock do sonner toast
vi.mock('sonner', () => ({
  toast: {
    dismiss: vi.fn(),
  },
}))

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock dos services
const mockSaveDocumentosMultiplos = vi.fn()
const mockSaveDocumentoStatus = vi.fn()
const mockUploadDocumento = vi.fn()
const mockDeleteDocumento = vi.fn()

vi.mock('@/modules/Contratos/services/documentos-service', () => ({
  saveDocumentosMultiplos: (...args: unknown[]) =>
    mockSaveDocumentosMultiplos(...args),
  saveDocumentoStatus: (...args: unknown[]) => mockSaveDocumentoStatus(...args),
  uploadDocumento: (...args: unknown[]) => mockUploadDocumento(...args),
  deleteDocumento: (...args: unknown[]) => mockDeleteDocumento(...args),
}))

// Mock do useToast
vi.mock('@/modules/Contratos/hooks/use-toast', () => ({
  useToast: () => ({
    mutation: {
      loading: vi.fn(() => 'loading-toast-id'),
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}))

// Mock das query keys
vi.mock('@/modules/Contratos/lib/query-keys', () => ({
  contratoKeys: {
    documentos: (id: string) => ['documentos', id],
  },
}))

// Helper para criar QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useUpdateDocumentosMultiplos', () => {
  const contratoId = 'contrato-123'
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

  const mockResponse: DocumentoContratoDto[] = [
    {
      id: 'doc-1',
      contratoId,
      nome: 'Termo de Referência/Edital',
      tipo: '1',
      categoria: 'obrigatorio',
      status: 'conferido',
      linkExterno: 'https://exemplo.com',
      observacoes: 'Teste',
      dataCadastro: '2025-01-01T10:00:00Z',
      dataAtualizacao: '2025-01-01T10:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve salvar documentos múltiplos com sucesso', async () => {
    mockSaveDocumentosMultiplos.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateDocumentosMultiplos(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(false)

    result.current.mutate({ contratoId, payload: mockPayload })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(mockSaveDocumentosMultiplos).toHaveBeenCalledWith(
      contratoId,
      mockPayload,
    )
  })

  it('deve lidar com erros da API', async () => {
    const errorMessage = 'Erro da API'
    mockSaveDocumentosMultiplos.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useUpdateDocumentosMultiplos(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ contratoId, payload: mockPayload })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(
      expect.objectContaining({
        message: errorMessage,
      }),
    )
  })

  it('deve invalidar cache após sucesso', async () => {
    mockSaveDocumentosMultiplos.mockResolvedValue(mockResponse)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateDocumentosMultiplos(), {
      wrapper,
    })

    result.current.mutate({ contratoId, payload: mockPayload })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['documentos', contratoId],
    })
  })
})

describe('useUpdateDocumentoStatus', () => {
  const contratoId = 'contrato-123'
  const mockDocumento = {
    tipoDocumento: 1,
    urlDocumento: 'sem url',
    dataEntrega: '2025-01-01T10:00:00Z',
    observacoes: '',
    selecionado: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve salvar status de documento individual', async () => {
    const mockResponse: DocumentoContratoDto[] = []
    mockSaveDocumentoStatus.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateDocumentoStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ contratoId, documento: mockDocumento })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    expect(mockSaveDocumentoStatus).toHaveBeenCalledWith(
      contratoId,
      mockDocumento,
    )
  })

  it('deve lidar com erros ao salvar status', async () => {
    const errorMessage = 'Falha ao salvar status'
    mockSaveDocumentoStatus.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useUpdateDocumentoStatus(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ contratoId, documento: mockDocumento })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe(errorMessage)
  })
})

describe('useUploadDocumento', () => {
  const contratoId = 'contrato-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve fazer upload de documento', async () => {
    const mockFormData = new FormData()
    mockFormData.append('file', new File(['test'], 'test.pdf'))

    const mockResponse: DocumentoContratoDto = {
      id: 'doc-1',
      contratoId,
      nome: 'Documento Teste',
      tipo: '1',
      categoria: 'obrigatorio',
      status: 'conferido',
      dataCadastro: '2025-01-01T10:00:00Z',
      dataAtualizacao: '2025-01-01T10:00:00Z',
    }

    mockUploadDocumento.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUploadDocumento(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ contratoId, formData: mockFormData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockUploadDocumento).toHaveBeenCalledWith(contratoId, mockFormData)
  })
})

describe('useDeleteDocumento', () => {
  const contratoId = 'contrato-123'
  const documentoId = 'doc-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve excluir documento', async () => {
    mockDeleteDocumento.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteDocumento(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ contratoId, documentoId })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteDocumento).toHaveBeenCalledWith(documentoId)
  })

  it('deve fazer optimistic update ao excluir', async () => {
    mockDeleteDocumento.mockResolvedValue(undefined)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Simular dados existentes no cache
    const mockDocumentos: DocumentoContratoDto[] = [
      {
        id: documentoId,
        contratoId,
        nome: 'Documento Teste',
        tipo: '1',
        categoria: 'obrigatorio',
        status: 'conferido',
        dataCadastro: '2025-01-01T10:00:00Z',
        dataAtualizacao: '2025-01-01T10:00:00Z',
      },
    ]

    queryClient.setQueryData(['documentos', contratoId], mockDocumentos)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteDocumento(), { wrapper })

    result.current.mutate({ contratoId, documentoId })

    // Aguardar o optimistic update ser aplicado
    await waitFor(() => {
      const cacheData = queryClient.getQueryData(['documentos', contratoId])!
      expect(cacheData).toEqual([])
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})
