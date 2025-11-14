/**
 * ==========================================
 * MOCKS DO DASHBOARD
 * ==========================================
 * Dados simulados para desenvolvimento e testes do dashboard
 */

import type {
  DashboardData,
  DashboardMetrics,
  StatusDistributionData,
  StatusTrendData,
  TypeDistributionData,
  RecentContract,
  DashboardActivity,
  DashboardRisks,
} from '../types/dashboard'

// ========== MÉTRICAS ==========

export const dashboardMetricsMock: DashboardMetrics = {
  totalContratos: {
    atual: 1284,
    anterior: 1142,
    percentual: 12.4,
    tendencia: 'up',
  },
  contratosAtivos: {
    atual: 892,
    anterior: 825,
    percentual: 8.1,
    tendencia: 'up',
  },
  contratosVencendo: {
    atual: 47,
    anterior: 55,
    percentual: -14.5,
    tendencia: 'down',
  },
  valorTotal: {
    atual: 24800000, // R$ 24,8M
    anterior: 20900000, // R$ 20,9M
    percentual: 18.7,
    tendencia: 'up',
  },
}

// ========== DISTRIBUIÇÃO DE STATUS ==========

export const statusDistributionMock: StatusDistributionData[] = [
  {
    name: 'Ativo',
    value: 892,
    color: 'hsl(var(--chart-1))',
    percentage: 69.5,
  },
  {
    name: 'Pendente',
    value: 156,
    color: 'hsl(var(--chart-2))',
    percentage: 12.1,
  },
  {
    name: 'Vencido',
    value: 47,
    color: 'hsl(var(--chart-3))',
    percentage: 3.7,
  },
  {
    name: 'Suspenso',
    value: 23,
    color: 'hsl(var(--chart-4))',
    percentage: 1.8,
  },
  {
    name: 'Encerrado',
    value: 166,
    color: 'hsl(var(--chart-5))',
    percentage: 12.9,
  },
]

// ========== EVOLUÇÃO DE STATUS ==========

export const statusTrendMock: StatusTrendData[] = [
  { mes: 'Jan', ativos: 785, pendentes: 142, encerrados: 98, suspensos: 15 },
  { mes: 'Fev', ativos: 798, pendentes: 138, encerrados: 105, suspensos: 18 },
  { mes: 'Mar', ativos: 812, pendentes: 145, encerrados: 112, suspensos: 16 },
  { mes: 'Abr', ativos: 825, pendentes: 151, encerrados: 118, suspensos: 19 },
  { mes: 'Mai', ativos: 838, pendentes: 148, encerrados: 125, suspensos: 17 },
  { mes: 'Jun', ativos: 851, pendentes: 155, encerrados: 132, suspensos: 20 },
  { mes: 'Jul', ativos: 865, pendentes: 152, encerrados: 138, suspensos: 21 },
  { mes: 'Ago', ativos: 878, pendentes: 158, encerrados: 145, suspensos: 22 },
  { mes: 'Set', ativos: 885, pendentes: 154, encerrados: 152, suspensos: 24 },
  { mes: 'Out', ativos: 892, pendentes: 156, encerrados: 166, suspensos: 23 },
]

// ========== DISTRIBUIÇÃO POR TIPO ==========

export const typeDistributionMock: TypeDistributionData[] = [
  {
    tipo: 'Serviços',
    quantidade: 487,
    percentual: 37.9,
    valor: 9400000, // R$ 9,4M
  },
  {
    tipo: 'Fornecimento',
    quantidade: 358,
    percentual: 27.9,
    valor: 7200000, // R$ 7,2M
  },
  {
    tipo: 'Obras',
    quantidade: 201,
    percentual: 15.7,
    valor: 5800000, // R$ 5,8M
  },
  {
    tipo: 'Locação',
    quantidade: 156,
    percentual: 12.1,
    valor: 1600000, // R$ 1,6M
  },
  {
    tipo: 'Concessão',
    quantidade: 82,
    percentual: 6.4,
    valor: 800000, // R$ 800k
  },
]

// ========== CONTRATOS RECENTES ==========

