export interface UnidadeHospitalar {
  id: string
  nome: string
  codigo: string
  ug: string
  sigla: string
  cnpj: string
  cep: string
  endereco: string
  cidade: string
  estado: string
  responsavel: string
  telefone: string
  email: string
  ativa: boolean
}

export interface UnidadeContrato {
  id: string
  unidadeHospitalar: UnidadeHospitalar
  valorAlocado: string
  percentualContrato: number
}

export interface DadosUnidades {
  unidades: UnidadeContrato[]
  observacoes: string
}
