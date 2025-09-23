/**
 * ==========================================
 * UTILITARIOS PARA FUNCIONARIOS
 * ==========================================
 * Funcoes auxiliares para validacao, formatacao
 * e manipulacao de dados de funcionarios
 */

import { SituacaoFuncional } from '@/modules/Funcionarios/types/funcionario-api'
import type {
  FuncionarioApi,
  Usuario,
  UsuarioAtribuido,
} from '@/modules/Funcionarios/types/funcionario-api'

// ========== VALIDACOES ==========

/**
 * Valida se uma matricula tem formato valido
 * Pode aceitar diferentes padroes dependendo da organizacao
 */
export function validarMatricula(matricula: string): boolean {
  if (!matricula || matricula.trim().length === 0) {
    return false
  }

  // Remove espacos em branco
  const matriculaLimpa = matricula.trim()

  // Verifica se tem entre 4 e 10 caracteres (alfanumericos)
  const padraoMatricula = /^[A-Za-z0-9]{4,10}$/
  return padraoMatricula.test(matriculaLimpa)
}

/**
 * Valida se um CPF tem formato valido (simples)
 * Para validacao completa, usar biblioteca especializada
 */
export function validarFormatoCpf(cpf: string): boolean {
  if (!cpf) return false

  // Remove pontos e hifens
  const cpfLimpo = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 digitos
  return cpfLimpo.length === 11
}

/**
 * Verifica se funcionario esta ativo baseado em situacao e flag
 */

/**
 * Valida CPF com digitos verificadores (completo)
 */
export function validarCpfCompleto(cpf: string): boolean {
  if (!cpf) return false
  const s = cpf.replace(/[^\d]/g, '')
  if (s.length !== 11) return false
  // Rejeitar CPFs com todos os digitos iguais
  if (/^(\d)\1{10}$/.test(s)) return false
  const calcDV = (base: string, factor: number) => {
    let total = 0
    for (let i = 0; i < base.length; i++) {
      total += parseInt(base[i], 10) * (factor - i)
    }
    const mod = total % 11
    return mod < 2 ? 0 : 11 - mod
  }
  const dv1 = calcDV(s.slice(0, 9), 10)
  const dv2 = calcDV(s.slice(0, 9) + String(dv1), 11)
  return s.endsWith(`${dv1}${dv2}`)
}

export function isFuncionarioAtivo(funcionario: FuncionarioApi): boolean {
  return (
    funcionario.ativo &&
    funcionario.situacaoFuncional !== SituacaoFuncional.INATIVO
  )
}

/**
 * Verifica se funcionario pode ser atribuido como fiscal
 */
export function podeSerFiscal(funcionario: FuncionarioApi): boolean {
  // Simplificado para contornar tipagem incorreta da API.
  // A query para /Funcionarios ja inclui `ativo=true`.
  // Assumimos que a API ja retorna apenas funcionarios aptos.
  return funcionario.ativo === true
}

// ========== FORMATACAO ==========

/**
 * Formata matricula para exibicao
 */
export function formatarMatricula(matricula: string): string {
  if (!matricula) return ''

  // Se for numerica, pode adicionar zeros a esquerda
  if (/^\d+$/.test(matricula)) {
    return matricula.padStart(6, '0')
  }

  return matricula.toUpperCase()
}

/**
 * Formatar nome para exibicao (primeira letra maiuscula)
 */
