import type { Contrato } from '@/modules/types/contrato'

export const contratosMock: Contrato[] = [
  {
    id: '1',
    numeroContrato: 'CONT-2023/0042',
    numeroCCon: 'CCON-2023/001',
    contratada: {
      razaoSocial: 'Construtora ABC Ltda',
      cnpj: '12.345.678/0001-90'
    },
    valor: 1250000.00,
    dataInicial: '2023-05-12',
    dataFinal: '2024-05-11',
    status: 'vencendo',
    unidade: 'Secretaria de Obras',
    objeto: 'Manutenção predial'
  },
  {
    id: '2',
    numeroContrato: 'CONT-2023/0041',
    numeroCCon: 'CCON-2023/002',
    contratada: {
      razaoSocial: 'Tech Solutions S.A.',
      cnpj: '98.765.432/0001-10'
    },
    valor: 850000.00,
    dataInicial: '2023-04-01',
    dataFinal: '2024-03-31',
    status: 'ativo',
    unidade: 'Secretaria de TI',
    objeto: 'Serviços de TI'
  },
  {
    id: '3',
    numeroContrato: 'CONT-2023/0040',
    numeroCCon: 'CCON-2023/003',
    contratada: {
      razaoSocial: 'Distribuidora XYZ Ltda',
      cnpj: '45.678.901/0001-23'
    },
    valor: 320000.00,
    dataInicial: '2023-03-15',
    dataFinal: '2024-03-14',
    status: 'ativo',
    unidade: 'Secretaria de Saúde',
    objeto: 'Fornecimento de materiais'
  },
  {
    id: '4',
    numeroContrato: 'CONT-2023/0039',
    numeroCCon: 'CCON-2023/004',
    contratada: {
      razaoSocial: 'Escritório Jurídico Associados',
      cnpj: '56.789.012/0001-34'
    },
    valor: 480000.00,
    dataInicial: '2023-02-01',
    dataFinal: '2024-01-31',
    status: 'ativo',
    unidade: 'Procuradoria Geral',
    objeto: 'Consultoria jurídica'
  },
  {
    id: '5',
    numeroContrato: 'CONT-2023/0038',
    numeroCCon: 'CCON-2023/005',
    contratada: {
      razaoSocial: 'Clean Services Ltda',
      cnpj: '67.890.123/0001-45'
    },
    valor: 720000.00,
    dataInicial: '2023-01-10',
    dataFinal: '2024-01-09',
    status: 'vencendo',
    unidade: 'Secretaria de Administração',
    objeto: 'Serviços de limpeza'
  },
  {
    id: '6',
    numeroContrato: 'CONT-2022/0156',
    numeroCCon: 'CCON-2022/045',
    contratada: {
      razaoSocial: 'Empresa de Segurança Total',
      cnpj: '11.222.333/0001-44'
    },
    valor: 960000.00,
    dataInicial: '2022-12-01',
    dataFinal: '2023-11-30',
    status: 'vencido',
    unidade: 'Secretaria de Segurança',
    objeto: 'Serviços de segurança'
  },
  {
    id: '7',
    numeroContrato: 'CONT-2024/0001',
    numeroCCon: 'CCON-2024/001',
    contratada: {
      razaoSocial: 'Transportadora Rápida Ltda',
      cnpj: '22.333.444/0001-55'
    },
    valor: 540000.00,
    dataInicial: '2024-01-15',
    dataFinal: '2024-12-31',
    status: 'ativo',
    unidade: 'Secretaria de Transporte',
    objeto: 'Serviços de transporte'
  },
  {
    id: '8',
    numeroContrato: 'CONT-2024/0002',
    numeroCCon: 'CCON-2024/002',
    contratada: {
      razaoSocial: 'Fornecedora de Equipamentos SA',
      cnpj: '33.444.555/0001-66'
    },
    valor: 1800000.00,
    dataInicial: '2024-02-01',
    dataFinal: '2025-01-31',
    status: 'ativo',
    unidade: 'Secretaria de Educação',
    objeto: 'Fornecimento de equipamentos'
  }
]

export const unidadesMock = [
  'Secretaria de Obras',
  'Secretaria de TI',
  'Secretaria de Saúde',
  'Procuradoria Geral',
  'Secretaria de Administração',
  'Secretaria de Segurança',
  'Secretaria de Transporte',
  'Secretaria de Educação'
]
