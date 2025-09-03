import { renderHook, waitFor } from '@testing-library/react'
import { useUnidadeDetalhada } from '../use-unidade-detalhada'
import { buscarUnidadePorId } from '../../services/unidades-service'

// Mock do serviço
jest.mock('../../services/unidades-service')
const mockBuscarUnidadePorId = buscarUnidadePorId as jest.MockedFunction<typeof buscarUnidadePorId>

const mockUnidade = {
  nome: 'Assessoria de Comunicação Social',
  sigla: 'S/ACS',
  capId: 'd0231632-82c4-4f4d-94d9-d6e9aef8fd2c',
  cap: {
    nome: 'CAP Temporário',
    uo: '0',
    id: 'd0231632-82c4-4f4d-94d9-d6e9aef8fd2c',
    ativo: true
  },
  endereco: 'Rua Afonso Cavalcanti, 455',
  bairro: 'Cidade Nova',
  ua: 13210,
  subsecretaria: '0',
  ap: '0',
  uo: 0,
  ug: 0,
  cnes: '0',
  latitude: '0',
  longitude: '0',
  tipoUnidadeId: 1,
  tipoUnidade: null,
  tipoAdministracaoId: 1,
  tipoAdministracao: null,
  id: 'f5884390-f61a-4c88-b8ec-bd1e7e305ac5',
  ativo: true
}

describe('useUnidadeDetalhada', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve carregar dados da unidade com sucesso', async () => {
    mockBuscarUnidadePorId.mockResolvedValue(mockUnidade)

    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: 'test-id', enabled: true })
    )

    // Inicialmente deve estar carregando
    expect(result.current.carregando).toBe(true)
    expect(result.current.unidade).toBe(null)
    expect(result.current.erro).toBe(null)

    // Aguardar carregamento
    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.unidade).toEqual(mockUnidade)
    expect(result.current.erro).toBe(null)
    expect(mockBuscarUnidadePorId).toHaveBeenCalledWith('test-id')
  })

  it('deve lidar com erro ao carregar unidade', async () => {
    const erro = new Error('Erro na API')
    mockBuscarUnidadePorId.mockRejectedValue(erro)

    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: 'test-id', enabled: true })
    )

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.unidade).toBe(null)
    expect(result.current.erro).toBe('Erro ao carregar dados da unidade')
  })

  it('não deve carregar quando enabled é false', () => {
    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: 'test-id', enabled: false })
    )

    expect(result.current.carregando).toBe(false)
    expect(result.current.unidade).toBe(null)
    expect(result.current.erro).toBe(null)
    expect(mockBuscarUnidadePorId).not.toHaveBeenCalled()
  })

  it('não deve carregar quando id está vazio', () => {
    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: '', enabled: true })
    )

    expect(result.current.carregando).toBe(false)
    expect(result.current.unidade).toBe(null)
    expect(result.current.erro).toBe(null)
    expect(mockBuscarUnidadePorId).not.toHaveBeenCalled()
  })

  it('deve recarregar dados quando recarregar é chamado', async () => {
    mockBuscarUnidadePorId.mockResolvedValue(mockUnidade)

    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: 'test-id', enabled: true })
    )

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    // Chamar recarregar
    result.current.recarregar()

    // Deve estar carregando novamente
    expect(result.current.carregando).toBe(true)

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(mockBuscarUnidadePorId).toHaveBeenCalledTimes(2)
  })

  it('deve lidar com erro ao recarregar', async () => {
    mockBuscarUnidadePorId
      .mockResolvedValueOnce(mockUnidade)
      .mockRejectedValueOnce(new Error('Erro ao recarregar'))

    const { result } = renderHook(() => 
      useUnidadeDetalhada({ id: 'test-id', enabled: true })
    )

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    // Chamar recarregar
    result.current.recarregar()

    await waitFor(() => {
      expect(result.current.carregando).toBe(false)
    })

    expect(result.current.erro).toBe('Erro ao recarregar dados da unidade')
  })
})
