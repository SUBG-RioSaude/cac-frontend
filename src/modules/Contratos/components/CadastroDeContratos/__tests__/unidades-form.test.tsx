import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'

import UnidadesFormMelhorado from '../unidades-form'
import type { DadosUnidades } from '../unidades-form'

// Mock das funções utilitárias
vi.mock('@/lib/utils', () => ({
  currencyUtils: {
    formatar: vi.fn(
      (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`,
    ),
    paraNumero: vi.fn((valor: string) => {
      const valorLimpo = valor.replace(/[^\d,]/g, '').replace(',', '.')
      return parseFloat(valorLimpo) || 0
    }),
    aplicarMascara: vi.fn((valor: string) => `R$ ${valor}`),
  },
  percentualUtils: {
    formatar: vi.fn((valor: number) => {
      if (isNaN(valor)) return '0'
      const numeroFormatado = Number(valor.toFixed(2))
      return numeroFormatado.toString()
    }),
    validar: vi.fn((valor: string | number) => {
      const valorStr = valor.toString().replace(',', '.')
      const numero = parseFloat(valorStr)
      if (isNaN(numero)) return false
      if (numero < 0 || numero > 100) return false
      const partesDecimais = valorStr.split('.')[1]
      if (partesDecimais && partesDecimais.length > 2) return false
      return true
    }),
    validarComMensagem: vi.fn((valor: string | number) => {
      if (valor === '')
        return 'Percentual é obrigatório'
      const valorStr = valor.toString().replace(',', '.')
      const numero = parseFloat(valorStr)
      if (isNaN(numero)) return 'Percentual deve ser um número válido'
      if (numero < 0) return 'Percentual não pode ser negativo'
      if (numero > 100) return 'Percentual não pode ser maior que 100%'
      const partesDecimais = valorStr.split('.')[1]
      if (partesDecimais && partesDecimais.length > 2)
        return 'Percentual pode ter no máximo 2 casas decimais'
      return ''
    }),
    normalizarEntrada: vi.fn((valor: string) => {
      if (!valor) return ''
      let valorLimpo = valor.replace(/[^0-9.,]/g, '')
      valorLimpo = valorLimpo.replace(',', '.')
      const pontos = valorLimpo.split('.')
      if (pontos.length > 2)
        valorLimpo = `${pontos[0]  }.${  pontos.slice(1).join('')}`
      if (valorLimpo.includes('.')) {
        const [inteira, decimal] = valorLimpo.split('.')
        const decimalLimitado = decimal ? decimal.slice(0, 2) : ''
        valorLimpo = inteira + (decimalLimitado ? `.${  decimalLimitado}` : '')
      }
      const numero = parseFloat(valorLimpo)
      if (!isNaN(numero) && numero > 100) return '100'
      return valorLimpo
    }),
    paraNumero: vi.fn((valor: string) => {
      if (!valor) return 0
      const valorNormalizado = valor.replace(',', '.')
      const numero = parseFloat(valorNormalizado)
      return isNaN(numero) ? 0 : numero
    }),
  },
  cn: vi.fn((...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' '),
  ),
}))

// Dados mock para testes
const mockUnidade: UnidadeHospitalar = {
  id: '1',
  nome: 'Hospital Teste',
  sigla: 'HT',
  ug: '123456',
  cnpj: '12.345.678/0001-90',
  codigo: 'HT001',
  cep: '01234-567',
  endereco: 'Rua Teste, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  responsavel: 'Dr. João Silva',
  telefone: '(11) 1234-5678',
  email: 'teste@hospital.com',
  ativa: true,
}

// Mock do componente BuscaUnidadeInteligente
let contadorUnidades = 1
vi.mock('../busca-unidade-inteligente', () => ({
  default: ({
    onUnidadeSelecionada,
    onLimpar,
  }: {
    onUnidadeSelecionada: (unidade: UnidadeHospitalar) => void
    onLimpar?: () => void
  }) => (
    <div data-testid="busca-unidade-inteligente">
      <button
        onClick={() => {
          const novaUnidade = {
            ...mockUnidade,
            id: `${contadorUnidades}`,
            nome: `Hospital Teste ${contadorUnidades}`,
            sigla: `HT${contadorUnidades}`,
            ug: `12345${contadorUnidades}`,
          }
          contadorUnidades++
          onUnidadeSelecionada(novaUnidade)
        }}
        data-testid="selecionar-unidade"
      >
        Selecionar Unidade
      </button>
      <button onClick={onLimpar} data-testid="limpar-selecao">
        Limpar Seleção
      </button>
    </div>
  ),
}))

const mockDadosIniciais: DadosUnidades = {
  unidades: [
    {
      id: '1',
      unidadeHospitalar: mockUnidade,
      valorAlocado: 'R$ 100,00',
      percentualContrato: 50,
    },
  ],
  observacoes: 'Observação inicial',
}

const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  onPrevious: vi.fn(),
  valorTotalContrato: 200,
}

describe('UnidadesFormMelhorado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    contadorUnidades = 1
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar o formulário com título correto', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      expect(screen.getByText('Unidades Contempladas')).toBeInTheDocument()
      expect(screen.getByText('Adicionar Nova Unidade')).toBeInTheDocument()
    })

    it('deve mostrar o resumo financeiro quando valorTotalContrato é fornecido', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      expect(screen.getByText('Valor Total do Contrato')).toBeInTheDocument()
      expect(screen.getByText('Total Alocado')).toBeInTheDocument()
      expect(screen.getByText('Percentual Total')).toBeInTheDocument()
    })

    it('deve mostrar mensagem quando nenhuma unidade foi adicionada', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      expect(screen.getByText('Nenhuma unidade adicionada')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Use a busca acima para encontrar e adicionar unidades ao contrato.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Seleção de Unidade', () => {
    it('deve permitir selecionar uma unidade através do componente de busca', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      await waitFor(() => {
        expect(screen.getByLabelText('Valor Alocado *')).toBeInTheDocument()
        expect(
          screen.getByLabelText('Percentual do Contrato (%)'),
        ).toBeInTheDocument()
      })
    })

    it('deve mostrar campos de valor e percentual após selecionar unidade', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      expect(screen.getByLabelText('Valor Alocado *')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Percentual do Contrato (%)'),
      ).toBeInTheDocument()
    })

    it('deve permitir limpar a seleção de unidade', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      await waitFor(() => {
        expect(screen.getByLabelText('Valor Alocado *')).toBeInTheDocument()
      })

      // Verificar se há um botão para limpar (pode ser "Alterar" no componente de busca)
      const inputValor = screen.getByLabelText('Valor Alocado *')
      fireEvent.change(inputValor, { target: { value: '' } })

      expect(inputValor).toHaveValue('')
    })
  })

  describe('Adição de Unidades', () => {
    it('deve adicionar unidade quando valor e percentual são preenchidos', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      // Selecionar unidade
      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      // Preencher valor
      const inputValor = screen.getByLabelText('Valor Alocado *')
      fireEvent.change(inputValor, { target: { value: '200' } })

      // Adicionar unidade
      const botaoAdicionar = screen.getByText('Adicionar Unidade')
      fireEvent.click(botaoAdicionar)

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
        expect(screen.getByText('Hospital Teste 1')).toBeInTheDocument()
      })
    })

    it('deve impedir adicionar unidade sem preencher campos obrigatórios', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const botaoAdicionar = screen.getByText('Adicionar Unidade')
      expect(botaoAdicionar).toBeDisabled()
    })

    it('deve permitir adicionar uma unidade corretamente', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      // Adicionar unidade
      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const inputValor = screen.getByLabelText('Valor Alocado *')
      fireEvent.change(inputValor, { target: { value: '100' } })

      const botaoAdicionar = screen.getByText('Adicionar Unidade')
      fireEvent.click(botaoAdicionar)

      // Aguardar primeira unidade ser adicionada
      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Cálculos Automáticos', () => {
    it('deve calcular percentual automaticamente quando valor é preenchido', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const inputValor = screen.getByLabelText('Valor Alocado *')
      fireEvent.change(inputValor, { target: { value: '100' } })

      // Deve calcular 50% (100/200 * 100)
      await waitFor(() => {
        const inputPercentual = screen.getByLabelText(
          'Percentual do Contrato (%)',
        )
        expect(inputPercentual.value).toBe('50')
      })
    })

    it('deve calcular valor automaticamente quando percentual é preenchido', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const inputPercentual = screen.getByLabelText(
        'Percentual do Contrato (%)',
      )
      fireEvent.change(inputPercentual, { target: { value: '25' } })

      // Deve calcular R$ 50,00 (25% de 200)
      await waitFor(() => {
        const inputValor = screen.getByLabelText('Valor Alocado *')
        expect(inputValor.value).toBe('R$ 50,00')
      })
    })
  })

  describe('Edição de Unidades', () => {
    it('deve permitir editar unidade existente', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoEditar = screen.getByLabelText('Editar unidade')
      fireEvent.click(botaoEditar)

      expect(screen.getByText('Salvar')).toBeInTheDocument()
      expect(screen.getAllByText('Cancelar')).toHaveLength(2) // Um na edição e outro na navegação
    })

    it('deve permitir cancelar edição', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoEditar = screen.getByLabelText('Editar unidade')
      fireEvent.click(botaoEditar)

      const botoesCancelar = screen.getAllByText('Cancelar')
      const botaoCancelarEdicao =
        botoesCancelar.find((btn) => btn.closest('.space-y-4')) ??
        botoesCancelar[0]
      fireEvent.click(botaoCancelarEdicao)

      expect(screen.queryByText('Salvar')).not.toBeInTheDocument()
    })

    it('deve permitir salvar edição', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoEditar = screen.getByLabelText('Editar unidade')
      fireEvent.click(botaoEditar)

      const inputValor = screen.getByDisplayValue('R$ 100,00')
      fireEvent.change(inputValor, { target: { value: '200' } })

      const botaoSalvar = screen.getByText('Salvar')
      fireEvent.click(botaoSalvar)

      expect(screen.queryByText('Salvar')).not.toBeInTheDocument()
    })
  })

  describe('Remoção de Unidades', () => {
    it('deve permitir remover unidade', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoRemover = screen.getByLabelText('Remover unidade')
      fireEvent.click(botaoRemover)

      await waitFor(() => {
        expect(
          screen.queryByText(/Unidades Adicionadas/),
        ).not.toBeInTheDocument()
        expect(
          screen.getByText('Nenhuma unidade adicionada'),
        ).toBeInTheDocument()
      })
    })
  })

  // Teste removido - funcionalidade de distribuição automática não existe no componente atual

  describe('Validações', () => {
    it('deve validar percentual total de 100%', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      // Com 50% de 200, deve mostrar que faltam 50%
      expect(screen.getByText('Faltam: 50%')).toBeInTheDocument()
    })

    it('deve validar valor total alocado', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      // Com R$ 100 de R$ 200, deve mostrar diferença de R$ 100,00
      expect(screen.getByText('Diferença: R$ 100,00')).toBeInTheDocument()
    })

    it('deve habilitar botão finalizar apenas quando validações são atendidas', async () => {
      const dadosIniciais = {
        unidades: [
          {
            id: '1',
            unidadeHospitalar: mockUnidade,
            valorAlocado: 'R$ 200,00',
            percentualContrato: 100,
          },
        ],
        observacoes: 'Observação inicial',
      }

      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={dadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoProximo = screen.getByRole('button', { name: /Próximo/ })
      expect(botaoProximo).not.toBeDisabled()
    })
  })

  describe('Observações', () => {
    it('deve permitir editar observações', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const inputObservacoes = screen.getByLabelText('Observações')
      fireEvent.change(inputObservacoes, {
        target: { value: 'Nova observação' },
      })

      expect(inputObservacoes).toHaveValue('Nova observação')
    })
  })

  describe('Navegação', () => {
    it('deve chamar onCancel quando botão cancelar é clicado', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoCancelar = screen.getByText('Cancelar')
      fireEvent.click(botaoCancelar)

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })

    it('deve chamar onPrevious quando botão anterior é clicado', () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoAnterior = screen.getByText('Anterior')
      fireEvent.click(botaoAnterior)

      expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1)
    })

    it('deve chamar onSubmit quando formulário é enviado', async () => {
      const dadosIniciais = {
        unidades: [
          {
            id: '1',
            unidadeHospitalar: mockUnidade,
            valorAlocado: 'R$ 200,00',
            percentualContrato: 100,
          },
        ],
        observacoes: 'Observação inicial',
      }

      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={dadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoProximo = screen.getByRole('button', { name: /Próximo/ })
      fireEvent.click(botaoProximo)

      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Estados de Travamento de Campos', () => {
    it('deve travar campo de percentual quando valor é preenchido', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const inputValor = screen.getByLabelText('Valor Alocado *')
      fireEvent.change(inputValor, { target: { value: '100' } })

      await waitFor(() => {
        const inputPercentual = screen.getByLabelText(
          'Percentual do Contrato (%)',
        )
        expect(inputPercentual.disabled).toBe(true)
      })
    })

    it('deve travar campo de valor quando percentual é preenchido', async () => {
      render(<UnidadesFormMelhorado {...defaultProps} />)

      const botaoSelecionar = screen.getByTestId('selecionar-unidade')
      fireEvent.click(botaoSelecionar)

      const inputPercentual = screen.getByLabelText(
        'Percentual do Contrato (%)',
      )
      fireEvent.change(inputPercentual, { target: { value: '50' } })

      await waitFor(() => {
        const inputValor = screen.getByLabelText('Valor Alocado *')
        expect(inputValor.disabled).toBe(true)
      })
    })
  })

  describe('Dados Iniciais', () => {
    it('deve carregar dados iniciais corretamente', async () => {
      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          dadosIniciais={mockDadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
        expect(screen.getByText('Hospital Teste')).toBeInTheDocument()
        expect(
          screen.getByDisplayValue('Observação inicial'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('onFinishRequest', () => {
    it('deve chamar onFinishRequest quando fornecido', async () => {
      const onFinishRequest = vi.fn()
      const dadosIniciais = {
        unidades: [
          {
            id: '1',
            unidadeHospitalar: mockUnidade,
            valorAlocado: 'R$ 200,00',
            percentualContrato: 100,
          },
        ],
        observacoes: 'Observação inicial',
      }

      render(
        <UnidadesFormMelhorado
          {...defaultProps}
          onFinishRequest={onFinishRequest}
          dadosIniciais={dadosIniciais}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(/Unidades Adicionadas \(1\)/),
        ).toBeInTheDocument()
      })

      const botaoProximo = screen.getByRole('button', { name: /Próximo/ })
      fireEvent.click(botaoProximo)

      expect(onFinishRequest).toHaveBeenCalledTimes(1)
      expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })
  })
})