export const recentContractsMock: RecentContract[] = [
  {
    id: '01992e74-b75f-73c8-817e-27ffead2e12f',
    numero: 'CT-2024-1284',
    objeto: 'Contrato de Serviços de TI - Manutenção de Infraestrutura',
    valor: 125000,
    vigencia: {
      inicio: '2024-12-15',
      fim: '2025-12-14',
    },
    status: 'ativo',
    fornecedor: 'Tech Solutions Ltda',
    dataFormalizacao: '2024-12-15T10:30:00Z',
  },
  {
    id: '01992e74-b75f-73c8-817e-27ffead2e13f',
    numero: 'CT-2024-1283',
    objeto: 'Fornecimento de Equipamentos de Informática',
    valor: 89500,
    vigencia: {
      inicio: '2024-12-14',
      fim: '2025-06-13',
    },
    status: 'ativo',
    fornecedor: 'Equipamentos Pro S.A.',
    dataFormalizacao: '2024-12-14T14:20:00Z',
  },
  {
    id: '01992e74-b75f-73c8-817e-27ffead2e14f',
    numero: 'CT-2024-1282',
    objeto: 'Consultoria Empresarial - Gestão de Processos',
    valor: 45000,
    vigencia: {
      inicio: '2024-12-13',
      fim: '2025-03-12',
    },
    status: 'em_aprovacao',
    fornecedor: 'Consultores Associados',
    dataFormalizacao: '2024-12-13T09:15:00Z',
  },
  {
    id: '01992e74-b75f-73c8-817e-27ffead2e15f',
    numero: 'CT-2024-1281',
    objeto: 'Locação de Imóvel Comercial - Sede Regional',
    valor: 12000,
    vigencia: {
      inicio: '2024-12-12',
      fim: '2025-12-11',
    },
    status: 'ativo',
    fornecedor: 'Imobiliária Central',
    dataFormalizacao: '2024-12-12T16:45:00Z',
  },
  {
    id: '01992e74-b75f-73c8-817e-27ffead2e16f',
    numero: 'CT-2024-1280',
    objeto: 'Manutenção Predial - Conservação de Edifícios',
    valor: 28750,
    vigencia: {
      inicio: '2024-12-11',
      fim: '2025-06-10',
    },
    status: 'ativo',
    fornecedor: 'Manutenções Express',
    dataFormalizacao: '2024-12-11T11:00:00Z',
  },
]

// ========== ATIVIDADES RECENTES ==========

export const recentActivitiesMock: DashboardActivity[] = [
  {
    id: '1',
    tipo: 'cadastrado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e12f',
    contratoNumero: 'CT-2024-1284',
    titulo: 'Contrato Cadastrado',
    descricao: 'Novo contrato de Serviços de TI cadastrado no sistema',
    dataHora: '2024-12-15T10:30:00Z',
    usuario: 'Maria Silva',
  },
  {
    id: '2',
    tipo: 'aprovado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e13f',
    contratoNumero: 'CT-2024-1283',
    titulo: 'Contrato Aprovado',
    descricao: 'Contrato de Fornecimento de Equipamentos aprovado pela gestão',
    dataHora: '2024-12-14T16:45:00Z',
    usuario: 'João Santos',
  },
  {
    id: '3',
    tipo: 'atualizado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e14f',
    contratoNumero: 'CT-2024-1282',
    titulo: 'Contrato Atualizado',
    descricao: 'Dados do contrato de Consultoria Empresarial atualizados',
    dataHora: '2024-12-14T14:20:00Z',
    usuario: 'Ana Costa',
  },
  {
    id: '4',
    tipo: 'renovado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e15f',
    contratoNumero: 'CT-2024-0745',
    titulo: 'Contrato Renovado',
    descricao: 'Contrato de Locação renovado por mais 12 meses',
    dataHora: '2024-12-13T11:30:00Z',
    usuario: 'Pedro Almeida',
  },
  {
    id: '5',
    tipo: 'atualizado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e16f',
    contratoNumero: 'CT-2024-1280',
    titulo: 'Contrato Atualizado',
    descricao: 'Alteração contratual de Manutenção Predial registrada',
    dataHora: '2024-12-12T09:15:00Z',
    usuario: 'Carlos Oliveira',
  },
  {
    id: '6',
    tipo: 'aprovado',
    contratoId: '01992e74-b75f-73c8-817e-27ffead2e17f',
    contratoNumero: 'CT-2024-1279',
    titulo: 'Contrato Aprovado',
    descricao: 'Aditivo contratual de Serviços de Limpeza aprovado',
    dataHora: '2024-12-11T15:00:00Z',
    usuario: 'Fernanda Lima',
  },
]

