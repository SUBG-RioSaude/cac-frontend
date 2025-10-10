import type { TimelineEntry } from '@/modules/Contratos/types/timeline'

export const TIMELINE_ENTRIES_MOCK: TimelineEntry[] = [
  {
    id: '1',
    contratoId: 'CONTR001',
    tipo: 'alteracao_contratual',
    categoria: 'alteracao',
    titulo: 'Aditivo de Valor - Acréscimo de 15%',
    descricao:
      'Aprovado acréscimo de 15% no valor original do contrato devido à necessidade de serviços adicionais de manutenção preventiva no sistema de climatização.',
    dataEvento: '2024-08-15T10:30:00Z',
    autor: {
      id: '101',
      nome: 'Maria Santos',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612-0000-a76c-3db3?w=32&h=32&fit=crop&crop=face',
      tipo: 'gestor',
    },
    status: 'ativo',
    prioridade: 'alta',
    alteracaoContratual: {
      alteracaoId: 'ADD_001',
      tipoAditivo: 'Acréscimo de Valor',
      valorOriginal: 150000.0,
      valorNovo: 172500.0,
      diferenca: 22500.0,
      percentualDiferenca: 15.0,
      novaVigencia: '2025-12-31',
      statusAlteracao: 'aprovada',
    },
    tags: ['valor', 'aprovado', 'manutenção'],
    criadoEm: '2024-08-15T10:30:00Z',
    atualizadoEm: '2024-08-15T14:20:00Z',
  },
  {
    id: '2',
    contratoId: 'CONTR001',
    tipo: 'marco_sistema',
    categoria: 'milestone',
    titulo: 'Início da Vigência do Contrato',
    descricao:
      'Marco automático registrando o início oficial da vigência contratual conforme assinatura das partes.',
    dataEvento: '2024-01-15T08:00:00Z',
    autor: {
      id: 'SYSTEM',
      nome: 'Sistema CAC',
      tipo: 'sistema',
    },
    status: 'ativo',
    prioridade: 'media',
    milestone: {
      etapa: 'Início de Vigência',
      concluido: true,
      percentualCompleto: 100,
    },
    tags: ['marco', 'vigência', 'início'],
    criadoEm: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    contratoId: 'CONTR001',
    tipo: 'manual',
    categoria: 'observacao',
    titulo: 'Reunião de Alinhamento com Fornecedor',
    descricao:
      'Realizada reunião presencial para alinhamento de expectativas e esclarecimento de dúvidas sobre o escopo dos serviços. Participaram: equipe técnica, gestor do contrato e representantes do fornecedor.',
    dataEvento: '2024-07-22T14:00:00Z',
    autor: {
      id: '102',
      nome: 'João Silva',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      tipo: 'fiscal',
    },
    status: 'ativo',
    prioridade: 'media',
    tags: ['reunião', 'alinhamento', 'fornecedor'],
    criadoEm: '2024-07-22T16:30:00Z',
  },
  {
    id: '4',
    contratoId: 'CONTR001',
    tipo: 'alteracao_contratual',
    categoria: 'alteracao',
    titulo: 'Prorrogação de Prazo - 6 meses',
    descricao:
      'Solicitada e aprovada prorrogação de 6 meses no prazo de vigência devido a atrasos na liberação de áreas para execução dos serviços.',
    dataEvento: '2024-06-10T09:15:00Z',
    autor: {
      id: '103',
      nome: 'Ana Costa',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      tipo: 'gestor',
    },
    status: 'ativo',
    prioridade: 'alta',
    alteracaoContratual: {
      alteracaoId: 'PROR_001',
      tipoAditivo: 'Prorrogação de Prazo',
      valorOriginal: 150000.0,
      valorNovo: 150000.0,
      diferenca: 0,
      percentualDiferenca: 0,
      novaVigencia: '2024-12-31',
      statusAlteracao: 'aprovada',
    },
    tags: ['prazo', 'prorrogação', 'aprovado'],
    criadoEm: '2024-06-10T09:15:00Z',
  },
  {
    id: '5',
    contratoId: 'CONTR001',
    tipo: 'manual',
    categoria: 'documento',
    titulo: 'Anexo: Relatório de Medição Mensal',
    descricao:
      'Adicionado relatório detalhado de medição dos serviços executados no mês de julho/2024, incluindo fotos e planilhas de acompanhamento.',
    dataEvento: '2024-08-01T11:45:00Z',
    autor: {
      id: '104',
      nome: 'Pedro Oliveira',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      tipo: 'fiscal',
    },
    status: 'ativo',
    prioridade: 'baixa',
    anexos: [
      {
        id: 'DOC_001',
        nome: 'medicao_julho_2024.pdf',
        tipo: 'application/pdf',
        tamanho: 2457600,
        url: '/anexos/medicao_julho_2024.pdf',
      },
    ],
    tags: ['documento', 'medição', 'julho'],
    criadoEm: '2024-08-01T11:45:00Z',
  },
  {
    id: '6',
    contratoId: 'CONTR001',
    tipo: 'manual',
    categoria: 'prazo',
    titulo: 'Vencimento: Entrega do Relatório Trimestral',
    descricao:
      'Lembrete: O fornecedor deve entregar o relatório trimestral de desempenho até o dia 30/09/2024, conforme cláusula 15.3 do contrato.',
    dataEvento: '2024-09-30T23:59:00Z',
    autor: {
      id: '102',
      nome: 'João Silva',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      tipo: 'fiscal',
    },
    status: 'ativo',
    prioridade: 'media',
    milestone: {
      etapa: 'Entrega Relatório Trimestral',
      dataLimite: '2024-09-30T23:59:00Z',
      concluido: false,
      percentualCompleto: 0,
    },
    tags: ['prazo', 'relatório', 'trimestral'],
    criadoEm: '2024-08-20T10:00:00Z',
  },
  {
    id: '7',
    contratoId: 'CONTR001',
    tipo: 'manual',
    categoria: 'observacao',
    titulo: 'Não Conformidade: Atraso na Manutenção Preventiva',
    descricao:
      'Identificada não conformidade relacionada ao atraso de 3 dias na execução da manutenção preventiva do sistema de ar condicionado. Fornecedor foi notificado e apresentou justificativa.',
    dataEvento: '2024-07-05T13:20:00Z',
    autor: {
      id: '104',
      nome: 'Pedro Oliveira',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      tipo: 'fiscal',
    },
    status: 'ativo',
    prioridade: 'alta',
    tags: ['não conformidade', 'atraso', 'manutenção'],
    criadoEm: '2024-07-05T13:20:00Z',
  },
  {
    id: '8',
    contratoId: 'CONTR001',
    tipo: 'marco_sistema',
    categoria: 'milestone',
    titulo: '50% do Prazo de Vigência Atingido',
    descricao:
      'Marco automático indicando que o contrato atingiu 50% do seu prazo total de vigência. Sugerida avaliação de desempenho para planejamento de renovação.',
    dataEvento: '2024-07-15T00:00:00Z',
    autor: {
      id: 'SYSTEM',
      nome: 'Sistema CAC',
      tipo: 'sistema',
    },
    status: 'ativo',
    prioridade: 'media',
    milestone: {
      etapa: '50% de Vigência',
      concluido: true,
      percentualCompleto: 50,
    },
    tags: ['marco', 'meio termo', 'avaliação'],
    criadoEm: '2024-07-15T00:00:00Z',
  },
  {
    id: '9',
    contratoId: 'CONTR001',
    tipo: 'manual',
    categoria: 'observacao',
    titulo: 'Avaliação Positiva de Desempenho',
    descricao:
      'Realizada avaliação semestral do desempenho do fornecedor. Resultado: SATISFATÓRIO (8.5/10). Destaques: pontualidade, qualidade técnica e relacionamento. Pontos de melhoria: comunicação proativa.',
    dataEvento: '2024-07-30T16:00:00Z',
    autor: {
      id: '101',
      nome: 'Maria Santos',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612-0000-a76c-3db3?w=32&h=32&fit=crop&crop=face',
      tipo: 'gestor',
    },
    status: 'ativo',
    prioridade: 'media',
    tags: ['avaliação', 'desempenho', 'satisfatório'],
    criadoEm: '2024-07-30T16:30:00Z',
  },
  {
    id: '10',
    contratoId: 'CONTR001',
    tipo: 'alteracao_contratual',
    categoria: 'alteracao',
    titulo: '[RASCUNHO] Proposta de Acréscimo de Serviços',
    descricao:
      'Em análise: proposta de inclusão de serviços de jardinagem nas áreas externas. Valor estimado: R$ 12.000,00 adicionais. Aguardando aprovação da diretoria.',
    dataEvento: '2024-08-18T09:00:00Z',
    autor: {
      id: '102',
      nome: 'João Silva',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      tipo: 'fiscal',
    },
    status: 'ativo',
    prioridade: 'media',
    alteracaoContratual: {
      alteracaoId: 'PROP_001',
      tipoAditivo: 'Acréscimo de Serviços',
      valorOriginal: 172500.0,
      valorNovo: 184500.0,
      diferenca: 12000.0,
      percentualDiferenca: 6.96,
      novaVigencia: '2025-12-31',
      statusAlteracao: 'rascunho',
    },
    tags: ['rascunho', 'jardinagem', 'análise'],
    criadoEm: '2024-08-18T09:00:00Z',
  },
]

// Estatísticas derivadas dos dados mock
export const TIMELINE_STATS_MOCK = {
  totalEntradas: TIMELINE_ENTRIES_MOCK.length,
  alteracoesContratuais: TIMELINE_ENTRIES_MOCK.filter(
    (e) => e.tipo === 'alteracao_contratual',
  ).length,
  observacoes: TIMELINE_ENTRIES_MOCK.filter((e) => e.categoria === 'observacao')
    .length,
  milestones: TIMELINE_ENTRIES_MOCK.filter((e) => e.categoria === 'milestone')
    .length,
  entradasRecentes: TIMELINE_ENTRIES_MOCK.filter((e) => {
    const dataEntrada = new Date(e.criadoEm)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
    return dataEntrada >= trintaDiasAtras
  }).length,
  proximosPrazos: TIMELINE_ENTRIES_MOCK.filter(
    (e) =>
      e.milestone?.dataLimite &&
      !e.milestone.concluido &&
      new Date(e.milestone.dataLimite) > new Date(),
  ).sort(
    (a, b) =>
      new Date(a.milestone!.dataLimite!).getTime() -
      new Date(b.milestone!.dataLimite!).getTime(),
  ),
}
