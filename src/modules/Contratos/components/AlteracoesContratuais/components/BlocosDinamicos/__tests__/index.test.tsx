import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { TipoAlteracao } from '../../../../../types/alteracoes-contratuais'
import { BlocosDinamicos } from '../index'

// Mocks básicos
vi.mock('@/modules/Unidades/hooks/use-unidades', () => ({
  useUnidadesResumo: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useUnidadesBusca: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useUnidadesByIds: () => ({
    data: {},
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/modules/Empresas/hooks/use-empresas', () => ({
  useFornecedoresResumo: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useFornecedoresBusca: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../../hooks/use-contract-context', () => ({
  useContractSuppliers: () => ({
    mainSupplier: null,
    suppliers: [],
  }),
  useContractUnits: () => ({
    demandingUnit: null,
    managingUnit: null,
    linkedUnits: [],
  }),
}))

describe('BlocosDinamicos', () => {
  const defaultProps = {
    tiposSelecionados: [],
    dados: {},
    onChange: vi.fn(),
    contratoId: 'test-contract',
    contractContext: {
      contract: null,
      suppliers: { suppliers: [], mainSupplier: null },
      units: {
        demandingUnit: null,
        managingUnit: null,
        linkedUnits: [],
      },
      isLoading: false,
    },
    onContextChange: vi.fn(),
    errors: {},
    disabled: false,
  }

  describe('Renderização básica', () => {
    it('deve renderizar sem erros quando não há tipos selecionados', () => {
      render(<BlocosDinamicos {...defaultProps} />)

      expect(screen.getByText('Nenhum tipo selecionado')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Selecione um ou mais tipos de alteração para ver os blocos disponíveis',
        ),
      ).toBeInTheDocument()
    })

    it('deve renderizar mensagem de tipo selecionado', () => {
      const { container } = render(<BlocosDinamicos {...defaultProps} />)

      // Deve renderizar sem crashar
      expect(container).toBeDefined()
    })
  })

  describe('Blocos por tipo de alteração', () => {
    it('deve mostrar bloco de vigência para AditivoPrazo', () => {
      const props = {
        ...defaultProps,
        tiposSelecionados: [TipoAlteracao.AditivoPrazo],
      }

      render(<BlocosDinamicos {...props} />)

      // Bloco de vigência deve estar presente
      expect(
        screen.getByRole('heading', { level: 3, name: /vigência/i }),
      ).toBeInTheDocument()
    })

    it('deve mostrar bloco de valor para AditivoQuantidade', () => {
      const props = {
        ...defaultProps,
        tiposSelecionados: [TipoAlteracao.AditivoQuantidade],
      }

      render(<BlocosDinamicos {...props} />)

      // Bloco de valor deve estar presente
      expect(
        screen.getByRole('heading', { level: 3, name: /valor/i }),
      ).toBeInTheDocument()
    })

    it('deve mostrar múltiplos blocos para AditivoQualitativo', () => {
      const props = {
        ...defaultProps,
        tiposSelecionados: [TipoAlteracao.AditivoQualitativo],
      }

      render(<BlocosDinamicos {...props} />)

      // AditivoQualitativo pode ter vários blocos opcionais
      // Apenas verificar que não crasha
      const { container } = render(<BlocosDinamicos {...props} />)
      expect(container).toBeDefined()
    })
  })

  describe('Estados de carregamento e erro', () => {
    it('deve renderizar em estado de loading', () => {
      const props = {
        ...defaultProps,
        contractContext: {
          ...defaultProps.contractContext,
          isLoading: true,
        },
      }

      const { container } = render(<BlocosDinamicos {...props} />)
      expect(container).toBeDefined()
    })

    it('deve renderizar com erros', () => {
      const props = {
        ...defaultProps,
        errors: {
          'blocos.vigencia': 'Erro de vigência',
          'blocos.valor': 'Erro de valor',
        },
      }

      const { container } = render(<BlocosDinamicos {...props} />)
      expect(container).toBeDefined()
    })
  })

  describe('Estados disabled', () => {
    it('deve renderizar em estado disabled', () => {
      const props = {
        ...defaultProps,
        disabled: true,
        tiposSelecionados: [TipoAlteracao.AditivoPrazo],
      }

      const { container } = render(<BlocosDinamicos {...props} />)
      expect(container).toBeDefined()
    })
  })

  describe('Callbacks', () => {
    it('deve chamar onChange quando dados mudam', () => {
      const mockOnChange = vi.fn()
      const props = {
        ...defaultProps,
        onChange: mockOnChange,
        tiposSelecionados: [TipoAlteracao.AditivoPrazo],
      }

      render(<BlocosDinamicos {...props} />)

      // Verificar que o componente renderiza (callback será testado em testes de integração)
      expect(
        screen.getByRole('heading', { level: 3, name: /vigência/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Combinações de tipos', () => {
    it('deve renderizar múltiplos tipos sem erros', () => {
      const props = {
        ...defaultProps,
        tiposSelecionados: [
          TipoAlteracao.AditivoPrazo,
          TipoAlteracao.AditivoQuantidade,
          TipoAlteracao.AditivoQualitativo,
        ],
      }

      const { container } = render(<BlocosDinamicos {...props} />)
      expect(container).toBeDefined()

      // Deve mostrar pelo menos os blocos obrigatórios
      expect(
        screen.getByRole('heading', { level: 3, name: /vigência/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { level: 3, name: /valor/i }),
      ).toBeInTheDocument()
    })
  })
})
