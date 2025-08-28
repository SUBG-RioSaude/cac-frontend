/**
 * ==========================================
 * UTILITÁRIOS PARA FUNCIONÁRIOS
 * ==========================================
 * Funções auxiliares para validação, formatação
 * e manipulação de dados de funcionários
 */

import { 
  SituacaoFuncional
} from '@/modules/Funcionarios/types/funcionario-api'
import type { 
  FuncionarioApi, 
  Usuario, 
  UsuarioAtribuido
} from '@/modules/Funcionarios/types/funcionario-api'

// ========== VALIDAÇÕES ==========

/**
 * Valida se uma matrícula tem formato válido
 * Pode aceitar diferentes padrões dependendo da organização
 */
export function validarMatricula(matricula: string): boolean {
  if (!matricula || matricula.trim().length === 0) {
    return false
  }

  // Remove espaços em branco
  const matriculaLimpa = matricula.trim()

  // Verifica se tem entre 4 e 10 caracteres (alfanuméricos)
  const padraoMatricula = /^[A-Za-z0-9]{4,10}$/
  return padraoMatricula.test(matriculaLimpa)
}

/**
 * Valida se um CPF tem formato válido (simples)
 * Para validação completa, usar biblioteca especializada
 */
export function validarFormatoCpf(cpf: string): boolean {
  if (!cpf) return false
  
  // Remove pontos e hífens
  const cpfLimpo = cpf.replace(/[^\d]/g, '')
  
  // Verifica se tem 11 dígitos
  return cpfLimpo.length === 11
}

/**
 * Verifica se funcionário está ativo baseado em situação e flag
 */
export function isFuncionarioAtivo(funcionario: FuncionarioApi): boolean {
  return funcionario.ativo && 
         funcionario.situacaoFuncional !== SituacaoFuncional.INATIVO
}

/**
 * Verifica se funcionário pode ser atribuído como fiscal
 */
export function podeSerFiscal(funcionario: any): boolean {
  // Simplificado para contornar tipagem incorreta da API.
  // A query para /Funcionarios já inclui `ativo=true`.
  // Assumimos que a API já retorna apenas funcionários aptos.
  return funcionario.ativo === true;
}

// ========== FORMATAÇÃO ==========

/**
 * Formata matrícula para exibição
 */
export function formatarMatricula(matricula: string): string {
  if (!matricula) return ''
  
  // Se for numérica, pode adicionar zeros à esquerda
  if (/^\d+$/.test(matricula)) {
    return matricula.padStart(6, '0')
  }
  
  return matricula.toUpperCase()
}

/**
 * Formatar nome para exibição (primeira letra maiúscula)
 */
