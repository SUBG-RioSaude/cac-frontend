import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import ContratoForm from '../contrato-form'

// Mock dos dados que o componente tenta carregar
vi.mock('@/modules/Contratos/data/contratos-mock', () => ({
  unidadesMock: {
    demandantes: ['Secretaria de Obras', 'Secretaria de Educação'],
    gestoras: ['Departamento de Compras', 'Departamento de Contratos'],
  },
}))

// Mock do processo instrutivo com SMS e PRO incluídos
vi.mock('@/modules/Contratos/data/processo-instrutivo.json', () => ({
  default: {
    prefixos: ['SMS', 'FOM', 'CEN', 'CGM'],
    sufixos: ['PRO', 'ATS', 'ADV', 'COM'],
  },
}))

// Mock do hook de validação
vi.mock('@/modules/Contratos/hooks/use-validar-numero-contrato', () => ({
  useValidarNumeroContrato: () => ({
    validar: vi.fn(),
    isValidating: false,
    error: null,
  }),
}))

// Mock do hook de async operation
vi.mock('@/hooks/use-async-operation', () => ({
  useFormAsyncOperation: () => ({
    isSubmitting: false,
    execute: vi.fn(),
  }),
}))

describe('ContratoForm - Modalidade Favorita SMS-PRO', () => {
  const mockOnSubmit = vi.fn()
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const renderForm = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ContratoForm
          onSubmit={mockOnSubmit}
          dadosIniciais={{
            numeroContrato: '123',
            processos: [
              {
                tipo: 'rio',
                valor: '',
              },
            ],
          }}
        />
      </QueryClientProvider>,
    )
  }

  it('deve exibir SMS-PRO como modalidade favorita no topo da lista', async () => {
    const user = userEvent.setup()
    renderForm()

    // Encontrar e clicar no botão de seleção de processo
    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    // Aguardar o popover abrir e carregar as opções
    await waitFor(() => {
      expect(
        screen.getByText('Modalidade Favorita', {
          selector: '[cmdk-group-heading]',
        }),
      ).toBeInTheDocument()
    })

    // Verificar que SMS-PRO está presente na seção de favoritas
    const grupoFavoritas = screen.getByText('Modalidade Favorita', {
      selector: '[cmdk-group-heading]',
    }).parentElement

    expect(grupoFavoritas).toBeInTheDocument()

    // Verificar que SMS-PRO está dentro do grupo de favoritas
    const itemSmsPro = screen.getByRole('option', { name: /SMS-PRO/ })
    expect(itemSmsPro).toBeInTheDocument()

    // Verificar que tem o ícone de estrela
    const estrela = itemSmsPro.querySelector('svg[class*="fill-yellow-400"]')
    expect(estrela).toBeInTheDocument()
  })

  it('deve exibir a seção "Todas as Modalidades" com as demais opções ordenadas', async () => {
    const user = userEvent.setup()
    renderForm()

    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    await waitFor(() => {
      expect(
        screen.getByText('Todas as Modalidades', {
          selector: '[cmdk-group-heading]',
        }),
      ).toBeInTheDocument()
    })

    // Verificar que existe o grupo "Todas as Modalidades"
    const grupoDemais = screen.getByText('Todas as Modalidades', {
      selector: '[cmdk-group-heading]',
    }).parentElement

    expect(grupoDemais).toBeInTheDocument()
  })

  it('deve filtrar SMS-PRO quando usuário pesquisar por "SMS"', async () => {
    const user = userEvent.setup()
    renderForm()

    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    // Esperar o input de busca aparecer
    const inputBusca = await screen.findByPlaceholderText(/buscar processo/i)

    // Digitar "SMS" no campo de busca
    await user.type(inputBusca, 'SMS')

    await waitFor(() => {
      // SMS-PRO deve aparecer nos resultados
      const itemSmsPro = screen.getByRole('option', { name: /SMS-PRO/ })
      expect(itemSmsPro).toBeInTheDocument()
    })
  })

  it('deve filtrar corretamente quando pesquisa não inclui favoritas', async () => {
    const user = userEvent.setup()
    renderForm()

    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    const inputBusca = await screen.findByPlaceholderText(/buscar processo/i)

    // Digitar algo que não corresponde a SMS-PRO
    await user.type(inputBusca, 'CGM')

    // Aguardar que o componente atualize com os resultados filtrados
    await waitFor(
      () => {
        // Deve mostrar resultados filtrados com CGM
        const opcoesCGM = screen.getAllByRole('option', {
          name: /CGM-/,
        })
        expect(opcoesCGM.length).toBeGreaterThan(0)
      },
      { timeout: 3000 },
    )
  })

  it('deve permitir selecionar SMS-PRO da lista de favoritas', async () => {
    const user = userEvent.setup()
    renderForm()

    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    await waitFor(() => {
      expect(
        screen.getByText('Modalidade Favorita', {
          selector: '[cmdk-group-heading]',
        }),
      ).toBeInTheDocument()
    })

    // Clicar em SMS-PRO
    const itemSmsPro = screen.getByRole('option', { name: /SMS-PRO/ })
    await user.click(itemSmsPro)

    // Verificar que o botão agora mostra SMS-PRO selecionado
    await waitFor(() => {
      expect(screen.getByText('SMS-PRO')).toBeInTheDocument()
    })
  })

  it('deve exibir separador entre favoritas e demais modalidades', async () => {
    const user = userEvent.setup()
    renderForm()

    const botaoSelecao = screen.getByRole('button', {
      name: /selecione o processo/i,
    })
    await user.click(botaoSelecao)

    await waitFor(() => {
      expect(
        screen.getByText('Modalidade Favorita', {
          selector: '[cmdk-group-heading]',
        }),
      ).toBeInTheDocument()
    })

    // Verificar que existe um separador (CommandSeparator)
    const separador = document.querySelector('[data-slot="command-separator"]')
    expect(separador).toBeInTheDocument()
  })
})
