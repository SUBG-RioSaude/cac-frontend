import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato-detalhado'

export const contratoDetalhadoMock: ContratoDetalhado = {
  id: '1',
  numeroContrato: 'CONT-2023/0042',
  processoSEI: '23280.000123/2023-45',
  objeto: 'Contratação de empresa especializada para prestação de serviços de manutenção predial preventiva e corretiva dos prédios públicos municipais',
  tipoContratacao: 'centralizado',
  dataInicio: '2023-05-12',
  dataTermino: '2024-05-11',
  prazoInicialMeses: 12,
  status: 'ativo',
  valorTotal: 1250000.00,
  
  ccon: {
    numero: 'CCON-2023/001',
    dataInicio: '2023-05-12',
    dataTermino: '2024-05-11'
  },
  
  responsaveis: {
    fiscaisAdministrativos: [
      {
        id: '1',
        nome: 'Maria Silva Santos',
        email: 'maria.santos@prefeitura.gov.br',
        telefone: '(11) 98765-4321',
        cargo: 'Engenheira Civil',
        dataDesignacao: '2023-05-10'
      },
      {
        id: '2',
        nome: 'João Carlos Oliveira',
        email: 'joao.oliveira@prefeitura.gov.br',
        telefone: '(11) 97654-3210',
        cargo: 'Arquiteto',
        dataDesignacao: '2023-05-10'
      }
    ],
    gestores: [
      {
        id: '3',
        nome: 'Ana Paula Costa',
        email: 'ana.costa@prefeitura.gov.br',
        telefone: '(11) 96543-2109',
        cargo: 'Coordenadora de Contratos',
        dataDesignacao: '2023-05-08'
      }
    ]
  },
  
  fornecedor: {
    razaoSocial: 'Construtora ABC Ltda',
    nomeFantasia: 'ABC Construções',
    cnpj: '12.345.678/0001-90',
    contatos: [
      {
        tipo: 'email',
        valor: 'contato@abcconstrucoes.com.br',
        principal: true
      },
      {
        tipo: 'telefone',
        valor: '(11) 3456-7890'
      },
      {
        tipo: 'celular',
        valor: '(11) 99876-5432'
      }
    ],
    inscricaoEstadual: '123.456.789.012',
    inscricaoMunicipal: '987654321',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua das Construções',
      numero: '123',
      complemento: 'Sala 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP'
    }
  },
  
  unidades: {
    demandante: 'Secretaria de Obras',
    gestora: 'Secretaria de Administração',
    vinculadas: [
      {
        nome: 'Secretaria de Obras',
        percentualValor: 60,
        valorTotalMensal: 62500.00
      },
      {
        nome: 'Secretaria de Educação',
        percentualValor: 25,
        valorTotalMensal: 26041.67
      },
      {
        nome: 'Secretaria de Saúde',
        percentualValor: 15,
        valorTotalMensal: 15625.00
      }
    ]
  },
  
  alteracoes: [
    {
      id: '1',
      tipo: 'criacao',
      descricao: 'Contrato criado no sistema',
      dataHora: '2023-05-08T09:00:00',
      responsavel: 'Sistema Automático'
    },
    {
      id: '2',
      tipo: 'designacao_fiscais',
      descricao: 'Fiscais administrativos designados: Maria Silva Santos e João Carlos Oliveira',
      dataHora: '2023-05-10T14:30:00',
      responsavel: 'Ana Paula Costa'
    },
    {
      id: '3',
      tipo: 'primeiro_pagamento',
      descricao: 'Primeiro pagamento realizado no valor de R$ 104.166,67',
      dataHora: '2023-06-15T10:15:00',
      responsavel: 'Sistema Financeiro'
    },
    {
      id: '4',
      tipo: 'atualizacao_documentos',
      descricao: 'Documentos de regularidade fiscal atualizados',
      dataHora: '2023-08-22T16:45:00',
      responsavel: 'Maria Silva Santos'
    }
  ],
  
  indicadores: {
    saldoAtual: 687500.00,
    percentualExecutado: 45,
    cronogramaVigencia: [
      {
        inicio: '2023-05-12',
        fim: '2023-08-11',
        descricao: '1º Trimestre',
        status: 'concluido'
      },
      {
        inicio: '2023-08-12',
        fim: '2023-11-11',
        descricao: '2º Trimestre',
        status: 'concluido'
      },
      {
        inicio: '2023-11-12',
        fim: '2024-02-11',
        descricao: '3º Trimestre',
        status: 'em_andamento'
      },
      {
        inicio: '2024-02-12',
        fim: '2024-05-11',
        descricao: '4º Trimestre',
        status: 'pendente'
      }
    ]
  }
}