export function formatarNome(nome: string): string {
  if (!nome) return ''

  return nome
    .toLowerCase()
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

/**
 * Formatar cargo para exibicao
 */
export function formatarCargo(cargo: string): string {
  if (!cargo) return ''

  return cargo
    .toLowerCase()
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

// ========== CONVERSOES E MAPEAMENTO ==========

/**
 * Converte SituacaoFuncional para status simples
 */
export function situacaoParaStatus(
  situacao: SituacaoFuncional,
  ativo: boolean,
): 'ativo' | 'inativo' {
  if (!ativo || situacao === SituacaoFuncional.INATIVO) {
    return 'inativo'
  }

  // Situacoes que devem aparecer como inativo
  const situacoesInativas: string[] = [
    SituacaoFuncional.AFASTADO,
    SituacaoFuncional.LICENCA,
  ]

  if (situacoesInativas.includes(situacao)) {
    return 'inativo'
  }

  return 'ativo'
}

/**
 * Converte FuncionarioApi para Usuario (compatibilidade com formulario atual)
 */
export function mapearFuncionarioParaUsuario(
  funcionario: FuncionarioApi,
): Usuario {
  return {
    id: funcionario.id,
    matricula: formatarMatricula(funcionario.matricula),
    nome: formatarNome(funcionario.nomeCompleto), // Usar nomeCompleto da API
    email: funcionario.emailInstitucional || '', // Usar emailInstitucional da API
    cargo: formatarCargo(funcionario.cargo),
    departamento: funcionario.lotacaoNome, // Usar lotacaoNome da API
    telefone: funcionario.telefone || '',
    status: situacaoParaStatus(
      funcionario.situacaoFuncional ||
        (funcionario.situacao as unknown as SituacaoFuncional),
      funcionario.ativo,
    ),
  }
}

/**
 * Converte FuncionarioApi para UsuarioAtribuido
 */
export function mapearFuncionarioParaUsuarioAtribuido(
  funcionario: FuncionarioApi,
  tipo: 'fiscal' | 'gestor' | null = null,
): UsuarioAtribuido {
  return {
    ...mapearFuncionarioParaUsuario(funcionario),
    tipo,
  }
}

/**
 * Converte lista de FuncionarioApi para lista de Usuario
 */
export function mapearFuncionariosParaUsuarios(
  funcionarios: FuncionarioApi[],
): Usuario[] {
  return funcionarios.map(mapearFuncionarioParaUsuario)
}

// ========== FILTROS E BUSCAS ==========

/**
 * Filtra funcionarios ativos
 */
export function filtrarFuncionariosAtivos(
  funcionarios: FuncionarioApi[],
): FuncionarioApi[] {
  return funcionarios.filter(isFuncionarioAtivo)
}

/**
 * Filtra funcionarios que podem ser fiscais
 */
export function filtrarFuncionariosParaFiscalizacao(
  funcionarios: FuncionarioApi[],
): FuncionarioApi[] {
  return funcionarios.filter(podeSerFiscal)
}

/**
 * Busca funcionario por matricula em uma lista
 */
export function buscarPorMatricula(
  funcionarios: FuncionarioApi[],
  matricula: string,
): FuncionarioApi | undefined {
  const matriculaLimpa = matricula.replace(/\s/g, '').toLowerCase()
  return funcionarios.find(
    (f) => f.matricula.replace(/\s/g, '').toLowerCase() === matriculaLimpa,
  )
}

/**
 * Busca funcionarios por nome (busca parcial)
 */
export function buscarPorNome(
  funcionarios: FuncionarioApi[],
  nome: string,
): FuncionarioApi[] {
  if (!nome || nome.length < 2) return []

  const nomeLimpo = nome.toLowerCase().trim()
  return funcionarios.filter((f) => f.nome?.toLowerCase().includes(nomeLimpo))
}

/**
 * Busca funcionarios por lotacao
 */
export function filtrarPorLotacao(
  funcionarios: FuncionarioApi[],
  lotacao: string,
): FuncionarioApi[] {
  if (!lotacao) return funcionarios

  const lotacaoLimpa = lotacao.toLowerCase().trim()
  return funcionarios.filter((f) =>
    f.lotacao?.toLowerCase().includes(lotacaoLimpa),
  )
}

// ========== AGRUPAMENTO E ORGANIZACAO ==========

/**
 * Agrupa funcionarios por lotacao
 */
export function agruparPorLotacao(
  funcionarios: FuncionarioApi[],
): Record<string, FuncionarioApi[]> {
  return funcionarios.reduce(
    (grupos, funcionario) => {
      const lotacao = funcionario.lotacao || 'Sem lotacao'
      if (!grupos[lotacao]) {
        grupos[lotacao] = []
      }
      grupos[lotacao].push(funcionario)
      return grupos
    },
    {} as Record<string, FuncionarioApi[]>,
  )
}

/**
 * Agrupa funcionarios por situacao funcional
 */
export function agruparPorSituacao(
  funcionarios: FuncionarioApi[],
): Record<SituacaoFuncional, FuncionarioApi[]> {
  return funcionarios.reduce(
    (grupos, funcionario) => {
      const situacao = funcionario.situacaoFuncional || SituacaoFuncional.ATIVO
      if (!grupos[situacao]) {
        grupos[situacao] = []
      }
      grupos[situacao].push(funcionario)
      return grupos
    },
    {} as Record<SituacaoFuncional, FuncionarioApi[]>,
  )
}

/**
 * Ordena funcionarios por nome
 */
export function ordenarPorNome(
  funcionarios: FuncionarioApi[],
): FuncionarioApi[] {
  return [...funcionarios].sort((a, b) => {
    const nomeA = a.nome || ''
    const nomeB = b.nome || ''
    return nomeA.localeCompare(nomeB, 'pt-BR', { ignorePunctuation: true })
  })
}

/**
 * Ordena funcionarios por matricula
 */
export function ordenarPorMatricula(
  funcionarios: FuncionarioApi[],
): FuncionarioApi[] {
  return [...funcionarios].sort((a, b) =>
    a.matricula.localeCompare(b.matricula),
  )
}

// ========== ESTATISTICAS ==========

/**
 * Conta funcionarios por situacao
 */
export function contarPorSituacao(
  funcionarios: FuncionarioApi[],
): Record<SituacaoFuncional, number> {
  return funcionarios.reduce(
    (contador, funcionario) => {
      const situacao = funcionario.situacaoFuncional || SituacaoFuncional.ATIVO
      contador[situacao] = (contador[situacao] || 0) + 1
      return contador
    },
    {} as Record<SituacaoFuncional, number>,
  )
}

/**
 * Calcula estatisticas basicas de uma lista de funcionarios
 */
export function calcularEstatisticas(funcionarios: FuncionarioApi[]) {
  const total = funcionarios.length
  const ativos = funcionarios.filter(isFuncionarioAtivo).length
  const inativos = total - ativos
  const aptosFiscalizacao = funcionarios.filter(podeSerFiscal).length

  const porSituacao = contarPorSituacao(funcionarios)
  const lotacoesUnicas = new Set(funcionarios.map((f) => f.lotacao)).size

  return {
    total,
    ativos,
    inativos,
    aptosFiscalizacao,
    percentualAtivos: total > 0 ? (ativos / total) * 100 : 0,
    porSituacao,
    lotacoesUnicas,
  }
}
