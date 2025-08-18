declare module '*.json' {
  const value: {
    contratos: Array<{
      id: string
      numeroContrato: string
      numeroCCon?: string
      contratada: {
        razaoSocial: string
        cnpj: string
      }
      valor: number
      dataInicial: string
      dataFinal: string
      status: 'ativo' | 'vencendo' | 'vencido' | 'suspenso' | 'encerrado'
      unidade: string
      objeto: string
    }>
    contratoDetalhado: {
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
      ccon?: {
        numero: string
        dataInicio: string
        dataTermino: string
      }
      responsaveis: {
        fiscaisAdministrativos: Array<{
          id: string
          nome: string
          email: string
          telefone?: string
          cargo: string
          dataDesignacao: string
        }>
        gestores: Array<{
          id: string
          nome: string
          email: string
          telefone?: string
          cargo: string
          dataDesignacao: string
        }>
      }
      fornecedor: {
        razaoSocial: string
        nomeFantasia?: string
        cnpj: string
        contatos: Array<{
          tipo: 'email' | 'celular' | 'telefone'
          valor: string
          principal?: boolean
        }>
        inscricaoEstadual?: string
        inscricaoMunicipal?: string
        endereco: {
          cep: string
          logradouro: string
          numero?: string
          complemento?: string
          bairro: string
          cidade: string
          uf: string
        }
      }
      unidades: {
        demandante: string
        gestora: string
        vinculadas: Array<{
          nome: string
          percentualValor: number
          valorTotalMensal: number
        }>
      }
      alteracoes: Array<{
        id: string
        tipo:
          | 'criacao'
          | 'designacao_fiscais'
          | 'primeiro_pagamento'
          | 'atualizacao_documentos'
          | 'alteracao_valor'
          | 'prorrogacao'
        descricao: string
        dataHora: string
        responsavel: string
        detalhes?: unknown
      }>
      indicadores: {
        saldoAtual: number
        percentualExecutado: number
        cronogramaVigencia: Array<{
          inicio: string
          fim: string
          descricao: string
          status: 'concluido' | 'em_andamento' | 'pendente'
        }>
      }
    }
    unidades: string[]
    empresas: {
      pagina: number
      tamanhoPagina: number
      totalItens: number
      totalPaginas: number
      itens: Array<{
        id: string
        cnpj: string
        razaoSocial: string
        nomeFantasia: string
        inscricaoEstadual: string
        inscricaoMunicipal: string
        endereco: string
        bairro: string
        cidade: string
        estado: string
        cep: string
        ativo: boolean
        contatos: Array<{
          id: string
          nome: string
          valor: string
          tipo: string
          ativo: boolean
        }>
      }>
    }
  }
  export default value
}