export function formatarNome(nome: string): string {
  if (!nome) return ''
  
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

/**
 * Formatar cargo para exibição
 */
export function formatarCargo(cargo: string): string {
  if (!cargo) return ''
  
  return cargo
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

// ========== CONVERSÕES E MAPEAMENTO ==========

/**
 * Converte SituacaoFuncional para status simples
 */
export function situacaoParaStatus(situacao: SituacaoFuncional, ativo: boolean): "ativo" | "inativo" {
  if (!ativo || situacao === SituacaoFuncional.INATIVO) {
    return "inativo"
  }
  
  // Situações que devem aparecer como inativo
  const situacoesInativas: string[] = [
    SituacaoFuncional.AFASTADO,
    SituacaoFuncional.LICENCA
  ]
  
  if (situacoesInativas.includes(situacao)) {
    return "inativo"
  }
  
  return "ativo"
}

/**
 * Converte FuncionarioApi para Usuario (compatibilidade com formulário atual)
 */
export function mapearFuncionarioParaUsuario(funcionario: FuncionarioApi): Usuario {
  return {
    id: funcionario.id,
    matricula: formatarMatricula(funcionario.matricula),
    nome: formatarNome(funcionario.nome),
    email: funcionario.email || '',
    cargo: formatarCargo(funcionario.cargo),
    departamento: funcionario.lotacao,
    telefone: funcionario.telefone || '',
    status: situacaoParaStatus(funcionario.situacaoFuncional, funcionario.ativo)
  }
}

/**
 * Converte FuncionarioApi para UsuarioAtribuido
 */
export function mapearFuncionarioParaUsuarioAtribuido(
  funcionario: FuncionarioApi, 
  tipo: "fiscal" | "gestor" | null = null
): UsuarioAtribuido {
  return {
    ...mapearFuncionarioParaUsuario(funcionario),
    tipo
  }
}

/**
 * Converte lista de FuncionarioApi para lista de Usuario
 */
export function mapearFuncionariosParaUsuarios(funcionarios: FuncionarioApi[]): Usuario[] {
  return funcionarios.map(mapearFuncionarioParaUsuario)
}

// ========== FILTROS E BUSCAS ==========

/**
 * Filtra funcionários ativos
 */
export function filtrarFuncionariosAtivos(funcionarios: FuncionarioApi[]): FuncionarioApi[] {
  return funcionarios.filter(isFuncionarioAtivo)
}

/**
 * Filtra funcionários que podem ser fiscais
 */
export function filtrarFuncionariosParaFiscalizacao(funcionarios: FuncionarioApi[]): FuncionarioApi[] {
  return funcionarios.filter(podeSerFiscal)
}

/**
 * Busca funcionário por matrícula em uma lista
 */
export function buscarPorMatricula(funcionarios: FuncionarioApi[], matricula: string): FuncionarioApi | undefined {
  const matriculaLimpa = matricula.replace(/\s/g, '').toLowerCase()
  return funcionarios.find(f => 
    f.matricula.replace(/\s/g, '').toLowerCase() === matriculaLimpa
  )
}

/**
 * Busca funcionários por nome (busca parcial)
 */
export function buscarPorNome(funcionarios: FuncionarioApi[], nome: string): FuncionarioApi[] {
  if (!nome || nome.length < 2) return []
  
  const nomeLimpo = nome.toLowerCase().trim()
  return funcionarios.filter(f => 
    f.nome.toLowerCase().includes(nomeLimpo)
  )
}

/**
 * Busca funcionários por lotação
 */
export function filtrarPorLotacao(funcionarios: FuncionarioApi[], lotacao: string): FuncionarioApi[] {
  if (!lotacao) return funcionarios
  
  const lotacaoLimpa = lotacao.toLowerCase().trim()
  return funcionarios.filter(f => 
    f.lotacao.toLowerCase().includes(lotacaoLimpa)
  )
}

// ========== AGRUPAMENTO E ORGANIZAÇÃO ==========

/**
 * Agrupa funcionários por lotação
 */
export function agruparPorLotacao(funcionarios: FuncionarioApi[]): Record<string, FuncionarioApi[]> {
  return funcionarios.reduce((grupos, funcionario) => {
    const lotacao = funcionario.lotacao
    if (!grupos[lotacao]) {
      grupos[lotacao] = []
    }
    grupos[lotacao].push(funcionario)
    return grupos
  }, {} as Record<string, FuncionarioApi[]>)
}

/**
 * Agrupa funcionários por situação funcional
 */
export function agruparPorSituacao(funcionarios: FuncionarioApi[]): Record<SituacaoFuncional, FuncionarioApi[]> {
  return funcionarios.reduce((grupos, funcionario) => {
    const situacao = funcionario.situacaoFuncional
    if (!grupos[situacao]) {
      grupos[situacao] = []
    }
    grupos[situacao].push(funcionario)
    return grupos
  }, {} as Record<SituacaoFuncional, FuncionarioApi[]>)
}

/**
 * Ordena funcionários por nome
 */
export function ordenarPorNome(funcionarios: FuncionarioApi[]): FuncionarioApi[] {
  return [...funcionarios].sort((a, b) => 
    a.nome.localeCompare(b.nome, 'pt-BR', { ignorePunctuation: true })
  )
}

/**
 * Ordena funcionários por matrícula
 */
export function ordenarPorMatricula(funcionarios: FuncionarioApi[]): FuncionarioApi[] {
  return [...funcionarios].sort((a, b) => 
    a.matricula.localeCompare(b.matricula)
  )
}

// ========== ESTATÍSTICAS ==========

/**
 * Conta funcionários por situação
 */
export function contarPorSituacao(funcionarios: FuncionarioApi[]): Record<SituacaoFuncional, number> {
  return funcionarios.reduce((contador, funcionario) => {
    const situacao = funcionario.situacaoFuncional
    contador[situacao] = (contador[situacao] || 0) + 1
    return contador
  }, {} as Record<SituacaoFuncional, number>)
}

/**
 * Calcula estatísticas básicas de uma lista de funcionários
 */
export function calcularEstatisticas(funcionarios: FuncionarioApi[]) {
  const total = funcionarios.length
  const ativos = funcionarios.filter(isFuncionarioAtivo).length
  const inativos = total - ativos
  const aptosFiscalizacao = funcionarios.filter(podeSerFiscal).length
  
  const porSituacao = contarPorSituacao(funcionarios)
  const lotacoesUnicas = new Set(funcionarios.map(f => f.lotacao)).size
  
  return {
    total,
    ativos,
    inativos,
    aptosFiscalizacao,
    percentualAtivos: total > 0 ? (ativos / total) * 100 : 0,
    porSituacao,
    lotacoesUnicas
  }
}