/**
 * ==========================================
 * MÓDULO FUNCIONÁRIOS - EXPORTS PRINCIPAIS
 * ==========================================
 * Exporta todas as funcionalidades do módulo de funcionários
 * para facilitar importação em outros módulos
 */

// Sub-módulo CadastroFuncionario
export * from './CadastroFuncionario'

// Tipos e interfaces
export type {
  FuncionarioApi,
  LotacaoApi,
  FuncionarioCreateApi,
  FuncionarioUpdateApi,
  Usuario,
  UsuarioAtribuido,
  FuncionarioParametros,
  LotacaoParametros,
  FuncionariosPaginacaoResponse,
  LotacoesPaginacaoResponse,
  BuscaFuncionarioResponse,
  BuscaLotacaoResponse,
  FiltrosFuncionarios,
  FiltrosLotacoes,
} from './types/funcionario-api'

// Enums
export {
  SituacaoFuncional,
  TipoVinculo,
  mapSituacaoToStatus,
  mapFuncionarioToUsuario,
} from './types/funcionario-api'

// Serviços
export {
  getFuncionarios,
  getFuncionarioById,
  getFuncionarioByMatricula,
  getFuncionarioByCpf,
  buscarFuncionariosPorNome,
  buscarFuncionariosPorLotacao,
  getLotacoes,
  getLotacaoById,
  getLotacaoByCodigo,
  buscarLotacoesPorNome,
} from './services/funcionarios-service'

// Hooks React Query
export {
  useGetFuncionarios,
  useGetFuncionarioById,
  useGetFuncionarioByMatricula,
  useGetFuncionarioByCpf,
  useBuscarFuncionariosPorNome,
  useBuscarFuncionariosPorLotacao,
  useGetFuncionariosAtivos,
  useGetLotacoes,
  useGetLotacaoById,
  useGetLotacaoByCodigo,
  useBuscarLotacoesPorNome,
  useGetLotacoesAtivas,
  useFuncionariosParaAtribuicao,
} from './hooks/use-funcionarios'

export { useCreateFuncionario } from './hooks/use-funcionarios-mutations'

// Query keys
export {
  funcionarioKeys,
  lotacaoKeys,
  type FuncionarioQueryKey,
  type LotacaoQueryKey,
} from './lib/query-keys'

// Utilitários
export {
  validarMatricula,
  validarFormatoCpf,
  isFuncionarioAtivo,
  podeSerFiscal,
  formatarMatricula,
  formatarNome,
  formatarCargo,
  situacaoParaStatus,
  mapearFuncionarioParaUsuario,
  mapearFuncionarioParaUsuarioAtribuido,
  mapearFuncionariosParaUsuarios,
  filtrarFuncionariosAtivos,
  filtrarFuncionariosParaFiscalizacao,
  buscarPorMatricula,
  buscarPorNome,
  filtrarPorLotacao,
  agruparPorLotacao,
  agruparPorSituacao,
  ordenarPorNome,
  ordenarPorMatricula,
  contarPorSituacao,
  calcularEstatisticas,
} from './utils/funcionario-utils'
