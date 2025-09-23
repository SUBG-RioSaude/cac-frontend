import { describe, it, expect } from 'vitest'
import {
  validarMatricula,
  validarFormatoCpf,
  validarCpfCompleto,
  isFuncionarioAtivo,
  podeSerFiscal,
  formatarMatricula,
  formatarNome,
  formatarCargo,
  situacaoParaStatus,
  mapearFuncionarioParaUsuario,
  mapearFuncionarioParaUsuarioAtribuido,
  mapearFuncionariosParaUsuarios,
  filtrarFuncionariosAtivos,
  filtrarFuncionariosParaFiscalizacao,
  buscarPorMatricula,
  buscarPorNome,
  filtrarPorLotacao,
  agruparPorLotacao,
  agruparPorSituacao,
  ordenarPorNome,
  ordenarPorMatricula,
  contarPorSituacao,
  calcularEstatisticas,
} from '../funcionario-utils'
import { SituacaoFuncional } from '../../types/funcionario-api'
import type { FuncionarioApi } from '../../types/funcionario-api'

describe('Funcionario Utils', () => {
  // Helper para criar funcion�rios mock
  const criarFuncionarioMock = (
    overrides: Partial<FuncionarioApi> = {},
  ): FuncionarioApi => ({
    id: 1,
    matricula: '123456',
    nome: 'Jo�o Silva',
    nomeCompleto: 'Jo�o Silva Santos',
    emailInstitucional: 'joao.silva@empresa.com',
    cargo: 'Analista',
    lotacao: 'TI',
    lotacaoNome: 'Tecnologia da Informa��o',
    telefone: '(11) 99999-9999',
    ativo: true,
    situacaoFuncional: SituacaoFuncional.ATIVO,
    ...overrides,
  })

  describe('Valida��es', () => {
    describe('validarMatricula', () => {
      it('deve aceitar matr�culas v�lidas', () => {
        expect(validarMatricula('1234')).toBe(true)
        expect(validarMatricula('ABC123')).toBe(true)
        expect(validarMatricula('12345678')).toBe(true)
        expect(validarMatricula('1234567890')).toBe(true)
      })

      it('deve rejeitar matr�culas inv�lidas', () => {
        expect(validarMatricula('')).toBe(false)
        expect(validarMatricula('   ')).toBe(false)
        expect(validarMatricula('123')).toBe(false) // Muito curta
        expect(validarMatricula('12345678901')).toBe(false) // Muito longa
        expect(validarMatricula('ABC@123')).toBe(false) // Caracteres especiais
      })

      it('deve tratar espa�os corretamente', () => {
        expect(validarMatricula(' 1234 ')).toBe(true) // Remove espa�os
        expect(validarMatricula('12 34')).toBe(false) // Espa�os internos
      })
    })

    describe('validarFormatoCpf', () => {
      it('deve aceitar CPF com formata��o', () => {
        expect(validarFormatoCpf('123.456.789-01')).toBe(true)
        expect(validarFormatoCpf('12345678901')).toBe(true)
      })

      it('deve rejeitar CPF inv�lido', () => {
        expect(validarFormatoCpf('')).toBe(false)
        expect(validarFormatoCpf('123456789')).toBe(false) // Muito curto
        expect(validarFormatoCpf('123456789012')).toBe(false) // Muito longo
      })
    })

    describe('validarCpfCompleto', () => {
      it('deve validar CPF com d�gitos verificadores corretos', () => {
        expect(validarCpfCompleto('11144477735')).toBe(true)
        expect(validarCpfCompleto('111.444.777-35')).toBe(true)
      })

      it('deve rejeitar CPF com d�gitos verificadores incorretos', () => {
        expect(validarCpfCompleto('11144477734')).toBe(false)
        expect(validarCpfCompleto('123.456.789-00')).toBe(false)
      })

      it('deve rejeitar CPF com todos os d�gitos iguais', () => {
        expect(validarCpfCompleto('11111111111')).toBe(false)
        expect(validarCpfCompleto('22222222222')).toBe(false)
      })

      it('deve rejeitar CPF vazio ou inv�lido', () => {
        expect(validarCpfCompleto('')).toBe(false)
        expect(validarCpfCompleto('123456789')).toBe(false)
      })
    })

    describe('isFuncionarioAtivo', () => {
      it('deve identificar funcion�rio ativo', () => {
        const funcionario = criarFuncionarioMock({
          ativo: true,
          situacaoFuncional: SituacaoFuncional.ATIVO,
        })
        expect(isFuncionarioAtivo(funcionario)).toBe(true)
      })

      it('deve identificar funcion�rio inativo por flag', () => {
        const funcionario = criarFuncionarioMock({
          ativo: false,
          situacaoFuncional: SituacaoFuncional.ATIVO,
        })
        expect(isFuncionarioAtivo(funcionario)).toBe(false)
      })

      it('deve identificar funcion�rio inativo por situa��o', () => {
        const funcionario = criarFuncionarioMock({
          ativo: true,
          situacaoFuncional: SituacaoFuncional.INATIVO,
        })
        expect(isFuncionarioAtivo(funcionario)).toBe(false)
      })
    })

    describe('podeSerFiscal', () => {
      it('deve permitir funcion�rio ativo como fiscal', () => {
        const funcionario = criarFuncionarioMock({ ativo: true })
        expect(podeSerFiscal(funcionario)).toBe(true)
      })

      it('deve rejeitar funcion�rio inativo como fiscal', () => {
        const funcionario = criarFuncionarioMock({ ativo: false })
        expect(podeSerFiscal(funcionario)).toBe(false)
      })
    })
  })

  describe('Formata��o', () => {
    describe('formatarMatricula', () => {
      it('deve formatar matr�cula num�rica com zeros � esquerda', () => {
        expect(formatarMatricula('123')).toBe('000123')
        expect(formatarMatricula('12345')).toBe('012345')
        expect(formatarMatricula('1234567')).toBe('1234567') // J� tem mais de 6 d�gitos
      })

      it('deve formatar matr�cula alfanum�rica em mai�sculo', () => {
        expect(formatarMatricula('abc123')).toBe('ABC123')
        expect(formatarMatricula('xyz789')).toBe('XYZ789')
      })

      it('deve lidar com entrada vazia', () => {
        expect(formatarMatricula('')).toBe('')
        expect(formatarMatricula(undefined as any)).toBe('')
      })
    })

    describe('formatarNome', () => {
      it('deve capitalizar primeira letra de cada palavra', () => {
        expect(formatarNome('jo�o silva')).toBe('Jo�o Silva')
        expect(formatarNome('MARIA DOS SANTOS')).toBe('Maria Dos Santos')
        expect(formatarNome('ana CLARA')).toBe('Ana Clara')
      })

      it('deve lidar com entrada vazia', () => {
        expect(formatarNome('')).toBe('')
        expect(formatarNome(undefined as any)).toBe('')
      })
    })

    describe('formatarCargo', () => {
      it('deve capitalizar cargo corretamente', () => {
        expect(formatarCargo('analista de sistemas')).toBe(
          'Analista De Sistemas',
        )
        expect(formatarCargo('GERENTE DE PROJETOS')).toBe('Gerente De Projetos')
      })

      it('deve lidar com entrada vazia', () => {
        expect(formatarCargo('')).toBe('')
        expect(formatarCargo(undefined as any)).toBe('')
      })
    })
  })

  describe('Convers�es e Mapeamento', () => {
    describe('situacaoParaStatus', () => {
      it('deve retornar ativo para funcion�rio ativo em situa��o normal', () => {
        expect(situacaoParaStatus(SituacaoFuncional.ATIVO, true)).toBe('ativo')
        expect(
          situacaoParaStatus(SituacaoFuncional.ATIVO_TEMPORARIO, true),
        ).toBe('ativo')
      })

      it('deve retornar inativo para funcion�rio com flag inativo', () => {
        expect(situacaoParaStatus(SituacaoFuncional.ATIVO, false)).toBe(
          'inativo',
        )
      })

      it('deve retornar inativo para situa��es espec�ficas', () => {
        expect(situacaoParaStatus(SituacaoFuncional.INATIVO, true)).toBe(
          'inativo',
        )
        expect(situacaoParaStatus(SituacaoFuncional.AFASTADO, true)).toBe(
          'inativo',
        )
        expect(situacaoParaStatus(SituacaoFuncional.LICENCA, true)).toBe(
          'inativo',
        )
      })
    })

    describe('mapearFuncionarioParaUsuario', () => {
      it('deve mapear funcion�rio para usu�rio corretamente', () => {
        const funcionario = criarFuncionarioMock({
          id: 1,
          matricula: '123',
          nomeCompleto: 'jo�o silva',
          emailInstitucional: 'joao@empresa.com',
          cargo: 'analista',
          lotacaoNome: 'Tecnologia',
          telefone: '11999999999',
          ativo: true,
          situacaoFuncional: SituacaoFuncional.ATIVO,
        })

        const usuario = mapearFuncionarioParaUsuario(funcionario)

        expect(usuario).toEqual({
          id: 1,
          matricula: '000123',
          nome: 'Jo�o Silva',
          email: 'joao@empresa.com',
          cargo: 'Analista',
          departamento: 'Tecnologia',
          telefone: '11999999999',
          status: 'ativo',
        })
      })
    })

    describe('mapearFuncionarioParaUsuarioAtribuido', () => {
      it('deve mapear funcion�rio para usu�rio atribu�do', () => {
        const funcionario = criarFuncionarioMock()
        const usuarioAtribuido = mapearFuncionarioParaUsuarioAtribuido(
          funcionario,
          'fiscal',
        )

        expect(usuarioAtribuido.tipo).toBe('fiscal')
        expect(usuarioAtribuido.id).toBe(funcionario.id)
      })
    })

    describe('mapearFuncionariosParaUsuarios', () => {
      it('deve mapear lista de funcion�rios', () => {
        const funcionarios = [
          criarFuncionarioMock({ id: 1, nomeCompleto: 'Jo�o Silva' }),
          criarFuncionarioMock({ id: 2, nomeCompleto: 'Maria Santos' }),
        ]

        const usuarios = mapearFuncionariosParaUsuarios(funcionarios)

        expect(usuarios).toHaveLength(2)
        expect(usuarios[0].nome).toBe('Jo�o Silva')
        expect(usuarios[1].nome).toBe('Maria Santos')
      })
    })
  })

  describe('Filtros e Buscas', () => {
    const funcionarios = [
      criarFuncionarioMock({
        id: 1,
        ativo: true,
        situacaoFuncional: SituacaoFuncional.ATIVO,
      }),
      criarFuncionarioMock({
        id: 2,
        ativo: false,
        situacaoFuncional: SituacaoFuncional.ATIVO,
      }),
      criarFuncionarioMock({
        id: 3,
        ativo: true,
        situacaoFuncional: SituacaoFuncional.INATIVO,
      }),
    ]

    describe('filtrarFuncionariosAtivos', () => {
      it('deve filtrar apenas funcion�rios ativos', () => {
        const ativos = filtrarFuncionariosAtivos(funcionarios)
        expect(ativos).toHaveLength(1)
        expect(ativos[0].id).toBe(1)
      })
    })

    describe('filtrarFuncionariosParaFiscalizacao', () => {
      it('deve filtrar funcion�rios aptos para fiscaliza��o', () => {
        const aptosParaFiscalizacao =
          filtrarFuncionariosParaFiscalizacao(funcionarios)
        expect(aptosParaFiscalizacao).toHaveLength(2) // Os que t�m ativo: true
        expect(aptosParaFiscalizacao.map((f) => f.id)).toEqual([1, 3])
      })
    })

    describe('buscarPorMatricula', () => {
      const funcionariosComMatricula = [
        criarFuncionarioMock({ matricula: '12345' }),
        criarFuncionarioMock({ matricula: 'ABC123' }),
        criarFuncionarioMock({ matricula: '67890' }),
      ]

      it('deve encontrar funcion�rio por matr�cula exata', () => {
        const funcionario = buscarPorMatricula(
          funcionariosComMatricula,
          '12345',
        )
        expect(funcionario).toBeDefined()
        expect(funcionario?.matricula).toBe('12345')
      })

      it('deve buscar ignorando case e espa�os', () => {
        const funcionario = buscarPorMatricula(
          funcionariosComMatricula,
          ' abc123 ',
        )
        expect(funcionario).toBeDefined()
        expect(funcionario?.matricula).toBe('ABC123')
      })

      it('deve retornar undefined se n�o encontrar', () => {
        const funcionario = buscarPorMatricula(
          funcionariosComMatricula,
          '99999',
        )
        expect(funcionario).toBeUndefined()
      })
    })

    describe('buscarPorNome', () => {
      const funcionariosComNome = [
        criarFuncionarioMock({ nome: 'Jo�o Silva' }),
        criarFuncionarioMock({ nome: 'Maria Silva' }),
        criarFuncionarioMock({ nome: 'Pedro Santos' }),
      ]

      it('deve encontrar funcion�rios por nome parcial', () => {
        const funcionarios = buscarPorNome(funcionariosComNome, 'Silva')
        expect(funcionarios).toHaveLength(2)
      })

      it('deve retornar vazio para busca muito curta', () => {
        const funcionarios = buscarPorNome(funcionariosComNome, 'J')
        expect(funcionarios).toHaveLength(0)
      })

      it('deve buscar ignorando case', () => {
        const funcionarios = buscarPorNome(funcionariosComNome, 'SILVA')
        expect(funcionarios).toHaveLength(2)
      })
    })

    describe('filtrarPorLotacao', () => {
      const funcionariosComLotacao = [
        criarFuncionarioMock({ lotacao: 'TI' }),
        criarFuncionarioMock({ lotacao: 'RH' }),
        criarFuncionarioMock({ lotacao: 'Financeiro' }),
      ]

      it('deve filtrar por lota��o', () => {
        const funcionarios = filtrarPorLotacao(funcionariosComLotacao, 'TI')
        expect(funcionarios).toHaveLength(1)
        expect(funcionarios[0].lotacao).toBe('TI')
      })

      it('deve retornar todos se lota��o for vazia', () => {
        const funcionarios = filtrarPorLotacao(funcionariosComLotacao, '')
        expect(funcionarios).toHaveLength(3)
      })
    })
  })

  describe('Agrupamento e Organiza��o', () => {
    const funcionarios = [
      criarFuncionarioMock({ nome: 'Z� Silva', lotacao: 'TI' }),
      criarFuncionarioMock({ nome: 'Ana Costa', lotacao: 'RH' }),
      criarFuncionarioMock({ nome: 'Bruno Lima', lotacao: 'TI' }),
    ]

    describe('agruparPorLotacao', () => {
      it('deve agrupar funcion�rios por lota��o', () => {
        const grupos = agruparPorLotacao(funcionarios)

        expect(grupos['TI']).toHaveLength(2)
        expect(grupos['RH']).toHaveLength(1)
      })

      it('deve lidar com funcion�rios sem lota��o', () => {
        const funcionariosComSemLotacao = [
          ...funcionarios,
          criarFuncionarioMock({ lotacao: undefined }),
        ]

        const grupos = agruparPorLotacao(funcionariosComSemLotacao)
        expect(grupos['Sem lotacao']).toHaveLength(1)
      })
    })

    describe('agruparPorSituacao', () => {
      it('deve agrupar por situa��o funcional', () => {
        const funcionariosComSituacao = [
          criarFuncionarioMock({ situacaoFuncional: SituacaoFuncional.ATIVO }),
          criarFuncionarioMock({
            situacaoFuncional: SituacaoFuncional.AFASTADO,
          }),
          criarFuncionarioMock({ situacaoFuncional: SituacaoFuncional.ATIVO }),
        ]

        const grupos = agruparPorSituacao(funcionariosComSituacao)

        expect(grupos[SituacaoFuncional.ATIVO]).toHaveLength(2)
        expect(grupos[SituacaoFuncional.AFASTADO]).toHaveLength(1)
      })
    })

    describe('ordenarPorNome', () => {
      it('deve ordenar funcion�rios por nome', () => {
        const ordenados = ordenarPorNome(funcionarios)

        expect(ordenados[0].nome).toBe('Ana Costa')
        expect(ordenados[1].nome).toBe('Bruno Lima')
        expect(ordenados[2].nome).toBe('Z� Silva')
      })

      it('n�o deve modificar array original', () => {
        const original = [...funcionarios]
        ordenarPorNome(funcionarios)
        expect(funcionarios).toEqual(original)
      })
    })

    describe('ordenarPorMatricula', () => {
      it('deve ordenar funcion�rios por matr�cula', () => {
        const funcionariosComMatricula = [
          criarFuncionarioMock({ matricula: '300' }),
          criarFuncionarioMock({ matricula: '100' }),
          criarFuncionarioMock({ matricula: '200' }),
        ]

        const ordenados = ordenarPorMatricula(funcionariosComMatricula)

        expect(ordenados[0].matricula).toBe('100')
        expect(ordenados[1].matricula).toBe('200')
        expect(ordenados[2].matricula).toBe('300')
      })
    })
  })

  describe('Estat�sticas', () => {
    describe('contarPorSituacao', () => {
      it('deve contar funcion�rios por situa��o', () => {
        const funcionarios = [
          criarFuncionarioMock({ situacaoFuncional: SituacaoFuncional.ATIVO }),
          criarFuncionarioMock({ situacaoFuncional: SituacaoFuncional.ATIVO }),
          criarFuncionarioMock({
            situacaoFuncional: SituacaoFuncional.AFASTADO,
          }),
        ]

        const contador = contarPorSituacao(funcionarios)

        expect(contador[SituacaoFuncional.ATIVO]).toBe(2)
        expect(contador[SituacaoFuncional.AFASTADO]).toBe(1)
      })
    })

    describe('calcularEstatisticas', () => {
      it('deve calcular estat�sticas completas', () => {
        const funcionarios = [
          criarFuncionarioMock({
            ativo: true,
            situacaoFuncional: SituacaoFuncional.ATIVO,
            lotacao: 'TI',
          }),
          criarFuncionarioMock({
            ativo: false,
            situacaoFuncional: SituacaoFuncional.ATIVO,
            lotacao: 'RH',
          }),
          criarFuncionarioMock({
            ativo: true,
            situacaoFuncional: SituacaoFuncional.INATIVO,
            lotacao: 'TI',
          }),
        ]

        const stats = calcularEstatisticas(funcionarios)

        expect(stats.total).toBe(3)
        expect(stats.ativos).toBe(1) // Apenas o primeiro (ativo=true E situacao=ATIVO)
        expect(stats.inativos).toBe(2)
        expect(stats.aptosFiscalizacao).toBe(2) // Os dois com ativo=true
        expect(stats.percentualAtivos).toBeCloseTo(33.33, 2)
        expect(stats.lotacoesUnicas).toBe(2) // TI e RH
      })

      it('deve lidar com lista vazia', () => {
        const stats = calcularEstatisticas([])

        expect(stats.total).toBe(0)
        expect(stats.ativos).toBe(0)
        expect(stats.percentualAtivos).toBe(0)
        expect(stats.lotacoesUnicas).toBe(0)
      })
    })
  })
})
