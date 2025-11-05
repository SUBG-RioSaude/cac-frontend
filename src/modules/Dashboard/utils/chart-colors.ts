/**
 * Configuração da paleta de cores temáticas para o Dashboard
 *
 * Cores acordadas com o cliente:
 * - Primary: #2a688f (Azul escuro profissional)
 * - Secondary: #42b9eb (Azul claro vibrante)
 * - Neutrals: oklch para consistência com sistema de design
 */

export const THEME_COLORS = {
  // Cores Primárias
  primary: '#2a688f',
  secondary: '#42b9eb',
  neutralDark: 'oklch(0.404 0.017 264.376)',
  neutralLight: 'oklch(0.709 0.142 213.68)',

  // Variações para UI
  accent: {
    primary: '#42b9eb',
    hover: '#2a688f',
    light: '#5ac8fa',
    dark: '#1c4f6a',
  },

  // Gradientes
  gradient: {
    start: '#2a688f',
    end: '#42b9eb',
  },
} as const

/**
 * Paleta de cores para gráficos (Recharts)
 * Ordem: Azul escuro → Azul claro → Azul médio → Azul navy → Azul sky
 */
export const CHART_COLORS = {
  chart1: '#2a688f', // Azul escuro (primary)
  chart2: '#42b9eb', // Azul claro (secondary)
  chart3: '#5ac8fa', // Azul médio
  chart4: '#1c4f6a', // Azul navy
  chart5: '#7dd3fc', // Azul sky
} as const

/**
 * Array de cores para iteração em gráficos
 */
export const CHART_COLORS_ARRAY = Object.values(CHART_COLORS)

/**
 * Mapa de cores por status de contrato
 * Mantém consistência com StatusBadge do sistema
 */
export const STATUS_COLORS = {
  ativo: CHART_COLORS.chart2, // #42b9eb
  vencendo: '#f59e0b', // Amber (alerta)
  vencido: '#ef4444', // Red (erro)
  suspenso: '#6b7280', // Gray (inativo)
  encerrado: '#9ca3af', // Gray light
  indefinido: '#d1d5db', // Gray lighter
} as const

/**
 * Mapa de cores por nível de risco
 */
export const RISK_COLORS = {
  alto: '#ef4444', // Red
  medio: '#f59e0b', // Amber
  baixo: '#10b981', // Green
} as const

/**
 * Configuração de gráficos para ChartContainer (shadcn/ui)
 *
 * Uso:
 * <ChartContainer config={CHART_CONFIG}>
 *   <AreaChart data={data}>...</AreaChart>
 * </ChartContainer>
 */
export const CHART_CONFIG = {
  ativos: {
    label: 'Ativos',
    color: CHART_COLORS.chart2,
  },
  pendentes: {
    label: 'Pendentes',
    color: STATUS_COLORS.vencendo,
  },
  encerrados: {
    label: 'Encerrados',
    color: STATUS_COLORS.encerrado,
  },
  suspensos: {
    label: 'Suspensos',
    color: STATUS_COLORS.suspenso,
  },
  vencidos: {
    label: 'Vencidos',
    color: STATUS_COLORS.vencido,
  },
  totalContratos: {
    label: 'Total de Contratos',
    color: CHART_COLORS.chart1,
  },
  valorTotal: {
    label: 'Valor Total',
    color: CHART_COLORS.chart2,
  },
  contratosVencendo: {
    label: 'Contratos Vencendo',
    color: STATUS_COLORS.vencendo,
  },
} as const

/**
 * Configuração de gradientes para gráficos de área
 *
 * Uso em AreaChart:
 * <defs>
 *   <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
 *     <stop offset="0%" stopColor={GRADIENT_CONFIG.start} stopOpacity={0.8}/>
 *     <stop offset="100%" stopColor={GRADIENT_CONFIG.end} stopOpacity={0.1}/>
 *   </linearGradient>
 * </defs>
 * <Area fill="url(#colorGradient)" />
 */
export const GRADIENT_CONFIG = {
  start: THEME_COLORS.gradient.start,
  end: THEME_COLORS.gradient.end,
  startOpacity: 0.8,
  endOpacity: 0.1,
} as const

/**
 * Helper: Obtém cor baseada em porcentagem (0-100)
 * Verde → Amarelo → Vermelho
 */
export const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return RISK_COLORS.baixo // Verde
  if (percentage >= 50) return RISK_COLORS.medio // Amarelo
  return RISK_COLORS.alto // Vermelho
}

/**
 * Helper: Obtém cor baseada em tendência
 */
export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return RISK_COLORS.baixo // Verde (positivo)
    case 'down':
      return RISK_COLORS.alto // Vermelho (negativo)
    case 'stable':
      return CHART_COLORS.chart4 // Azul neutro
  }
}

/**
 * Helper: Aplica opacidade a uma cor hex
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Helper: Obtém cor de status de contrato
 */
export const getStatusColor = (
  status: keyof typeof STATUS_COLORS,
): string => {
  return STATUS_COLORS[status] ?? STATUS_COLORS.indefinido
}

/**
 * Helper: Obtém cor de risco
 */
export const getRiskColor = (risk: keyof typeof RISK_COLORS): string => {
  return RISK_COLORS[risk]
}

/**
 * Tipagem para uso em componentes
 */
export type ThemeColor = keyof typeof THEME_COLORS
export type ChartColor = keyof typeof CHART_COLORS
export type StatusColor = keyof typeof STATUS_COLORS
export type RiskColor = keyof typeof RISK_COLORS
