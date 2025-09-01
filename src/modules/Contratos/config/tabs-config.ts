/**
 * Configuração das Abas da Visualização de Contratos
 * Sistema de flags para controlar quais abas são exibidas
 */

export interface TabConfig {
  id: string
  label: string
  enabled: boolean
  icon: {
    color: string
    bgColor: string
    activeBorder: string
    activeText: string
    activeBg: string
  }
  description?: string
}

export const TABS_CONFIG: Record<string, TabConfig> = {
  detalhes: {
    id: 'detalhes',
    label: 'Detalhes do Contrato',
    enabled: true, // Sempre ativa - informações básicas
    icon: {
      color: 'bg-blue-500',
      bgColor: 'data-[state=active]:bg-blue-700',
      activeBorder: 'data-[state=active]:border-blue-200',
      activeText: 'data-[state=active]:text-blue-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Informações básicas do contrato'
  },
  
  alteracoes: {
    id: 'alteracoes', 
    label: 'Registro de Alterações',
    enabled: false, // DESABILITADA - será implementada em versão futura
    icon: {
      color: 'bg-orange-500',
      bgColor: 'data-[state=active]:bg-orange-700',
      activeBorder: 'data-[state=active]:border-orange-200',
      activeText: 'data-[state=active]:text-orange-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Histórico de alterações do contrato'
  },

  'alteracoes-contratuais': {
    id: 'alteracoes-contratuais',
    label: 'Alterações Contratuais', 
    enabled: true, // ATIVA - funcionalidade principal
    icon: {
      color: 'bg-purple-500',
      bgColor: 'data-[state=active]:bg-purple-700',
      activeBorder: 'data-[state=active]:border-purple-200',
      activeText: 'data-[state=active]:text-purple-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Gestão de aditivos e alterações contratuais'
  },

  indicadores: {
    id: 'indicadores',
    label: 'Indicadores e Relatórios',
    enabled: true, // ATIVA - dashboard e métricas
    icon: {
      color: 'bg-green-500', 
      bgColor: 'data-[state=active]:bg-green-700',
      activeBorder: 'data-[state=active]:border-green-200',
      activeText: 'data-[state=active]:text-green-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Métricas, indicadores e relatórios do contrato'
  },

  documentos: {
    id: 'documentos',
    label: 'Documentos',
    enabled: true, // ATIVA - nossa feature recém implementada
    icon: {
      color: 'bg-teal-500',
      bgColor: 'data-[state=active]:bg-teal-700', 
      activeBorder: 'data-[state=active]:border-teal-200',
      activeText: 'data-[state=active]:text-teal-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Checklist de documentos obrigatórios'
  },

  empenhos: {
    id: 'empenhos',
    label: 'Empenhos',
    enabled: true, // ATIVA - nova funcionalidade implementada
    icon: {
      color: 'bg-emerald-500',
      bgColor: 'data-[state=active]:bg-emerald-700',
      activeBorder: 'data-[state=active]:border-emerald-200',
      activeText: 'data-[state=active]:text-emerald-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Registro e gestão de empenhos do contrato'
  },

  timeline: {
    id: 'timeline',
    label: 'Chat',
    enabled: false, // DESABILITADA - será implementada em versão futura
    icon: {
      color: 'bg-blue-500',
      bgColor: 'data-[state=active]:bg-blue-700',
      activeBorder: 'data-[state=active]:border-blue-200', 
      activeText: 'data-[state=active]:text-blue-700',
      activeBg: 'data-[state=active]:bg-white'
    },
    description: 'Sistema de chat e comunicação'
  }
}

/**
 * Retorna apenas as abas que estão habilitadas
 */
export function getActiveTabs(): TabConfig[] {
  return Object.values(TABS_CONFIG).filter(tab => tab.enabled)
}

/**
 * Retorna a primeira aba ativa (aba padrão)
 */
export function getDefaultTab(): string {
  const activeTabs = getActiveTabs()
  return activeTabs.length > 0 ? activeTabs[0].id : 'detalhes'
}

/**
 * Verifica se uma aba está habilitada
 */
export function isTabEnabled(tabId: string): boolean {
  return TABS_CONFIG[tabId]?.enabled ?? false
}

/**
 * Retorna o número de colunas do grid baseado nas abas ativas
 */
export function getGridCols(): number {
  return getActiveTabs().length
}