// ========== ANÁLISE DE RISCOS ==========

export const dashboardRisksMock: DashboardRisks = {
  alto: {
    level: 'alto',
    count: 3,
    description: 'Contratos com vencimento em menos de 30 dias',
    contratos: [
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e20f',
        numero: 'CT-2024-0892',
        objeto: 'Contrato de Manutenção Predial',
        risco: 'alto',
        motivos: ['Vencimento iminente', 'Renovação pendente'],
        diasVencimento: 15,
        valorRisco: 45000,
      },
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e21f',
        numero: 'CT-2024-0745',
        objeto: 'Fornecimento de Materiais de Construção',
        risco: 'alto',
        motivos: ['Vencimento próximo', 'Processo de renovação não iniciado'],
        diasVencimento: 22,
        valorRisco: 78500,
      },
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e22f',
        numero: 'CT-2024-0623',
        objeto: 'Serviços de Limpeza e Conservação',
        risco: 'alto',
        motivos: ['Vencendo em 28 dias', 'Pendências documentais'],
        diasVencimento: 28,
        valorRisco: 12000,
      },
    ],
  },
  medio: {
    level: 'medio',
    count: 3,
    description: 'Contratos com vencimento entre 30 e 90 dias',
    contratos: [
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e23f',
        numero: 'CT-2024-0512',
        objeto: 'Consultoria Jurídica Especializada',
        risco: 'medio',
        motivos: ['Vencimento em 45 dias', 'Análise de renovação pendente'],
        diasVencimento: 45,
        valorRisco: 95000,
      },
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e24f',
        numero: 'CT-2024-0489',
        objeto: 'Locação de Equipamentos Médicos',
        risco: 'medio',
        motivos: ['Vencimento em 67 dias'],
        diasVencimento: 67,
        valorRisco: 34200,
      },
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e25f',
        numero: 'CT-2024-0401',
        objeto: 'Serviços de TI - Suporte Técnico',
        risco: 'medio',
        motivos: ['Vencimento em 82 dias', 'Avaliação de desempenho pendente'],
        diasVencimento: 82,
        valorRisco: 156000,
      },
    ],
  },
  baixo: {
    level: 'baixo',
    count: 2,
    description: 'Contratos com mais de 90 dias até o vencimento',
    contratos: [
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e26f',
        numero: 'CT-2024-0234',
        objeto: 'Fornecimento de Energia Elétrica',
        risco: 'baixo',
        motivos: ['Vencimento em 180 dias'],
        diasVencimento: 180,
        valorRisco: 245000,
      },
      {
        id: '01992e74-b75f-73c8-817e-27ffead2e27f',
        numero: 'CT-2024-0156',
        objeto: 'Seguro Empresarial Patrimonial',
        risco: 'baixo',
        motivos: ['Vencimento em 245 dias'],
        diasVencimento: 245,
        valorRisco: 89000,
      },
    ],
  },
  total: 8,
}

// ========== DADOS CONSOLIDADOS ==========

export const dashboardDataMock: DashboardData = {
  metrics: dashboardMetricsMock,
  statusDistribution: statusDistributionMock,
  statusTrend: statusTrendMock,
  typeDistribution: typeDistributionMock,
  recentContracts: recentContractsMock,
  recentActivities: recentActivitiesMock,
  riskAnalysis: dashboardRisksMock,
  lastUpdated: new Date().toISOString(),
}

// ========== HELPERS ==========

/**
 * Retorna dados do dashboard simulando delay de rede
 */
export const getDashboardDataMock = async (
  delay = 800,
): Promise<DashboardData> => {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return {
    ...dashboardDataMock,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Atualiza timestamp da última atualização
 */
export const refreshDashboardMock = (): DashboardData => ({
  ...dashboardDataMock,
  lastUpdated: new Date().toISOString(),
})
