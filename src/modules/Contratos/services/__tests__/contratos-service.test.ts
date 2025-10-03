import { describe, it, expect, vi, beforeEach } from 'vitest'

import { executeWithFallback } from '@/lib/axios'

import {
  getContratos,
  getContratoDetalhado,
  criarContrato,
  getContratosVencendo,
  getContratosVencidos,
} from '../contratos-service'

// Mock do executeWithFallback
vi.mock('@/lib/axios', () => ({
  executeWithFallback: vi.fn(),
}))

// Mock dos tipos de transformação
vi.mock('@/modules/Contratos/types/contrato', () => ({
  transformLegacyPayloadToNew: vi.fn((payload) => payload),
}))
const mockExecuteWithFallback = vi.mocked(executeWithFallback)

describe('ContratosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getContratos', () => {
    it('deve buscar contratos com filtros', async () => {
      const mockResponse = {
        dados: [
          { id: '1', numero: 'CT001', status: 'ativo' },
          { id: '2', numero: 'CT002', status: 'vencendo' },
        ],
        paginaAtual: 1,
        tamanhoPagina: 10,
        totalRegistros: 2,
        totalPaginas: 1,
        temProximaPagina: false,
        temPaginaAnterior: false,
      }

      mockExecuteWithFallback.mockResolvedValue({ data: mockResponse })

      const filtros = {
        pagina: 1,
        tamanhoPagina: 10,
        filtroStatus: 'ativo,vencendo',
      }

      const resultado = await getContratos(filtros)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtros,
      })

      expect(resultado).toEqual(mockResponse)
      expect(resultado.dados).toHaveLength(2)
    })

    it('deve normalizar resposta sem metadados de paginação', async () => {
      const mockResponseSemPaginacao = {
        dados: [{ id: '1', numero: 'CT001', status: 'ativo' }],
      }

      mockExecuteWithFallback.mockResolvedValue({
        data: mockResponseSemPaginacao,
      })

      const resultado = await getContratos({})

      expect(resultado).toHaveProperty('dados')
      expect(resultado.dados).toHaveLength(1)
    })

    it('deve lidar com filtros de data', async () => {
      const filtros = {
        dataInicialDe: '2023-01-01',
        dataInicialAte: '2023-12-31',
        dataFinalDe: '2024-01-01',
        dataFinalAte: '2024-12-31',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos(filtros)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtros,
      })
    })

    it('deve lidar com filtros de valor', async () => {
      const filtros = {
        valorMinimo: 1000,
        valorMaximo: 50000,
        empresaId: 'empresa-123',
        unidadeSaudeId: 'unidade-456',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos(filtros)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtros,
      })
    })

    it('deve lidar com termo de pesquisa', async () => {
      const filtros = {
        termoPesquisa: 'termo de busca',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos(filtros)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtros,
      })
    })

    it('deve lidar com erro na requisição', async () => {
      const erro = new Error('Erro de rede')
      mockExecuteWithFallback.mockRejectedValue(erro)

      await expect(getContratos({})).rejects.toThrow('Erro de rede')
    })
  })

  describe('getContratoDetalhado', () => {
    it('deve buscar detalhes de um contrato específico', async () => {
      const mockContrato = {
        id: '123',
        numero: 'CT001',
        status: 'ativo',
        valor: 100000,
        vigenciaInicial: '2023-01-01',
        vigenciaFinal: '2023-12-31',
        empresa: { id: 'emp1', razaoSocial: 'Empresa Test' },
        unidadeSaude: { id: 'uni1', nome: 'Unidade Test' },
      }

      mockExecuteWithFallback.mockResolvedValue({ data: mockContrato })

      const resultado = await getContratoDetalhado('123')

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/123',
      })

      // Verifica se o resultado contém as propriedades mapeadas
      expect(resultado.id).toBe('123')
      expect(resultado.numeroContrato).toBe('123') // Mapeado do id
      expect(resultado.objeto).toBe('Sem descrição') // Default quando não há descricaoObjeto
      expect(resultado.dataInicio).toBe('2023-01-01')
      expect(resultado.dataTermino).toBe('2023-12-31')
      expect(resultado.fornecedor.razaoSocial).toBe('Não informado') // Default
      expect(resultado.unidades.demandante).toBeNull()
      expect(resultado.unidades.gestora).toBeNull()
    })

    it('deve lidar com contrato não encontrado', async () => {
      const erro = new Error('Contrato não encontrado')
      mockExecuteWithFallback.mockRejectedValue(erro)

      await expect(getContratoDetalhado('999')).rejects.toThrow(
        'Contrato não encontrado',
      )
    })
  })

  describe('criarContrato', () => {
    it('deve criar novo contrato', async () => {
      const novoContrato = {
        numero: 'CT003',
        valor: 75000,
        vigenciaInicial: '2024-01-01',
        vigenciaFinal: '2024-12-31',
        empresaId: 'emp1',
        unidadeSaudeId: 'uni1',
      }

      const contratoCreated = {
        id: '456',
        ...novoContrato,
        status: 'ativo',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: contratoCreated })

      const resultado = await criarContrato(novoContrato)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'post',
        url: '/Contratos',
        data: novoContrato,
      })

      expect(resultado).toEqual(contratoCreated)
    })

    it('deve lidar com erro de validação', async () => {
      const contratoInvalido = {
        numero: '',
        valor: -1000,
      }

      const erro = new Error('Dados inválidos')
      mockExecuteWithFallback.mockRejectedValue(erro)

      await expect(criarContrato(contratoInvalido)).rejects.toThrow(
        'Erro ao criar contrato',
      )
    })
  })

  describe('getContratosVencendo', () => {
    it('deve buscar contratos vencendo', async () => {
      const mockContratos = [
        {
          id: '1',
          numero: 'CT001',
          status: 'vencendo',
          vigenciaFinal: '2024-01-15',
        },
        {
          id: '2',
          numero: 'CT002',
          status: 'vencendo',
          vigenciaFinal: '2024-01-20',
        },
      ]

      mockExecuteWithFallback.mockResolvedValue({
        data: { dados: mockContratos },
      })

      const resultado = await getContratosVencendo()

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencendo',
        params: { diasAntecipados: 30 },
      })

      expect(resultado.dados).toEqual(mockContratos)
      expect(resultado.dados).toHaveLength(2)
    })

    it('deve buscar contratos vencendo com dias específicos', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratosVencendo(30)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencendo',
        params: { diasAntecipados: 30 },
      })
    })
  })

  describe('getContratosVencidos', () => {
    it('deve buscar contratos vencidos', async () => {
      const mockContratos = [
        {
          id: '1',
          numero: 'CT001',
          status: 'vencido',
          vigenciaFinal: '2023-12-31',
        },
        {
          id: '2',
          numero: 'CT002',
          status: 'vencido',
          vigenciaFinal: '2023-11-30',
        },
      ]

      mockExecuteWithFallback.mockResolvedValue({
        data: { dados: mockContratos },
      })

      const resultado = await getContratosVencidos()

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos/vencidos',
        params: {},
      })

      expect(resultado.dados).toEqual(mockContratos)
      expect(resultado.dados).toHaveLength(2)
    })
  })

  describe('Tipos de Parâmetros', () => {
    it('deve aceitar todos os parâmetros opcionais', async () => {
      const filtrosCompletos = {
        pagina: 2,
        tamanhoPagina: 20,
        filtroStatus: 'ativo,vencendo,vencido',
        dataInicialDe: '2023-01-01',
        dataInicialAte: '2023-06-30',
        dataFinalDe: '2023-07-01',
        dataFinalAte: '2023-12-31',
        valorMinimo: 5000,
        valorMaximo: 100000,
        empresaId: 'empresa-uuid-123',
        unidadeSaudeId: 'unidade-uuid-456',
        termoPesquisa: 'contrato de fornecimento',
      }

      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos(filtrosCompletos)

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: filtrosCompletos,
      })
    })

    it('deve funcionar com objeto vazio', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos({})

      expect(mockExecuteWithFallback).toHaveBeenCalledWith({
        method: 'get',
        url: '/contratos',
        params: {},
      })
    })
  })

  describe('Performance e Caching', () => {
    it('múltiplas chamadas devem ser independentes', async () => {
      mockExecuteWithFallback
        .mockResolvedValueOnce({ data: { dados: [{ id: '1' }] } })
        .mockResolvedValueOnce({ data: { dados: [{ id: '2' }] } })

      const resultado1 = await getContratos({ pagina: 1 })
      const resultado2 = await getContratos({ pagina: 2 })

      expect(resultado1.dados[0].id).toBe('1')
      expect(resultado2.dados[0].id).toBe('2')
      expect(mockExecuteWithFallback).toHaveBeenCalledTimes(2)
    })

    it('deve ser eficiente para grandes volumes', async () => {
      const mockLargeResponse = {
        dados: Array.from({ length: 1000 }, (_, i) => ({
          id: `${i}`,
          numero: `CT${i}`,
        })),
        totalRegistros: 1000,
      }

      mockExecuteWithFallback.mockResolvedValue({ data: mockLargeResponse })

      const startTime = performance.now()
      const resultado = await getContratos({ tamanhoPagina: 1000 })
      const endTime = performance.now()

      expect(resultado.dados).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Menos de 100ms para processar
    })
  })

  describe('Integração com Fallback', () => {
    it('deve usar executeWithFallback para todas as requisições', async () => {
      mockExecuteWithFallback.mockResolvedValue({ data: { dados: [] } })

      await getContratos({})
      await getContratoDetalhado('123')
      await criarContrato({})
      await getContratosVencendo()
      await getContratosVencidos()

      expect(mockExecuteWithFallback).toHaveBeenCalledTimes(5)
    })

    it('deve propagar erros do fallback corretamente', async () => {
      const erroFallback = new Error('Fallback failed')
      mockExecuteWithFallback.mockRejectedValue(erroFallback)

      await expect(getContratos({})).rejects.toThrow('Fallback failed')
    })
  })
})
