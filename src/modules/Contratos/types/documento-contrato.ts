export interface DocumentoContrato {
  id: string
  nome: string
  descricao: string
  tipo: TipoDocumento
  categoria: 'obrigatorio' | 'opcional'
  status: StatusDocumento
  linkExterno?: string
  dataUpload?: string
  dataUltimaVerificacao?: string
  responsavel?: string
  observacoes?: string
  prioridade: number
}

export interface TipoDocumento {
  id: string
  nome: string
  icone: string
  cor: string
  descricaoDetalhada: string
  exemplos?: string[]
}

export type StatusDocumento = 
  | 'pendente'
  | 'em_analise' 
  | 'conferido'
  | 'com_pendencia'
  | 'rejeitado'

export interface FiltroDocumento {
  categoria?: 'obrigatorio' | 'opcional' | 'todos'
  status?: StatusDocumento | 'todos'
  tipo?: string | 'todos'
  busca?: string
}

export interface EstatisticaDocumentos {
  total: number
  conferidos: number
  pendentes: number
  comPendencia: number
  percentualCompleto: number
  obrigatoriosPendentes: number
}

// Tipos de documentos padrão para contratos
export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  {
    id: 'edital',
    nome: 'Edital',
    icone: 'FileText',
    cor: 'blue',
    descricaoDetalhada: 'Documento de licitação que estabelece as regras do processo',
    exemplos: ['Edital de Pregão', 'Edital de Concorrência']
  },
  {
    id: 'proposta',
    nome: 'Proposta Comercial',
    icone: 'DollarSign',
    cor: 'green',
    descricaoDetalhada: 'Proposta apresentada pelo fornecedor',
    exemplos: ['Proposta de Preços', 'Proposta Técnica']
  },
  {
    id: 'contrato',
    nome: 'Contrato Assinado',
    icone: 'FileCheck',
    cor: 'purple',
    descricaoDetalhada: 'Documento contratual assinado pelas partes'
  },
  {
    id: 'garantia',
    nome: 'Garantia Contratual',
    icone: 'Shield',
    cor: 'orange',
    descricaoDetalhada: 'Garantia apresentada para execução do contrato',
    exemplos: ['Seguro Garantia', 'Fiança Bancária', 'Depósito em Dinheiro']
  },
  {
    id: 'documentos_habilitacao',
    nome: 'Documentos de Habilitação',
    icone: 'Award',
    cor: 'teal',
    descricaoDetalhada: 'Documentos que comprovam a habilitação da empresa',
    exemplos: ['Certidões Negativas', 'Balanço Patrimonial', 'Atestados']
  },
  {
    id: 'aditivo',
    nome: 'Termo Aditivo',
    icone: 'FilePlus',
    cor: 'indigo',
    descricaoDetalhada: 'Documentos de alteração do contrato original'
  },
  {
    id: 'apostila',
    nome: 'Apostila',
    icone: 'FileSignature',
    cor: 'pink',
    descricaoDetalhada: 'Averbação de alterações não substanciais'
  },
  {
    id: 'ordem_servico',
    nome: 'Ordem de Serviço',
    icone: 'Play',
    cor: 'emerald',
    descricaoDetalhada: 'Autorização para início dos trabalhos'
  },
  {
    id: 'nota_fiscal',
    nome: 'Notas Fiscais',
    icone: 'Receipt',
    cor: 'amber',
    descricaoDetalhada: 'Documentos fiscais de cobrança'
  },
  {
    id: 'outros',
    nome: 'Outros Documentos',
    icone: 'File',
    cor: 'gray',
    descricaoDetalhada: 'Documentos diversos relacionados ao contrato'
  }
]