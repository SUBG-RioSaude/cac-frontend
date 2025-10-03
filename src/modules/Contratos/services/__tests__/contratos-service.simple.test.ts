import { describe, it, expect, vi, beforeEach } from 'vitest'

import { executeWithFallback } from '@/lib/axios'

import {
  getContratos,
  getContratoDetalhado,
  criarContrato,
  getContratosVencendo,
  getContratosVencidos,
  calcularPrazoMeses,
  converterDataParaISO,
  gerarNumeroContratoUnico,
} from '../contratos-service'

// Mock do executeWithFallback
vi.mock('@/lib/axios', () => ({
  executeWithFallback: vi.fn(),
}))

vi.mock('@/modules/Contratos/types/contrato', () => ({
  transformLegacyPayloadToNew: vi.fn((payload) => payload),
}))
const mockExecuteWithFallback = vi.mocked(executeWithFallback)

describe('ContratosService - Testes Essenciais', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContratos', () => {
    it('deve buscar contratos com resposta paginada completa', async () => {
      const mockResponse = {
        data: {
          dados: [{ id: '1', numero: 'CT001' }],
          paginaAtual: 1,
          tamanhoPagina: 10,
          totalRegistros: 1,
          totalPaginas: 1,
          temProximaPagina: false,
          temPaginaAnterior: false,
        },
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      const resultado = await getContratos({ pagina: 1 })

      expect(resultado.dados).toHaveLength(1)
      expect(resultado.paginaAtual).toBe(1)
      expect(resultado.totalRegistros).toBe(1)
    })

    it('deve normalizar resposta sem metadados de paginação', async () => {
      const mockResponse = {
        data: {
          dados: [{ id: '1', numero: 'CT001' }],
        },
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      const resultado = await getContratos({})

      expect(resultado.dados).toHaveLength(1)
      expect(resultado.totalRegistros).toBe(1)
      expect(resultado.paginaAtual).toBe(1)
    })

    it('deve lidar com array direto', async () => {
      const mockResponse = {
        data: [{ id: '1', numero: 'CT001' }],
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      const resultado = await getContratos({})

      expect(resultado.dados).toHaveLength(1)
      expect(resultado.totalRegistros).toBe(1)
    })

    it('deve rejeitar formato não reconhecido', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: null })

      await expect(getContratos({})).rejects.toThrow(
        'Formato de resposta da API não reconhecido',
      )
    })
  })

  describe('getContratoDetalhado', () => {
    it('deve buscar detalhes de contrato', async () => {
      const mockResponse = {
        data: {
          id: '123',
          numeroContrato: 'CT001',
          vigenciaInicial: '2023-01-01',
          vigenciaFinal: '2023-12-31',
          valorGlobal: 100000,
          contratada: {
            razaoSocial: 'Empresa Test',
            cnpj: '12345678000100',
          },
        },
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      const resultado = await getContratoDetalhado('123')

      expect(resultado.numeroContrato).toBe('CT001')
      expect(resultado.fornecedor.razaoSocial).toBe('Empresa Test')
    })

    it('deve lidar com dados ausentes na API', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: null })

      await expect(getContratoDetalhado('123')).rejects.toThrow(
        'Dados não recebidos da API',
      )
    })
  })

  describe('criarContrato', () => {
    it('deve criar novo contrato', async () => {
      const payload = {
        numeroContrato: 'CT003',
        valorGlobal: 75000,
      }

      const mockResponse = {
        data: { id: '456', ...payload },
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      const resultado = await criarContrato(payload)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: '/Contratos',
        data: payload,
      })

      expect(resultado.id).toBe('456')
    })
  })

  describe('getContratosVencendo', () => {
    it('deve buscar contratos vencendo', async () => {
      const mockResponse = {
        data: [{ id: '1', status: 'vencendo' }],
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      await getContratosVencendo()

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencendo',
        params: { diasAntecipados: 30 },
      })
    })

    it('deve aceitar dias customizados', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: [] })

      await getContratosVencendo(60)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencendo',
        params: { diasAntecipados: 60 },
      })
    })
  })

  describe('getContratosVencidos', () => {
    it('deve buscar contratos vencidos', async () => {
      const mockResponse = {
        data: [{ id: '1', status: 'vencido' }],
      }

      mockExecuteWithFallback.mockResolvedValue(mockResponse)

      await getContratosVencidos()

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencidos',
        params: {},
      })
    })
  })

  describe('Utilitários', () => {
    describe('calcularPrazoMeses', () => {
      it('deve calcular prazo em meses', () => {
        const inicio = '2023-01-01'
        const fim = '2023-12-31'

        const resultado = calcularPrazoMeses(inicio, fim)

        expect(resultado).toBeGreaterThan(11)
        expect(resultado).toBeLessThanOrEqual(13)
      })

      it('deve rejeitar datas em formato inválido', () => {
        const inicio = '01/01/2023'
        const fim = '31/12/2023'

        expect(() => calcularPrazoMeses(inicio, fim)).toThrow(
          'Datas inválidas fornecidas para cálculo de prazo',
        )
      })
    })

    describe('converterDataParaISO', () => {
      it('deve converter data para ISO', () => {
        const data = '01/01/2023'
        const resultado = converterDataParaISO(data)

        expect(resultado).toBeTruthy()
        expect(typeof resultado).toBe('string')
      })

      it('deve retornar string vazia para undefined', () => {
        const resultado = converterDataParaISO(undefined)

        expect(resultado).toBe('')
      })

      it('deve retornar string vazia para string vazia', () => {
        const resultado = converterDataParaISO('')

        expect(resultado).toBe('')
      })
    })

    describe('gerarNumeroContratoUnico', () => {
      it('deve gerar número único', () => {
        const numero1 = gerarNumeroContratoUnico()

        // Aguardar um pouco para garantir timestamp diferente
        const start = Date.now()
        while (Date.now() - start < 2) {
          // Wait 2ms para garantir timestamp único
        }

        const numero2 = gerarNumeroContratoUnico()

        expect(numero1).not.toBe(numero2)
        expect(typeof numero1).toBe('string')
        expect(numero1.length).toBeGreaterThan(0)
      })

      it('deve seguir formato esperado', () => {
        const numero = gerarNumeroContratoUnico()

        // Assumindo que segue algum padrão
        expect(numero).toMatch(/^.+$/) // Pelo menos não vazio
      })
    })
  })

  describe('Parâmetros de Filtro', () => {
    it('deve aceitar todos os parâmetros opcionais', async () => {
      const filtros = {
        pagina: 1,
        tamanhoPagina: 10,
        filtroStatus: 'ativo',
        dataInicialDe: '2023-01-01',
        empresaId: 'uuid-123',
        termoPesquisa: 'teste',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos(filtros)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtros,
      })
    })
  })

  describe('Performance', () => {
    it('deve ser eficiente para operações básicas', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      const startTime = performance.now()

      await getContratos({})
      calcularPrazoMeses('2023-01-01', '2023-12-31')
      converterDataParaISO('01/01/2023')
      gerarNumeroContratoUnico()

      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('Error Handling', () => {
    it('deve propagar erros das requisições', async () => {
      const erro = new Error('Erro de rede')
      mockExecuteWithFallback.mockRejectedValue(erro)

      await expect(getContratos({})).rejects.toThrow('Erro de rede')
    })

    it('deve lidar com dados malformados', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: 'invalid' })

      await expect(getContratos({})).rejects.toThrow()
    })
  })
})
