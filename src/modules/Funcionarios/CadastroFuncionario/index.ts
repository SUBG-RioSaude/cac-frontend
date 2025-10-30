/**
 * ==========================================
 * EXPORTAÇÕES DO SUB-MÓDULO CADASTRO FUNCIONARIO
 * ==========================================
 * Barrel export para facilitar imports
 */

// Componentes
export { CadastroFuncionarioForm } from './components/cadastro-funcionario-form'
export { LotacaoSelect } from './components/lotacao-select'
export { ModalSucessoCadastro } from './components/modal-sucesso-cadastro'

// Página
export { default as CadastroFuncionarioPage } from './pages/cadastro-funcionario-page'

// Hooks
export { useValidarCpfUnico, useValidarMatriculaUnica } from './hooks/use-validar-funcionario'
