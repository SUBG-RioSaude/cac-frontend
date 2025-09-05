import { describe, it, expect } from 'vitest'
import { TIPOS_ALTERACAO_CONFIG, TipoAlteracao } from '../../../types/alteracoes-contratuais'

describe('Display Functions - Alterações Contratuais', () => {
  
  describe('getTipoNome', () => {
    // Função extraída para teste (replica a lógica do componente)
    const getTipoNome = (tipo: number): string => {
      const config = TIPOS_ALTERACAO_CONFIG[tipo as keyof typeof TIPOS_ALTERACAO_CONFIG]
      return config?.label || `Tipo ${tipo}`
    }

    it('deve retornar nome correto para AditivoPrazo', () => {
      const resultado = getTipoNome(TipoAlteracao.AditivoPrazo)
      expect(resultado).toBe('Aditivo - Prazo')
    })

    it('deve retornar nome correto para AditivoQualitativo', () => {
      const resultado = getTipoNome(TipoAlteracao.AditivoQualitativo)
      expect(resultado).toBe('Aditivo - Qualitativo')
    })

    it('deve retornar nome correto para AditivoQuantidade', () => {
      const resultado = getTipoNome(TipoAlteracao.AditivoQuantidade)
      expect(resultado).toBe('Aditivo - Quantidade')
    })

    it('deve retornar fallback para tipo desconhecido', () => {
      const resultado = getTipoNome(999)
      expect(resultado).toBe('Tipo 999')
    })

    it('deve lidar com tipo null/undefined', () => {
      const resultado = getTipoNome(null as unknown as number)
      expect(resultado).toBe('Tipo null')
    })
  })

  describe('getUnitName', () => {
    // Mock de dados típicos
    const mockLinkedUnits = [
      {
        id: 'unit-1',
        nome: 'Hospital Municipal',
        codigo: 'HM001',
        tipo: 'Hospital',
        endereco: 'Rua A, 123',
        ativo: true,
        valorAtual: 1000
      },
      {
        id: 'unit-2', 
        nome: 'UBS Centro',
        codigo: 'UBS001',
        tipo: 'UBS',
        endereco: 'Rua B, 456',
        ativo: true,
        valorAtual: 500
      }
    ]

    const mockContractUnits = {
      demandingUnit: 'Secretaria de Saúde',
      managingUnit: 'Coordenadoria Geral',
      linkedUnits: mockLinkedUnits
    }

    // Função extraída para teste (replica a lógica do componente)
    const getUnitName = (unitId: string) => {
      // Check in linked units (array of objects with id property)
      const unit = mockContractUnits.linkedUnits?.find((u) => u.id === unitId)
      if (unit) {
        return unit.nome || unitId
      }
      // Check if it's the demanding unit (stored as string)
      if (mockContractUnits.demandingUnit === unitId) {
        return mockContractUnits.demandingUnit
      }
      // Check if it's the managing unit (stored as string)
      if (mockContractUnits.managingUnit === unitId) {
        return mockContractUnits.managingUnit
      }
      return unitId
    }

    it('deve encontrar unidade pelo ID corretamente', () => {
      const resultado = getUnitName('unit-1')
      expect(resultado).toBe('Hospital Municipal')
    })

    it('deve encontrar segunda unidade pelo ID', () => {
      const resultado = getUnitName('unit-2')
      expect(resultado).toBe('UBS Centro')
    })

    it('deve retornar demanding unit quando ID corresponde', () => {
      const resultado = getUnitName('Secretaria de Saúde')
      expect(resultado).toBe('Secretaria de Saúde')
    })

    it('deve retornar managing unit quando ID corresponde', () => {
      const resultado = getUnitName('Coordenadoria Geral')
      expect(resultado).toBe('Coordenadoria Geral')
    })

    it('deve retornar ID como fallback quando não encontra', () => {
      const resultado = getUnitName('unit-inexistente')
      expect(resultado).toBe('unit-inexistente')
    })

    it('deve lidar com ID vazio', () => {
      const resultado = getUnitName('')
      expect(resultado).toBe('')
    })

    it('deve lidar com ID null/undefined', () => {
      const resultado = getUnitName(null as unknown as string)
      expect(resultado).toBe(null)
    })

    it('deve retornar nome mesmo se unidade não tem nome definido', () => {
      const unitsWithEmptyName = [
        {
          id: 'unit-no-name',
          nome: '',
          codigo: 'UN001',
          tipo: 'Unidade',
          endereco: '',
          ativo: true,
          valorAtual: 0
        }
      ]

      const getUnitNameEmpty = (unitId: string) => {
        const unit = unitsWithEmptyName.find((u) => u.id === unitId)
        if (unit) {
          return unit.nome || unitId
        }
        return unitId
      }

      const resultado = getUnitNameEmpty('unit-no-name')
      expect(resultado).toBe('unit-no-name') // Fallback para ID quando nome está vazio
    })
  })

  describe('Integração - Casos reais', () => {
    it('deve funcionar com dados típicos de revisão', () => {
      const getTipoNome = (tipo: number): string => {
        const config = TIPOS_ALTERACAO_CONFIG[tipo as keyof typeof TIPOS_ALTERACAO_CONFIG]
        return config?.label || `Tipo ${tipo}`
      }

      // Simular dados que vem da API
      const tiposSelecionados = [
        TipoAlteracao.AditivoPrazo,
        TipoAlteracao.AditivoQualitativo,
        TipoAlteracao.AditivoQuantidade
      ]

      const nomes = tiposSelecionados.map(getTipoNome)

      expect(nomes).toEqual([
        'Aditivo - Prazo',
        'Aditivo - Qualitativo', 
        'Aditivo - Quantidade'
      ])
    })
  })
})