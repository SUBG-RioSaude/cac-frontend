/**
 * ==========================================
 * HOOK DE DEBUG PARA CADASTRO DE CONTRATOS
 * ==========================================
 * Hook que gerencia logs, mock data e funcionalidades de debug
 * para o formulário de cadastro de contratos
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DadosFornecedor } from '@/modules/Contratos/components/CadastroDeContratos/fornecedor-form'
import type { DadosContrato } from '@/modules/Contratos/components/CadastroDeContratos/contrato-form'
import type { DadosUnidades } from '@/modules/Contratos/types/unidades'
import type { DadosAtribuicao } from '@/modules/Contratos/components/CadastroDeContratos/atribuicao-fiscais-form'
import { getUnidades } from '@/modules/Unidades/services/unidades-service'
import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface ApiLog {
  id: string
  timestamp: string
  method: string
  url: string
  status: 'loading' | 'success' | 'error'
  duration?: number
  data?: unknown
  error?: string
}

interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
  atribuicao?: DadosAtribuicao
}

export function useDebugCadastro() {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])
  const logIdCounter = useRef(0)

  // Carregar logs do localStorage na inicialização
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('debug-cadastro-logs')
      if (savedLogs) {
        setApiLogs(JSON.parse(savedLogs))
      }
    } catch (error) {
      console.warn('Erro ao carregar logs do localStorage:', error)
    }
  }, [])

  // Salvar logs no localStorage quando alterados
  useEffect(() => {
    try {
      localStorage.setItem('debug-cadastro-logs', JSON.stringify(apiLogs.slice(-50))) // Manter apenas os 50 mais recentes
    } catch (error) {
      console.warn('Erro ao salvar logs no localStorage:', error)
    }
  }, [apiLogs])

  const logApiCall = useCallback((
    method: string,
    url: string,
    status: 'loading' | 'success' | 'error',
    data?: unknown,
    error?: string,
    duration?: number
  ) => {
    const log: ApiLog = {
      id: `log-${++logIdCounter.current}`,
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      url,
      status,
      data,
      error,
      duration
    }

    setApiLogs(prev => [...prev, log])
    
    // Debug console
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'
    console.log(`${emoji} [DEBUG API] ${method.toUpperCase()} ${url}`, {
      status,
      duration: duration ? `${duration}ms` : undefined,
      data,
      error
    })
  }, [])

  const clearLogs = useCallback(() => {
    setApiLogs([])
    localStorage.removeItem('debug-cadastro-logs')
  }, [])

  // Função para gerar CNPJ válido
  const gerarCnpjValido = useCallback(() => {
    // Gerar os primeiros 12 dígitos aleatórios
    const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))
    
    // Calcular primeiro dígito verificador
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma1 = base.reduce((acc, digit, index) => acc + digit * pesos1[index], 0)
    const resto1 = soma1 % 11
    const digito1 = resto1 < 2 ? 0 : 11 - resto1
    
    // Calcular segundo dígito verificador
    const baseComDigito1 = [...base, digito1]
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma2 = baseComDigito1.reduce((acc, digit, index) => acc + digit * pesos2[index], 0)
    const resto2 = soma2 % 11
    const digito2 = resto2 < 2 ? 0 : 11 - resto2
    
    // Formar o CNPJ completo
    const cnpjCompleto = [...baseComDigito1, digito2]
    
    // Formatear como string com máscara
    const cnpjString = cnpjCompleto.join('')
    return `${cnpjString.substring(0, 2)}.${cnpjString.substring(2, 5)}.${cnpjString.substring(5, 8)}/${cnpjString.substring(8, 12)}-${cnpjString.substring(12, 14)}`
  }, [])

  // Função para gerar CEP válido brasileiro
  const gerarCepValido = useCallback((estado: string) => {
    const faixasCep: Record<string, { min: number; max: number }> = {
      'SP': { min: 1000000, max: 19999999 }, // 01000-000 a 19999-999
      'RJ': { min: 20000000, max: 28999999 }, // 20000-000 a 28999-999
      'ES': { min: 29000000, max: 29999999 }, // 29000-000 a 29999-999
      'MG': { min: 30000000, max: 39999999 }, // 30000-000 a 39999-999
      'BA': { min: 40000000, max: 48999999 }, // 40000-000 a 48999-999
      'SE': { min: 49000000, max: 49999999 }, // 49000-000 a 49999-999
      'PE': { min: 50000000, max: 56999999 }, // 50000-000 a 56999-999
      'AL': { min: 57000000, max: 57999999 }, // 57000-000 a 57999-999
      'PB': { min: 58000000, max: 58999999 }, // 58000-000 a 58999-999
      'RN': { min: 59000000, max: 59999999 }, // 59000-000 a 59999-999
      'CE': { min: 60000000, max: 63999999 }, // 60000-000 a 63999-999
      'PI': { min: 64000000, max: 64999999 }, // 64000-000 a 64999-999
      'MA': { min: 65000000, max: 65999999 }, // 65000-000 a 65999-999
      'PA': { min: 66000000, max: 68999999 }, // 66000-000 a 68999-999
      'AP': { min: 68900000, max: 68999999 }, // 68900-000 a 68999-999
      'AM': { min: 69000000, max: 69299999 }, // 69000-000 a 69299-999
      'RR': { min: 69300000, max: 69399999 }, // 69300-000 a 69399-999
      'AC': { min: 69900000, max: 69999999 }, // 69900-000 a 69999-999
      'DF': { min: 70000000, max: 72999999 }, // 70000-000 a 72999-999
      'GO': { min: 73700000, max: 76999999 }, // 73700-000 a 76999-999
      'TO': { min: 77000000, max: 77999999 }, // 77000-000 a 77999-999
      'MT': { min: 78000000, max: 78899999 }, // 78000-000 a 78899-999
      'RO': { min: 76800000, max: 76999999 }, // 76800-000 a 76999-999
      'MS': { min: 79000000, max: 79999999 }, // 79000-000 a 79999-999
      'PR': { min: 80000000, max: 87999999 }, // 80000-000 a 87999-999
      'SC': { min: 88000000, max: 89999999 }, // 88000-000 a 89999-999
      'RS': { min: 90000000, max: 99999999 }, // 90000-000 a 99999-999
    }

    const faixaEstado = faixasCep[estado] || faixasCep['SP'] // Default para SP se estado não encontrado
    const cepNumerico = Math.floor(Math.random() * (faixaEstado.max - faixaEstado.min + 1)) + faixaEstado.min
    
    // Formatar como XXXXX-XXX
    const cepString = cepNumerico.toString().padStart(8, '0')
    return `${cepString.substring(0, 5)}-${cepString.substring(5, 8)}`
  }, [])

  // Função para gerar dados aleatórios únicos
  const gerarDadosAleatorios = useCallback(() => {
    const nomes = [
      'Tech Solutions', 'Inovação', 'Sistemas', 'Consultoria', 'Serviços', 'Digital', 'Smart', 'Pro',
      'Advanced', 'Prime', 'Elite', 'Master', 'Global', 'Premium', 'Excellence', 'Quality',
      'Innovation', 'Dynamic', 'Strategic', 'Creative', 'Modern', 'Future', 'Next', 'Alpha'
    ]
    const sufixos = [
      'Tech', 'Systems', 'Solutions', 'Services', 'Group', 'Corp', 'Enterprise', 'Partners',
      'Industries', 'Network', 'Digital', 'Innovations', 'Dynamics', 'Technologies'
    ]
    const tipos = ['LTDA', 'S.A.', 'EIRELI', 'ME', 'EPP']
    const cidades = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Salvador', 'Brasília', 'Curitiba', 'Recife', 'Fortaleza', 'Manaus']
    const estados = ['SP', 'RJ', 'MG', 'RS', 'BA', 'DF', 'PR', 'PE', 'CE', 'AM']
    const bairros = [
      'Centro', 'Vila Nova', 'Jardim das Flores', 'Alto da Colina', 'Parque Industrial',
      'Zona Sul', 'Copacabana', 'Ipanema', 'Brooklin', 'Vila Madalena', 'Pinheiros',
      'Savassi', 'Funcionários', 'Boa Viagem', 'Meireles'
    ]
    
    // Usar timestamp para garantir unicidade
    const timestamp = Date.now()
    const randomSeed = Math.floor(Math.random() * 10000)
    
    const nome1 = nomes[Math.floor(Math.random() * nomes.length)]
    const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)]
    const tipoEmpresa = tipos[Math.floor(Math.random() * tipos.length)]
    const cidadeIndex = Math.floor(Math.random() * cidades.length)
    
    // Nome único com timestamp para evitar duplicatas
    const nomeUnico = `${nome1} ${sufixo} ${String(timestamp).slice(-4)}`
    const razaoSocialCompleta = `${nomeUnico} ${tipoEmpresa}`
    
    return {
      razaoSocial: razaoSocialCompleta,
      cidade: cidades[cidadeIndex],
      estado: estados[cidadeIndex],
      bairro: bairros[Math.floor(Math.random() * bairros.length)],
      // IE e IM únicos baseados no timestamp
      inscricaoEstadual: `${String(timestamp).slice(-8)}${Math.floor(Math.random() * 99)}`.padStart(11, '0').slice(0, 11),
      inscricaoMunicipal: `${String(timestamp).slice(-6)}${randomSeed}`.padStart(10, '0').slice(0, 10),
      endereco: `Rua ${nomes[Math.floor(Math.random() * nomes.length)]}`,
      numero: `${Math.floor(Math.random() * 9999) + 1}`,
      complemento: Math.random() > 0.7 ? `Sala ${Math.floor(Math.random() * 999) + 1}` : '',
      cep: gerarCepValido(estados[cidadeIndex]),
      telefone: `(${10 + Math.floor(Math.random() * 89)}) 9${Math.floor(Math.random() * 8999) + 1000}-${Math.floor(Math.random() * 8999) + 1000}`,
      email: `contato@${nome1.toLowerCase().replace(/\s+/g, '')}-${String(timestamp).slice(-4)}.com.br`,
      // Dados únicos para identificação
      timestampGerado: timestamp,
      seedAleatorio: randomSeed
    }
  }, [gerarCepValido])

  // Mock data generators
  const getMockFornecedor = useCallback((): DadosFornecedor => {
    const dadosAleatorios = gerarDadosAleatorios()
    
    // Gerar contatos variados
    const contatos = [
      {
        id: '1',
        nome: 'Contato Comercial',
        valor: dadosAleatorios.telefone,
        tipo: 'Celular' as const,
        ativo: true,
      },
      {
        id: '2',
        nome: 'E-mail Corporativo',
        valor: dadosAleatorios.email,
        tipo: 'Email' as const,
        ativo: true,
      }
    ]

    // 50% chance de adicionar um terceiro contato (telefone fixo)
    if (Math.random() > 0.5) {
      const dddArea = dadosAleatorios.telefone.substring(1, 3)
      const telefoneFixo = `(${dddArea}) ${Math.floor(Math.random() * 6000) + 2000}-${Math.floor(Math.random() * 8999) + 1000}`
      
      contatos.push({
        id: '3',
        nome: 'Telefone Fixo',
        valor: telefoneFixo,
        tipo: 'Celular' as const,
        ativo: true,
      })
    }
    
    return {
      cnpj: gerarCnpjValido(),
      razaoSocial: dadosAleatorios.razaoSocial,
      estadoIE: dadosAleatorios.estado,
      inscricaoEstadual: dadosAleatorios.inscricaoEstadual,
      inscricaoMunicipal: dadosAleatorios.inscricaoMunicipal,
      endereco: dadosAleatorios.endereco,
      numero: dadosAleatorios.numero,
      complemento: dadosAleatorios.complemento,
      bairro: dadosAleatorios.bairro,
      cidade: dadosAleatorios.cidade,
      estado: dadosAleatorios.estado,
      cep: dadosAleatorios.cep,
      ativo: true,
      contatos,
    }
  }, [gerarCnpjValido, gerarDadosAleatorios])

  const getMockContrato = useCallback(async (): Promise<DadosContrato> => {
    const categorias = [
      'Prestação de Serviços', 'Fornecimento de Materiais', 'Obras e Reformas', 
      'Locação de Equipamentos', 'Manutenção Predial', 'Serviços de Limpeza',
      'Consultoria Técnica', 'Suporte de TI', 'Segurança Patrimonial'
    ]
    // Função para mapear dados da API para UnidadeHospitalar
    const mapearUnidadeSaudeParaHospitalar = (unidadeApi: UnidadeSaudeApi): UnidadeHospitalar => {
      return {
        id: unidadeApi.id,
        nome: unidadeApi.nome,
        codigo: `${unidadeApi.sigla || 'UNK'}-${unidadeApi.id.slice(-3)}`,
        ug: unidadeApi.uo?.toString() || '',
        sigla: unidadeApi.sigla || '',
        cnpj: unidadeApi.cnes || '',
        cep: '',
        endereco: unidadeApi.endereco || '',
        cidade: '',
        estado: '',
        responsavel: '',
        telefone: '',
        email: '',
        ativa: unidadeApi.ativo
      }
    }

    // Tentar obter unidades reais da API
    let unidadesDisponiveis: UnidadeHospitalar[] = []
    let unidadeDemandanteSelecionada: string = ''
    let unidadeGestoraSelecionada: string = ''
    let unidadeDemandanteIdSelecionado: string = ''
    let unidadeGestoraIdSelecionado: string = ''
    
    try {
      const responseUnidades = await getUnidades({ tamanhoPagina: 50 })
      if (responseUnidades?.dados && responseUnidades.dados.length > 0) {
        // Mapear e filtrar apenas unidades ativas
        unidadesDisponiveis = responseUnidades.dados
          .filter(u => u.ativo)
          .map(mapearUnidadeSaudeParaHospitalar)
        
        if (unidadesDisponiveis.length > 0) {
          // Selecionar unidades aleatórias da API
          const unidadeDemandante = unidadesDisponiveis[Math.floor(Math.random() * unidadesDisponiveis.length)]
          const unidadeGestora = unidadesDisponiveis[Math.floor(Math.random() * unidadesDisponiveis.length)]
          
          unidadeDemandanteSelecionada = unidadeDemandante.nome
          unidadeGestoraSelecionada = unidadeGestora.nome
          unidadeDemandanteIdSelecionado = unidadeDemandante.id
          unidadeGestoraIdSelecionado = unidadeGestora.id
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar unidades da API, usando fallback mock:', error)
    }
    
    // Fallback para mock se API não estiver disponível ou sem dados
    if (!unidadeDemandanteSelecionada || !unidadeGestoraSelecionada) {
      const unidadesMock = [
        'Secretaria de Saúde', 'Secretaria de Administração', 'Secretaria de TI', 'Procuradoria Geral',
        'Coordenação de Contratos', 'Departamento de Compras', 'Gerência de Contratos', 'Diretoria Executiva',
        'Hospital Central', 'Instituto do Coração', 'UPA Norte', 'Centro de Saúde Sul'
      ]
      
      unidadeDemandanteSelecionada = unidadesMock[Math.floor(Math.random() * unidadesMock.length)]
      unidadeGestoraSelecionada = unidadesMock[Math.floor(Math.random() * unidadesMock.length)]
      // IDs mock para fallback
      unidadeDemandanteIdSelecionado = `550e8400-e29b-41d4-a716-${String(Math.floor(Math.random() * 999999999999)).padStart(12, '4')}`
      unidadeGestoraIdSelecionado = `550e8400-e29b-41d4-a716-${String(Math.floor(Math.random() * 999999999999)).padStart(12, '4')}`
    }
    const prazos = [6, 12, 18, 24, 36, 48]
    
    // Timestamp para unicidade
    const timestamp = Date.now()
    const ano = new Date().getFullYear()
    const numeroSequencial = Math.floor(timestamp / 1000) % 9999 + 1 // Número único baseado no timestamp (1-9999)
    const categoriaIndex = Math.floor(Math.random() * categorias.length)
    const prazoMeses = prazos[Math.floor(Math.random() * prazos.length)]
    
    // Valor baseado no timestamp para ser único
    const valorBase = (timestamp % 500000) + 50000 // Entre 50k e 550k
    const valorFinal = (Math.floor(valorBase / 1000) * 1000).toFixed(2) // Arredondar para milhares
    
    const vigenciaInicial = new Date()
    const vigenciaFinal = new Date()
    vigenciaFinal.setMonth(vigenciaFinal.getMonth() + prazoMeses)
    
    const formaPagamento = ['Mensal', 'Etapas', 'Outro'][Math.floor(Math.random() * 3)] as 'Mensal' | 'Etapas' | 'Outro'
    const formaPagamentoComplemento = formaPagamento === 'Outro' 
      ? ['A cada entrega', 'Conforme cronograma', 'Após aprovação'][Math.floor(Math.random() * 3)]
      : undefined

    return {
      numeroContrato: `CONT-${ano}-${numeroSequencial.toString().padStart(4, '0')}`,
      processos: [
        {
          tipo: 'sei' as const,
          valor: `${String(timestamp).slice(-5)}.${String(timestamp).slice(-11, -5)}/${ano}-${Math.floor(Math.random() * 89) + 10}`
        }
      ],
      categoriaObjeto: categorias[categoriaIndex],
      descricaoObjeto: `Contrato para ${categorias[categoriaIndex].toLowerCase()} - ID: ${String(timestamp).slice(-6)}`,
      tipoContratacao: ['Licitacao', 'Pregao', 'Dispensa', 'Inexigibilidade'][Math.floor(Math.random() * 4)] as 'Licitacao' | 'Pregao' | 'Dispensa' | 'Inexigibilidade',
      tipoContrato: ['Compra', 'Prestacao_Servico', 'Fornecimento', 'Manutencao'][categoriaIndex % 4] as 'Compra' | 'Prestacao_Servico' | 'Fornecimento' | 'Manutencao',
      unidadeDemandante: unidadeDemandanteSelecionada,
      unidadeGestora: unidadeGestoraSelecionada,
      // IDs das unidades (reais da API ou mock como fallback)
      unidadeDemandanteId: unidadeDemandanteIdSelecionado,
      unidadeGestoraId: unidadeGestoraIdSelecionado,
      contratacao: Math.random() > 0.5 ? 'Centralizada' : 'Descentralizada',
      vigenciaInicial: vigenciaInicial.toISOString().split('T')[0],
      vigenciaFinal: vigenciaFinal.toISOString().split('T')[0],
      prazoInicialMeses: prazoMeses,
      prazoInicialDias: Math.floor(Math.random() * 31), // 0 a 30 dias
      valorGlobal: valorFinal,
      formaPagamento,
      formaPagamentoComplemento,
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: `https://processo.rio/contratos/${ano}/${numeroSequencial}/${String(timestamp).slice(-6)}`,
      vinculacaoPCA: Math.random() > 0.3 ? 'Sim' : 'Não'
    }
  }, [])

  const getMockUnidades = useCallback((): DadosUnidades => {
    const tiposUnidade = ['Hospital', 'Clínica', 'UPA', 'Centro de Saúde', 'Policlínica']
    const regioes = ['Central', 'Norte', 'Sul', 'Leste', 'Oeste']
    const cidades = ['Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Porto Alegre']
    const estados = ['RJ', 'SP', 'MG', 'RS']
    
    const numUnidades = Math.floor(Math.random() * 3) + 2 // 2 a 4 unidades
    const unidades = []
    
    let percentualRestante = 100
    
    for (let i = 0; i < numUnidades; i++) {
      const tipoIndex = Math.floor(Math.random() * tiposUnidade.length)
      const regiaoIndex = Math.floor(Math.random() * regioes.length)
      const cidadeIndex = Math.floor(Math.random() * cidades.length)
      
      const isUltima = i === numUnidades - 1
      const percentual = isUltima 
        ? percentualRestante 
        : Math.floor(Math.random() * (percentualRestante - (numUnidades - i - 1) * 10)) + 10
      
      percentualRestante -= percentual
      
      const sigla = `${tiposUnidade[tipoIndex].substring(0, 1)}${regioes[regiaoIndex].substring(0, 1)}${(i + 1).toString().padStart(2, '0')}`
      const valor = (percentual * Math.floor(Math.random() * 5000 + 1000)).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      })
      
      unidades.push({
        id: `unidade-${i + 1}`,
        unidadeHospitalar: {
          id: `unidade-hospitalar-${i + 1}`,
          nome: `${tiposUnidade[tipoIndex]} ${regioes[regiaoIndex]}`,
          codigo: `${sigla}-${(i + 1).toString().padStart(3, '0')}`,
          ug: (i + 1).toString().padStart(3, '0'),
          sigla,
          cnpj: `${Math.floor(Math.random() * 99999999999999)}.000001/0001-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`,
          cep: `${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
          endereco: `Rua ${regioes[regiaoIndex]}, ${Math.floor(Math.random() * 9999) + 1}`,
          cidade: cidades[cidadeIndex],
          estado: estados[cidadeIndex],
          responsavel: `Responsável ${tiposUnidade[tipoIndex]}`,
          telefone: `(${10 + Math.floor(Math.random() * 89)}) ${Math.floor(Math.random() * 8999) + 1000}-${Math.floor(Math.random() * 8999) + 1000}`,
          email: `contato@${sigla.toLowerCase()}.gov.br`,
          ativa: true
        },
        valorAlocado: valor,
        percentualContrato: percentual
      })
    }
    
    return {
      unidades,
      observacoes: `Dados gerados automaticamente - ${numUnidades} unidades distribuídas`
    }
  }, [])

  const getMockAtribuicao = useCallback((): DadosAtribuicao => {
    const nomes = [
      'Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Roberto', 'Juliana', 'Pedro', 'Carla', 'Ricardo',
      'Mariana', 'Bruno', 'Amanda', 'Rafael', 'Camila', 'Diego', 'Patrícia', 'Thiago', 'Larissa', 'Rodrigo',
      'Gabriela', 'Marcelo', 'Vanessa', 'André', 'Carolina', 'Felipe', 'Isabela', 'Leonardo', 'Priscila', 'Gustavo'
    ]
    const sobrenomes = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Almeida', 'Pereira', 'Lima', 'Gomes',
      'Rodrigues', 'Martins', 'Nascimento', 'Araujo', 'Rocha', 'Barbosa', 'Cardoso', 'Ribeiro', 'Castro', 'Dias'
    ]
    const departamentos = ['Contratos', 'Administrativo', 'Jurídico', 'Financeiro', 'Compras', 'Gestão', 'Auditoria', 'Compliance']
    const cargosFiscal = ['Fiscal de Contratos', 'Analista de Contratos', 'Técnico em Contratos', 'Especialista em Fiscalização']
    const cargosGestor = ['Gestor de Contratos', 'Coordenador', 'Supervisor de Contratos', 'Gerente de Relacionamento']
    
    const usuariosAtribuidos = []
    const timestamp = Date.now()
    
    // Gerar pelo menos 1 fiscal e 1 gestor
    const numFiscais = Math.floor(Math.random() * 2) + 1 // 1 a 2 fiscais
    const numGestores = Math.floor(Math.random() * 2) + 1 // 1 a 2 gestores
    
    // Gerar fiscais
    for (let i = 0; i < numFiscais; i++) {
      const nome = nomes[Math.floor(Math.random() * nomes.length)]
      const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)]
      const departamento = departamentos[Math.floor(Math.random() * departamentos.length)]
      const cargo = cargosFiscal[Math.floor(Math.random() * cargosFiscal.length)]
      // Matrícula única baseada no timestamp
      const matricula = `F${String(timestamp + i).slice(-6)}`
      
      usuariosAtribuidos.push({
        id: `fiscal-${timestamp}-${i + 1}`,
        matricula,
        nome: `${nome} ${sobrenome}`,
        email: `${nome.toLowerCase()}.${sobrenome.toLowerCase()}-${String(timestamp).slice(-4)}@hospital.gov.br`,
        cargo,
        departamento: `Departamento de ${departamento}`,
        telefone: `(21) ${Math.floor(Math.random() * 89999) + 90000}-${Math.floor(Math.random() * 8999) + 1000}`,
        status: 'ativo' as const,
        tipo: 'fiscal' as const
      })
    }
    
    // Gerar gestores
    for (let i = 0; i < numGestores; i++) {
      const nome = nomes[Math.floor(Math.random() * nomes.length)]
      const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)]
      const departamento = departamentos[Math.floor(Math.random() * departamentos.length)]
      const cargo = cargosGestor[Math.floor(Math.random() * cargosGestor.length)]
      // Matrícula única baseada no timestamp
      const matricula = `G${String(timestamp + numFiscais + i).slice(-6)}`
      
      usuariosAtribuidos.push({
        id: `gestor-${timestamp}-${i + 1}`,
        matricula,
        nome: `${nome} ${sobrenome}`,
        email: `${nome.toLowerCase()}.${sobrenome.toLowerCase()}-${String(timestamp).slice(-4)}@hospital.gov.br`,
        cargo,
        departamento: `Departamento de ${departamento}`,
        telefone: `(21) ${Math.floor(Math.random() * 89999) + 90000}-${Math.floor(Math.random() * 8999) + 1000}`,
        status: 'ativo' as const,
        tipo: 'gestor' as const
      })
    }
    
    return {
      usuariosAtribuidos
    }
  }, [])

  const preencherDadosMock = useCallback(async (step: number) => {
    if (step === 2) {
      // Step 2 é assíncrono por causa da API de unidades
      return await getMockContrato()
    }
    
    const mockData = {
      1: getMockFornecedor(),
      3: getMockUnidades(),
      4: getMockAtribuicao()
    }

    return mockData[step as keyof typeof mockData] || null
  }, [getMockFornecedor, getMockContrato, getMockUnidades, getMockAtribuicao])

  const exportarDados = useCallback((dadosCompletos: DadosCompletos) => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      dadosCompletos,
      apiLogs: apiLogs.slice(-20), // Últimos 20 logs
      debug: true
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-cadastro-contrato-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [apiLogs])

  // Wrapper para interceptar executeWithFallback
  const wrapApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    method: string,
    url: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    logApiCall(method, url, 'loading')
    
    try {
      const result = await apiCall()
      const duration = Math.round(performance.now() - startTime)
      
      logApiCall(method, url, 'success', result, undefined, duration)
      
      return result
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      logApiCall(method, url, 'error', undefined, errorMessage, duration)
      
      throw error
    }
  }, [logApiCall])

  return {
    apiLogs,
    logApiCall,
    clearLogs,
    preencherDadosMock,
    exportarDados,
    wrapApiCall,
    // Mock data getters
    getMockFornecedor,
    getMockContrato,
    getMockUnidades,
    getMockAtribuicao
  }
}