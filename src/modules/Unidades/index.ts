/**
 * ==========================================
 * EXPORTAÇÕES DO MÓDULO UNIDADES
 * ==========================================
 * Barrel export principal do módulo
 */

// Sub-módulo ListaUnidades
export * from './ListaUnidades'

// Sub-módulo UnidadeDetalhes
export * from './UnidadeDetalhes'

// Sub-módulo VisualizacaoUnidade
export * from './VisualizacaoUnidade'

// Hooks globais
export * from './hooks/use-unidade-detalhada'

// Services globais
export * from './services/unidades-service'

// Página principal (renomeada para evitar conflito)
export { UnidadeDetalhesPage as UnidadeDetalhesMainPage } from './pages/unidade-detalhes-page'
