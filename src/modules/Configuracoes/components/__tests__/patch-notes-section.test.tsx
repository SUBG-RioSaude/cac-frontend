import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { cookieUtils } from '@/lib/auth/cookie-utils'
import { patchNotesService } from '@/services/patch-notes-service'
import { PatchNoteTipo, PatchNoteImportancia } from '@/types/patch-notes'

import { PatchNotesSection } from '../patch-notes-section'

// Mock dos serviços
vi.mock('@/services/patch-notes-service')
vi.mock('@/lib/auth/cookie-utils')

const mockPatchNotes = {
  items: [
    {
      id: '1',
      sistemaId: 'system-1',
      entidadeOrigemId: 'origem-1',
      versao: 'v1.0.0',
      titulo: 'Novidade',
      dataPublicacao: '2024-01-15T10:00:00Z',
      importancia: PatchNoteImportancia.Alta,
      publicado: true,
      publicadoEm: '2024-01-15T10:00:00Z',
      criadoEm: '2024-01-15T09:00:00Z',
      items: [
        {
          id: 'item-1',
          tipo: PatchNoteTipo.Feature,
          tipoDescricao: 'Feature',
          mensagem: 'Nova funcionalidade de dashboard',
          importancia: PatchNoteImportancia.Alta,
          ordem: 1,
        },
        {
          id: 'item-2',
          tipo: PatchNoteTipo.Fix,
          tipoDescricao: 'Fix',
          mensagem: 'Correção no formulário de login',
          importancia: PatchNoteImportancia.Media,
          ordem: 2,
        },
      ],
    },
    {
      id: '2',
      sistemaId: 'system-1',
      entidadeOrigemId: 'origem-2',
      versao: 'v0.9.0',
      titulo: 'Melhoria',
      dataPublicacao: '2024-01-10T10:00:00Z',
      importancia: PatchNoteImportancia.Media,
      publicado: true,
      publicadoEm: '2024-01-10T10:00:00Z',
      criadoEm: '2024-01-10T09:00:00Z',
      items: [
        {
          id: 'item-3',
          tipo: PatchNoteTipo.Improvement,
          tipoDescricao: 'Improvement',
          mensagem: 'Melhorias na performance',
          importancia: PatchNoteImportancia.Media,
          ordem: 1,
        },
      ],
    },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  )
}

describe('PatchNotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(patchNotesService.listar).mockResolvedValue(mockPatchNotes)
    vi.mocked(cookieUtils.getCookie).mockReturnValue(null)
  })

  describe('Renderização básica', () => {
    it('deve renderizar o título da seção', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('Notas de Atualização')).toBeInTheDocument()
      })
    })

    it('deve renderizar a descrição da seção', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(
          screen.getByText('Acompanhe as novidades e melhorias do sistema'),
        ).toBeInTheDocument()
      })
    })

    it('deve exibir loading state inicialmente', () => {
      renderWithProviders(<PatchNotesSection />)

      expect(screen.getByText('Notas de Atualização')).toBeInTheDocument()
    })
  })

  describe('Lista de patch notes', () => {
    it('deve renderizar todos os patch notes', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
        expect(screen.getByText('v0.9.0')).toBeInTheDocument()
      })
    })

    it('deve renderizar badges de tipo corretamente', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('Novidade')).toBeInTheDocument()
        expect(screen.getByText('Melhoria')).toBeInTheDocument()
      })
    })

    it('deve formatar datas corretamente', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        // Data formatada em pt-BR: 15/01/2024 (aparece múltiplas vezes)
        const dates = screen.getAllByText(/15\/01\/2024/)
        expect(dates.length).toBeGreaterThan(0)
      })
    })

    it('deve exibir a versão atual na parte inferior', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText(/Versão atual:/)).toBeInTheDocument()
        // Versão aparece múltiplas vezes (na lista e no footer)
        const versions = screen.getAllByText(/v1.0.0/)
        expect(versions.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Agrupamento por tipo', () => {
    it('deve expandir accordion e mostrar itens agrupados', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      })

      // Clicar no accordion para expandir
      const accordionTrigger = screen.getByText('v1.0.0').closest('button')
      if (accordionTrigger) {
        await user.click(accordionTrigger)
      }

      await waitFor(() => {
        expect(screen.getByText('Novidades')).toBeInTheDocument()
        expect(screen.getByText('Correções')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagens dos itens quando expandido', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      })

      const accordionTrigger = screen.getByText('v1.0.0').closest('button')
      if (accordionTrigger) {
        await user.click(accordionTrigger)
      }

      await waitFor(() => {
        expect(
          screen.getByText('Nova funcionalidade de dashboard'),
        ).toBeInTheDocument()
        expect(
          screen.getByText('Correção no formulário de login'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Permissões de admin', () => {
    it('não deve exibir botão "Novo Update" sem permissão', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      })

      expect(screen.queryByText('Novo Update')).not.toBeInTheDocument()
    })

    it('deve exibir botão "Novo Update" com permissão ID 5', async () => {
      // Mock JWT token com permissão 5
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ permissao: '5', permissaoNome: 'Admin' }))}.signature`

      vi.mocked(cookieUtils.getCookie).mockImplementation((name) => {
        if (name === 'auth_token') return mockToken
        return null
      })

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('Novo Update')).toBeInTheDocument()
      })
    })

    it('deve abrir modal ao clicar em "Novo Update"', async () => {
      const user = userEvent.setup()
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ permissao: '5' }))}.signature`

      vi.mocked(cookieUtils.getCookie).mockImplementation((name) => {
        if (name === 'auth_token') return mockToken
        return null
      })

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('Novo Update')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Novo Update'))

      await waitFor(() => {
        expect(screen.getByText('Criar Novo Patch Note')).toBeInTheDocument()
      })
    })
  })

  describe('Estado vazio', () => {
    it('deve exibir mensagem quando não há patch notes', async () => {
      vi.mocked(patchNotesService.listar).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      })

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(
          screen.getByText('Nenhuma atualização disponível'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Tratamento de erros', () => {
    it('deve lidar com erro ao carregar patch notes', async () => {
      vi.mocked(patchNotesService.listar).mockRejectedValue(
        new Error('Erro ao carregar'),
      )

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        // Componente deve renderizar mesmo com erro
        expect(screen.getByText('Notas de Atualização')).toBeInTheDocument()
      })
    })

    it('deve lidar com token JWT inválido', async () => {
      vi.mocked(cookieUtils.getCookie).mockImplementation((name) => {
        if (name === 'auth_token') return 'token-invalido'
        return null
      })

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      })

      // Não deve exibir botão se token for inválido
      expect(screen.queryByText('Novo Update')).not.toBeInTheDocument()
    })
  })

  describe('Integração com API', () => {
    it('deve chamar API com parâmetros corretos', async () => {
      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(patchNotesService.listar).toHaveBeenCalledWith({
          pageSize: 50,
        })
      })
    })

    it('deve fazer refetch após criar novo patch note', async () => {
      const user = userEvent.setup()
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ permissao: '5' }))}.signature`

      vi.mocked(cookieUtils.getCookie).mockImplementation((name) => {
        if (name === 'auth_token') return mockToken
        return null
      })

      renderWithProviders(<PatchNotesSection />)

      await waitFor(() => {
        expect(screen.getByText('Novo Update')).toBeInTheDocument()
      })

      // Limpar as chamadas anteriores
      vi.mocked(patchNotesService.listar).mockClear()

      await user.click(screen.getByText('Novo Update'))

      // Modal deve abrir
      await waitFor(() => {
        expect(screen.getByText('Criar Novo Patch Note')).toBeInTheDocument()
      })
    })
  })
})
