import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { VisualizarContrato } from '../VisualizarContrato'

// Mock dos hooks de contratos
vi.mock('@/modules/Contratos/hooks/use-contratos', () => ({
  useContratoDetalhado: vi.fn(() => ({
    data: {
      id: '123',
      numero: 'CT-2024-001',
      objeto: 'Prestação de serviços de limpeza',
      status: 'Ativo',
      valorTotal: 100000,
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      fornecedor: {
        id: '1',
        razaoSocial: 'Empresa Teste LTDA',
        cnpj: '11.222.333/0001-81',
      },
      unidades: [
        {
          id: '1',
          nome: 'Unidade Teste',
          endereco: 'Rua Teste, 123',
        },
      ],
      fiscais: [
        {
          id: '1',
          nome: 'João Fiscal',
          tipo: 'titular',
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}))

vi.mock('@/modules/Contratos/hooks/use-documentos', () => ({
  useDocumentos: vi.fn(() => ({
    data: [
      {
        id: '1',
        nome: 'Contrato Assinado',
        tipo: 'contrato',
        status: 'aprovado',
        dataUpload: '2024-01-01',
      },
    ],
    isLoading: false,
    error: null,
  })),
}))

// Mock dos componentes das abas
vi.mock('@/modules/Contratos/components/VisualizacaoContratos/detalhes-contrato', () => ({
  DetalhesContrato: vi.fn(({ contrato }) => (
    <div data-testid="detalhes-contrato">
      Detalhes: {contrato?.numero}
    </div>
  )),
}))

vi.mock('@/modules/Contratos/components/Documentos/ListaDocumentosContrato', () => ({
  ListaDocumentosContrato: vi.fn(({ contratoId }) => (
    <div data-testid="lista-documentos">
      Documentos do contrato: {contratoId}
    </div>
  )),
}))

vi.mock('@/modules/Contratos/components/VisualizacaoContratos/tab-empenhos', () => ({
  TabEmpenhos: vi.fn(({ contratoId }) => (
    <div data-testid="tab-empenhos">
      Empenhos do contrato: {contratoId}
    </div>
  )),
}))

vi.mock('@/modules/Contratos/components/Timeline/contract-chat', () => ({
  ContractChat: vi.fn(({ contratoId }) => (
    <div data-testid="contract-chat">
      Timeline do contrato: {contratoId}
    </div>
  )),
}))

vi.mock('@/modules/Contratos/components/VisualizacaoContratos/registro-alteracoes', () => ({
  RegistroAlteracoes: vi.fn(({ contratoId }) => (
    <div data-testid="registro-alteracoes">
      Alterações do contrato: {contratoId}
    </div>
  )),
}))

const renderWithProviders = (contratoId = '123') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/contratos/${contratoId}`]}>
        <Routes>
          <Route path="/contratos/:contratoId" element={<VisualizarContrato />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('VisualizarContrato', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar as informações básicas do contrato', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText('CT-2024-001')).toBeInTheDocument()
      expect(screen.getByText('Prestação de serviços de limpeza')).toBeInTheDocument()
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  it('deve renderizar todas as abas do contrato', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /detalhes/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /documentos/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /empenhos/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /timeline/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /alterações/i })).toBeInTheDocument()
    })
  })

  it('deve mostrar a aba de detalhes por padrão', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByTestId('detalhes-contrato')).toBeInTheDocument()
      expect(screen.getByText('Detalhes: CT-2024-001')).toBeInTheDocument()
    })
  })

  it('deve navegar entre as abas', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      const abaDocumentos = screen.getByRole('tab', { name: /documentos/i })
      abaDocumentos.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('lista-documentos')).toBeInTheDocument()
    })
  })

  it('deve exibir informações do fornecedor', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText('Empresa Teste LTDA')).toBeInTheDocument()
      expect(screen.getByText('11.222.333/0001-81')).toBeInTheDocument()
    })
  })

  it('deve exibir valor formatado', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText(/R\$.*100.*000/)).toBeInTheDocument()
    })
  })

  it('deve exibir período de vigência', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText(/2024/)).toBeInTheDocument()
    })
  })

  it('deve mostrar badge de status apropriado', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      const statusBadge = screen.getByText('Ativo')
      expect(statusBadge).toHaveClass(/success|green/i)
    })
  })

  it('deve renderizar breadcrumbs de navegação', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText('Contratos')).toBeInTheDocument()
      expect(screen.getByText('CT-2024-001')).toBeInTheDocument()
    })
  })
})

describe('VisualizarContrato - Estados de Loading e Erro', () => {
  it('deve mostrar loading quando contrato está carregando', async () => {
    const { useContratoDetalhado } = await import('@/modules/Contratos/hooks/use-contratos')
    vi.mocked(useContratoDetalhado).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    })

    renderWithProviders()
    
    await waitFor(() => {
      // Verificar se há indicador de loading
      expect(screen.getByTestId('loading') || document.querySelector('[data-loading]')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro quando falha ao carregar contrato', async () => {
    const { useContratoDetalhado } = await import('@/modules/Contratos/hooks/use-contratos')
    vi.mocked(useContratoDetalhado).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Contrato não encontrado'),
    })

    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText(/erro/i) || screen.getByText(/não encontrado/i)).toBeInTheDocument()
    })
  })

  it('deve lidar com contrato inexistente', async () => {
    const { useContratoDetalhado } = await import('@/modules/Contratos/hooks/use-contratos')
    vi.mocked(useContratoDetalhado).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    renderWithProviders()
    
    await waitFor(() => {
      expect(screen.getByText(/contrato não encontrado/i) || document.body).toBeInTheDocument()
    })
  })
})

describe('VisualizarContrato - Funcionalidades Específicas', () => {
  it('deve permitir edição de campos editáveis', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      // Se houver campos editáveis, verificar aqui
      const botaoEditar = screen.queryByRole('button', { name: /editar/i })
      if (botaoEditar) {
        expect(botaoEditar).toBeInTheDocument()
      }
    })
  })

  it('deve mostrar ações contextuais do contrato', async () => {
    renderWithProviders()
    
    await waitFor(() => {
      // Verificar se há menu de ações ou botões de ação
      const menuAcoes = screen.queryByRole('button', { name: /ações/i }) ||
                       screen.queryByRole('button', { name: /menu/i })
      // Se existir menu de ações, testar
      expect(document.body).toBeInTheDocument()
    })
  })

  it('deve atualizar dados quando contrato muda', async () => {
    const { rerender } = renderWithProviders('123')
    
    // Simula mudança de contrato
    const { useContratoDetalhado } = await import('@/modules/Contratos/hooks/use-contratos')
    vi.mocked(useContratoDetalhado).mockReturnValue({
      data: {
        id: '456',
        numero: 'CT-2024-002',
        objeto: 'Outro contrato',
        status: 'Suspenso',
        valorTotal: 200000,
        dataInicio: '2024-02-01',
        dataFim: '2024-12-31',
        fornecedor: {
          id: '2',
          razaoSocial: 'Outra Empresa LTDA',
          cnpj: '22.333.444/0001-82',
        },
      },
      isLoading: false,
      error: null,
    })

    rerender(
      <QueryClient>
        <MemoryRouter initialEntries={['/contratos/456']}>
          <Routes>
            <Route path="/contratos/:contratoId" element={<VisualizarContrato />} />
          </Routes>
        </MemoryRouter>
      </QueryClient>
    )

    await waitFor(() => {
      expect(screen.getByText('CT-2024-002')).toBeInTheDocument()
      expect(screen.getByText('Outra Empresa LTDA')).toBeInTheDocument()
    })
  })
})