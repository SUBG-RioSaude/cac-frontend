// Export missing types that are imported elsewhere
export interface ChecklistData {
  termoReferencia: DocumentoChecklist
  homologacao: DocumentoChecklist
  ataRegistroPrecos: DocumentoChecklist
  garantiaContratual: DocumentoChecklist
  contrato: DocumentoChecklist
  publicacaoPncp: DocumentoChecklist
  publicacaoExtrato: DocumentoChecklist
}

export interface DocumentoChecklist {
  entregue: boolean
  link?: string
  dataEntrega?: string
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

export interface UnidadeVinculada {
  nome: string
  percentualValor: number
  valorTotalMensal: number
}

export interface ContratoDetalhado {
  id: string;
  numeroContrato: string;
  processoSEI?: string;
  objeto: string;
  tipoContratacao: string;
  dataInicio: string;
  dataTermino: string;
  prazoInicialMeses: number;
  status: string;
  valorTotal: number;
  // Required properties from base Contrato interface
  vigenciaInicial: string;
  vigenciaFinal: string;
  valorGlobal: number;
  empresaId: string;
  ativo: boolean;
  usuarioCadastroId: string;
  usuarioAtualizacaoId: string;
  dataCadastro: string;
  dataAtualizacao: string;
  valorTotalAtribuido: number;
  valorDisponivel: number;
  quantidadeUnidadesVinculadas: number;
  quantidadeDocumentos: number;
  ccon: {
    numero: string;
    dataInicio: string;
    dataTermino: string;
  };
  responsaveis: {
    fiscaisAdministrativos: Array<{
      id: string;
      nome: string;
      email: string;
      telefone: string;
      cargo: string;
      dataDesignacao: string;
    }>;
    gestores: Array<{
      id: string;
      nome: string;
      email: string;
      telefone: string;
      cargo: string;
      dataDesignacao: string;
    }>;
  };
  fornecedor: {
    razaoSocial: string;
    cnpj: string;
    contatos: Array<{
      tipo: string;
      valor: string;
      principal?: boolean;
    }>;
    inscricaoEstadual: string;
    inscricaoMunicipal: string;
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
  };
  unidades: {
    demandante: string;
    gestora: string;
    vinculadas: UnidadeVinculada[];
  };
  alteracoes: AlteracaoContrato[];
  documentos: Array<{
    id: string
    nome: string
    tipo: string
    url?: string
    dataUpload: string
  }>;
  documentosChecklist: ChecklistData;
  indicadores: {
    saldoAtual: number;
    percentualExecutado: number;
    cronogramaVigencia: PeriodoVigencia[];
  };
}
