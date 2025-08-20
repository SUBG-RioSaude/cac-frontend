import type { DocumentoContrato } from '@/modules/Contratos/types/documento-contrato'

export interface ContratoDetalhado {
  id: string
  numeroContrato: string
  processoSEI?: string
  objeto: string
  tipoContratacao: 'centralizado' | 'descentralizado'
  dataInicio: string
  dataTermino: string
  prazoInicialMeses: number
  status: 'ativo' | 'vencendo' | 'vencido' | 'suspenso' | 'encerrado'
  valorTotal: number

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
  tipo:
    | 'criacao'
    | 'designacao_fiscais'
    | 'primeiro_pagamento'
    | 'atualizacao_documentos'
    | 'alteracao_valor'
    | 'prorrogacao'
    | 'documento_entregue'
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

// Novas interfaces para a checklist de documentos
export interface DocumentoChecklist {
  status: 'entregue' | 'pendente' | 'nao_aplicavel'
  dataEntrega?: string // ISO date string
}

export interface ChecklistData {
  termoReferencia: DocumentoChecklist
  homologacao: DocumentoChecklist
  ataRegistroPrecos: DocumentoChecklist
  garantiaContratual: DocumentoChecklist
  contrato: DocumentoChecklist
  publicacaoPncp: DocumentoChecklist
  publicacaoExtrato: DocumentoChecklist
}