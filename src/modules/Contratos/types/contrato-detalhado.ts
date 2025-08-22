export interface ContratoDetalhado {
  id: string
  numeroContrato: string
  processoSEI?: string
  objeto: string
  tipoContratacao: 'centralizado' | 'descentralizado'
  dataInicio: string
  dataTermino: string
  prazoInicialMeses: number
  prazoInicialDias: number
  status: 'ativo' | 'vencendo' | 'vencido' | 'suspenso' | 'encerrado'
  valorTotal: number

  // Required properties from base Contrato interface
  vigenciaInicial: string
  vigenciaFinal: string
  valorGlobal: number
  empresaId: string
  ativo: boolean
  usuarioCadastroId: string
  usuarioAtualizacaoId: string
  dataCadastro: string
  dataAtualizacao: string
  valorTotalAtribuido: number
  valorDisponivel: number
  quantidadeUnidadesVinculadas: number
  quantidadeDocumentos: number

  // Informações CCon
  ccon?: {
    numero: string
    dataInicio: string
    dataTermino: string
  }

  // Responsáveis
  responsaveis: {
    fiscaisAdministrativos: Responsavel[]
    gestores: Responsavel[]
  }

  // Fornecedor
  fornecedor: {
    razaoSocial: string
    cnpj: string
    contatos: Contato[]
    inscricaoEstadual?: string
    inscricaoMunicipal?: string
    endereco: Endereco
  }

  // Unidades
  unidades: {
    demandante: string
    gestora: string
    vinculadas: UnidadeVinculada[]
  }

  // Alterações
  alteracoes: AlteracaoContrato[]

  // Documentos
  documentos: DocumentoContrato[]

  // Documentos Checklist
  documentosChecklist: ChecklistData

  // Indicadores
  indicadores: {
    saldoAtual: number
    percentualExecutado: number
    cronogramaVigencia: PeriodoVigencia[]
  }
}

export interface Responsavel {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo: string
  dataDesignacao: string
}

export interface Contato {
  tipo: 'email' | 'celular' | 'telefone'
  valor: string
  principal?: boolean
}

export interface Endereco {
  cep: string
  logradouro: string
  numero?: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
}

export interface UnidadeVinculada {
  nome: string
  percentualValor: number
  valorTotalMensal: number
}

export interface AlteracaoContrato {
  id: string
  tipo: string
  descricao: string
  dataHora: string
  responsavel: string
  detalhes?: unknown
}

export interface PeriodoVigencia {
  inicio: string
  fim: string
  descricao: string
  status: 'concluido' | 'em_andamento' | 'pendente'
}

export interface DocumentoContrato {
  id: string
  nome: string
  tipo: string
  url?: string
  dataUpload: string
}

export interface ChecklistData {
  id: string
  nome: string
  itens: ChecklistItem[]
  dataCriacao: string
  dataAtualizacao: string
  status: 'pendente' | 'em_andamento' | 'concluido'
}

export interface ChecklistItem {
  id: string
  descricao: string
  obrigatorio: boolean
  status: 'pendente' | 'concluido' | 'nao_aplicavel'
  observacoes?: string
  dataConclusao?: string
  responsavel?: string
}
