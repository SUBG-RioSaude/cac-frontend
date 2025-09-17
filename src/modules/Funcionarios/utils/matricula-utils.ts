/**
 * Utilitários de Matrícula
 */

/**
 * Limpa matrícula para envio à API (remove tudo que não for A-Z ou 0-9) e aplica uppercase.
 */
export function limparMatricula(matricula: string): string {
  if (!matricula) return ''
  return matricula.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

