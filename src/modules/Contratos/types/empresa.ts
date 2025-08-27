export interface ContatoEmpresa {
  nome: string
  valor: string
  tipo: string
}

export interface EmpresaRequest {
  cnpj: string
  razaoSocial: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  usuarioCadastroId: string
  contatos: ContatoEmpresa[]
}

export interface EmpresaResponse {
  id: string
  cnpj: string
  razaoSocial: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  usuarioCadastroId: string
  contatos: ContatoEmpresa[]
  dataCadastro: string
  dataAtualizacao: string
  ativo: boolean
}

export interface EmpresaConsultaCNPJ {
  cnpj: string
}
