/**
 * Configuração de sistemas para subscrições
 *
 * IMPORTANTE: O sistemaId aceito pela API pode ser:
 * 1. O GUID do sistema frontend (VITE_SYSTEM_ID)
 * 2. GUIDs específicos para cada subsistema
 * 3. Um enum numérico (0, 1, 2...)
 *
 * TODO: Verificar no Swagger da API qual formato é aceito
 * Endpoint: GET /api/subscricoes/estou-seguindo
 */

/**
 * GUID do sistema frontend (CAC)
 * Usado como fallback se não houver mapeamento específico
 */
export const SISTEMA_FRONTEND_ID = import.meta.env.VITE_SYSTEM_ID as string

/**
 * Mapeamento de subsistemas para seus IDs
 *
 * CENÁRIO A: Todos usam o mesmo GUID do frontend
 * CENÁRIO B: Cada um tem GUID próprio (precisa ser descoberto)
 * CENÁRIO C: São enums numéricos (0, 1, 2...)
 */
export const SISTEMA_IDS = {
  /**
   * Sistema de Contratos
   * TODO: Verificar se deve ser VITE_SYSTEM_ID ou GUID específico
   */
  contratos: SISTEMA_FRONTEND_ID, // TEMPORÁRIO - testar primeiro

  /**
   * Sistema de Fornecedores
   * TODO: Verificar se deve ser VITE_SYSTEM_ID ou GUID específico
   */
  fornecedores: SISTEMA_FRONTEND_ID, // TEMPORÁRIO - testar primeiro

  /**
   * Sistema de Unidades
   * TODO: Verificar se deve ser VITE_SYSTEM_ID ou GUID específico
   */
  unidades: SISTEMA_FRONTEND_ID, // TEMPORÁRIO - testar primeiro
} as const

/**
 * Tipo para sistemas válidos
 */
export type SistemaKey = keyof typeof SISTEMA_IDS

/**
 * Obtém o ID do sistema para usar na API
 *
 * @param sistema - Nome do sistema (contratos, fornecedores, unidades)
 * @returns ID do sistema (GUID ou enum)
 */
export const obterSistemaId = (sistema: SistemaKey): string => {
  const id = SISTEMA_IDS[sistema]

  if (!id) {
    console.warn(`[Sistemas] Sistema desconhecido: ${sistema}, usando SISTEMA_FRONTEND_ID como fallback`)
    return SISTEMA_FRONTEND_ID
  }

  return id
}

/**
 * Valida se um sistema é válido
 *
 * @param sistema - Nome do sistema
 * @returns true se válido
 */
export const isSistemaValido = (sistema: string): sistema is SistemaKey => {
  return sistema in SISTEMA_IDS
}

/**
 * Nomes descritivos dos sistemas
 */
export const SISTEMA_NOMES: Record<SistemaKey, string> = {
  contratos: 'Contratos',
  fornecedores: 'Fornecedores',
  unidades: 'Unidades',
}
