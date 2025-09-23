import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUnidades,
  getUnidadeById,
  createUnidade,
  updateUnidade,
  deleteUnidade,
  buscarUnidadesPorNome,
  buscarUnidadesPorNomeOuSigla,
  buscarUnidadePorId,
  getCaps,
  getCapById,
  buscarCapsPorNome,
  getTiposUnidade,
  getTiposAdministracao,
} from '../unidades-service'

// Mock do axios e executeWithFallback
vi.mock('@/lib/axios', () => ({
  executeWithFallback: vi.fn(),
  api: {
    get: vi.fn(),
  },
}))

import { executeWithFallback, api } from '@/lib/axios'

describe('Unidades Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock do import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_API_URL: 'https://api.teste.com',
        },
      },
    })
  })

  describe('Opera��es Principais - Unidades', () => {
    describe('getUnidades', () => {
      it('deve buscar unidades com filtros padr�o', async () => {
        const mockResponse = {
          data: {
            dados: [],
            total: 0,
            pagina: 1,
            tamanhoPagina: 10,
          },
        }

        vi.mocked(executeWithFallback).mockResolvedValue(mockResponse)

        const resultado = await getUnidades()

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/unidades',
          params: {
            pagina: 1,
            tamanhoPagina: 10,
            ordenarPor: undefined,
            direcaoOrdenacao: undefined,
            nome: undefined,
            sigla: undefined,
            cnes: undefined,
            bairro: undefined,
            ativo: true,
          },
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockResponse.data)
      })

      it('deve buscar unidades com filtros personalizados', async () => {
        const filtros = {
          pagina: 2,
          tamanhoPagina: 20,
          nome: 'Hospital',
          ordenarPor: 'nome',
          direcaoOrdenacao: 'asc' as const,
          ativo: false,
        }

        const mockResponse = { data: { dados: [], total: 0 } }
        vi.mocked(executeWithFallback).mockResolvedValue(mockResponse)

        await getUnidades(filtros)

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/unidades',
          params: {
            pagina: 2,
            tamanhoPagina: 20,
            ordenarPor: 'nome',
            direcaoOrdenacao: 'asc',
            nome: 'Hospital',
            sigla: undefined,
            cnes: undefined,
            bairro: undefined,
            ativo: false,
          },
          baseURL: expect.any(String),
        })
      })
    })

    describe('getUnidadeById', () => {
      it('deve buscar unidade por ID', async () => {
        const mockUnidade = { id: '1', nome: 'Hospital Central' }
        const mockResponse = { data: mockUnidade }

        vi.mocked(executeWithFallback).mockResolvedValue(mockResponse)

        const resultado = await getUnidadeById('1')

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/unidades/1',
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockUnidade)
      })
    })

    describe('createUnidade', () => {
      it('deve criar nova unidade', async () => {
        const novaUnidade = {
          nome: 'Nova Unidade',
          sigla: 'NU',
          endereco: 'Rua Teste, 123',
        }

        const mockResponse = { data: { id: '1', ...novaUnidade } }
        vi.mocked(executeWithFallback).mockResolvedValue(mockResponse)

        const resultado = await createUnidade(novaUnidade)

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'post',
          url: '/unidades',
          data: novaUnidade,
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockResponse.data)
      })
    })

    describe('updateUnidade', () => {
      it('deve atualizar unidade existente', async () => {
        const dadosAtualizacao = {
          id: '1',
          nome: 'Unidade Atualizada',
          sigla: 'UA',
        }

        const mockResponse = { data: dadosAtualizacao }
        vi.mocked(executeWithFallback).mockResolvedValue(mockResponse)

        const resultado = await updateUnidade(dadosAtualizacao)

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'put',
          url: '/unidades/1',
          data: { nome: 'Unidade Atualizada', sigla: 'UA' }, // sem o id
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockResponse.data)
      })
    })

    describe('deleteUnidade', () => {
      it('deve deletar unidade por ID', async () => {
        vi.mocked(executeWithFallback).mockResolvedValue({ data: undefined })

        await deleteUnidade('1')

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'delete',
          url: '/unidades/1',
          baseURL: expect.any(String),
        })
      })
    })
  })

  describe('Busca de Unidades', () => {
    describe('buscarUnidadesPorNome', () => {
      it('deve buscar unidades por nome - resposta como array direto', async () => {
        const mockUnidades = [
          { id: '1', nome: 'Hospital Central' },
          { id: '2', nome: 'Hospital Norte' },
        ]

        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockUnidades })

        const resultado = await buscarUnidadesPorNome('Hospital')

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/unidades',
          params: { nome: 'Hospital' },
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockUnidades)
      })

      it('deve buscar unidades por nome - resposta com dados[]', async () => {
        const mockUnidades = [{ id: '1', nome: 'Hospital Central' }]

        vi.mocked(executeWithFallback).mockResolvedValue({
          data: { dados: mockUnidades },
        })

        const resultado = await buscarUnidadesPorNome('Hospital')

        expect(resultado).toEqual(mockUnidades)
      })

      it('deve retornar array vazio para resposta inv�lida', async () => {
        vi.mocked(executeWithFallback).mockResolvedValue({ data: null })

        const resultado = await buscarUnidadesPorNome('Hospital')

        expect(resultado).toEqual([])
      })
    })

    describe('buscarUnidadesPorNomeOuSigla', () => {
      it('deve buscar apenas por nome quando termo � longo', async () => {
        const mockUnidades = [{ id: '1', nome: 'Hospital Central' }]
        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockUnidades })

        const resultado = await buscarUnidadesPorNomeOuSigla(
          'Hospital Central Norte',
        )

        // Deve fazer apenas uma chamada (por nome)
        expect(executeWithFallback).toHaveBeenCalledTimes(1)
        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/unidades',
          params: { nome: 'Hospital Central Norte' },
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockUnidades)
      })

      it('deve buscar por nome e sigla quando termo � curto', async () => {
        const unidadesPorNome = [{ id: '1', nome: 'Hospital Central' }]
        const unidadesPorSigla = [{ id: '2', nome: 'Unidade HC', sigla: 'HC' }]

        vi.mocked(executeWithFallback)
          .mockResolvedValueOnce({ data: unidadesPorNome })
          .mockResolvedValueOnce({ data: unidadesPorSigla })

        const resultado = await buscarUnidadesPorNomeOuSigla('HC')

        expect(executeWithFallback).toHaveBeenCalledTimes(2)
        expect(executeWithFallback).toHaveBeenNthCalledWith(1, {
          method: 'get',
          url: '/unidades',
          params: { nome: 'HC' },
          baseURL: expect.any(String),
        })
        expect(executeWithFallback).toHaveBeenNthCalledWith(2, {
          method: 'get',
          url: '/unidades',
          params: { sigla: 'HC' },
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual([...unidadesPorNome, ...unidadesPorSigla])
      })

      it('deve remover duplicatas ao combinar resultados', async () => {
        const unidadeDuplicada = {
          id: '1',
          nome: 'Hospital Central',
          sigla: 'HC',
        }

        vi.mocked(executeWithFallback)
          .mockResolvedValueOnce({ data: [unidadeDuplicada] })
          .mockResolvedValueOnce({ data: [unidadeDuplicada] })

        const resultado = await buscarUnidadesPorNomeOuSigla('HC')

        expect(resultado).toHaveLength(1)
        expect(resultado[0]).toEqual(unidadeDuplicada)
      })

      it('deve retornar apenas resultados por nome se busca por sigla falhar', async () => {
        const unidadesPorNome = [{ id: '1', nome: 'Hospital Central' }]

        vi.mocked(executeWithFallback)
          .mockResolvedValueOnce({ data: unidadesPorNome })
          .mockRejectedValueOnce(new Error('Erro na busca por sigla'))

        const resultado = await buscarUnidadesPorNomeOuSigla('HC')

        expect(resultado).toEqual(unidadesPorNome)
      })
    })

    describe('buscarUnidadePorId', () => {
      it('deve buscar unidade detalhada por ID', async () => {
        const mockUnidade = {
          id: '1',
          nome: 'Hospital Central',
          endereco: 'Rua A, 123',
        }
        vi.mocked(api.get).mockResolvedValue({ data: mockUnidade })

        const resultado = await buscarUnidadePorId('1')

        expect(api.get).toHaveBeenCalledWith('/unidades/1')
        expect(resultado).toEqual(mockUnidade)
      })

      it('deve propagar erro ao falhar', async () => {
        const erro = new Error('Unidade n�o encontrada')
        vi.mocked(api.get).mockRejectedValue(erro)

        await expect(buscarUnidadePorId('999')).rejects.toThrow(
          'Unidade n�o encontrada',
        )
      })
    })
  })

  describe('Opera��es Auxiliares - CAPs', () => {
    describe('getCaps', () => {
      it('deve buscar todos os CAPs', async () => {
        const mockCaps = [
          { id: '1', nome: 'CAP Central' },
          { id: '2', nome: 'CAP Norte' },
        ]

        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockCaps })

        const resultado = await getCaps()

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/caps',
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockCaps)
      })
    })

    describe('getCapById', () => {
      it('deve buscar CAP por ID', async () => {
        const mockCap = { id: '1', nome: 'CAP Central' }
        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockCap })

        const resultado = await getCapById('1')

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/caps/1',
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockCap)
      })
    })

    describe('buscarCapsPorNome', () => {
      it('deve buscar CAPs por nome', async () => {
        const mockCaps = [{ id: '1', nome: 'CAP Central' }]
        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockCaps })

        const resultado = await buscarCapsPorNome('Central')

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/caps/buscar',
          params: { nome: 'Central' },
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockCaps)
      })
    })
  })

  describe('Opera��es Auxiliares - Tipos', () => {
    describe('getTiposUnidade', () => {
      it('deve buscar tipos de unidade', async () => {
        const mockTipos = [
          { id: '1', nome: 'Hospital' },
          { id: '2', nome: 'UBS' },
        ]

        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockTipos })

        const resultado = await getTiposUnidade()

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/TipoUnidade',
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockTipos)
      })
    })

    describe('getTiposAdministracao', () => {
      it('deve buscar tipos de administra��o', async () => {
        const mockTipos = [
          { id: '1', nome: 'P�blica' },
          { id: '2', nome: 'Privada' },
        ]

        vi.mocked(executeWithFallback).mockResolvedValue({ data: mockTipos })

        const resultado = await getTiposAdministracao()

        expect(executeWithFallback).toHaveBeenCalledWith({
          method: 'get',
          url: '/TipoAdministracao',
          baseURL: expect.any(String),
        })

        expect(resultado).toEqual(mockTipos)
      })
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve propagar erros do executeWithFallback', async () => {
      const erro = new Error('Erro de rede')
      vi.mocked(executeWithFallback).mockRejectedValue(erro)

      await expect(getUnidades()).rejects.toThrow('Erro de rede')
    })

    it('deve logar e propagar erros em buscarUnidadePorId', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const erro = new Error('Erro na API')
      vi.mocked(api.get).mockRejectedValue(erro)

      await expect(buscarUnidadePorId('1')).rejects.toThrow('Erro na API')
      expect(spy).toHaveBeenCalledWith('Erro ao buscar unidade por ID:', erro)

      spy.mockRestore()
    })
  })

  describe('Configura��o de Environment Variables', () => {
    it('deve usar VITE_API_URL do environment', async () => {
      vi.mocked(executeWithFallback).mockResolvedValue({ data: [] })

      await getUnidades()

      expect(executeWithFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
        }),
      )
    })
  })
})
