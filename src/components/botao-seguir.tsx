/**
 * Componente de Botão para Seguir/Deixar de Seguir Entidades
 * Integrado com sistema de subscrições via TanStack Query
 */

import { Bell, BellRing, Loader2 } from 'lucide-react'

import { obterSistemaId, isSistemaValido } from '@/config/sistemas'
import {
  useToggleSeguirMutation,
  useVerificarSeguindoQuery,
} from '@/hooks/use-subscricoes-query'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'

// ============================================================================
// TYPES
// ============================================================================

interface BotaoSeguirProps {
  /**
   * ID da entidade a ser seguida (ex: ID do contrato, fornecedor, etc.)
   */
  entidadeOrigemId: string

  /**
   * ID do sistema de origem (ex: 'contratos', 'fornecedores', 'unidades')
   */
  sistemaId: string

  /**
   * Classes CSS adicionais
   */
  className?: string

  /**
   * Se deve mostrar apenas o ícone (responsivo por padrão)
   */
  apenasIcone?: boolean
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Botão para seguir ou deixar de seguir uma entidade
 *
 * Features:
 * - Verifica automaticamente se está seguindo
 * - Toggle com um clique
 * - Optimistic updates para UX imediata
 * - Loading states durante requisições
 * - Toasts de feedback automáticos
 * - Responsivo (ícone apenas em mobile por padrão)
 *
 * @example
 * ```tsx
 * // Em uma página de contrato
 * <BotaoSeguir
 *   entidadeOrigemId={contratoId}
 *   sistemaId="contratos"
 * />
 *
 * // Com classe customizada
 * <BotaoSeguir
 *   entidadeOrigemId={fornecedorId}
 *   sistemaId="fornecedores"
 *   className="ml-4"
 * />
 * ```
 */
export const BotaoSeguir = ({
  entidadeOrigemId,
  sistemaId,
  className,
  apenasIcone = false,
}: BotaoSeguirProps) => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  // Converte sistemaId para o formato aceito pela API
  const sistemaIdApi = isSistemaValido(sistemaId)
    ? obterSistemaId(sistemaId)
    : sistemaId

  // Debug: Logar conversão de sistemaId
  if (process.env.NODE_ENV === 'development') {
    console.log('[BotaoSeguir] sistemaId:', {
      original: sistemaId,
      convertido: sistemaIdApi,
      valido: isSistemaValido(sistemaId),
    })
  }

  // Verifica status de seguimento
  const { data: statusSeguimento, isLoading: isLoadingStatus } =
    useVerificarSeguindoQuery(sistemaIdApi, entidadeOrigemId)

  // Mutation para toggle
  const toggleSeguir = useToggleSeguirMutation()

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const seguindo = statusSeguimento?.seguindo ?? false
  const isLoading = isLoadingStatus || toggleSeguir.isPending

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggle = () => {
    toggleSeguir.mutate({
      sistemaId: sistemaIdApi,
      entidadeOrigemId,
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Button
      variant={seguindo ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        seguindo && 'bg-green-600 hover:bg-green-700 text-white',
        className,
      )}
      aria-label={seguindo ? 'Deixar de seguir' : 'Seguir'}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
      ) : seguindo ? (
        <BellRing className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : (
        <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
      )}

      {!apenasIcone && (
        <span className="ml-2 hidden sm:inline">
          {isLoading ? 'Carregando...' : seguindo ? 'Seguindo' : 'Seguir'}
        </span>
      )}
    </Button>
  )
}

/**
 * Variante do BotaoSeguir específica para Contratos
 * Pré-configurado com sistemaId='contratos'
 *
 * @example
 * ```tsx
 * <BotaoSeguirContrato contratoId={id} />
 * ```
 */
export const BotaoSeguirContrato = ({
  contratoId,
  className,
}: {
  contratoId: string
  className?: string
}) => {
  return (
    <BotaoSeguir
      entidadeOrigemId={contratoId}
      sistemaId="contratos"
      className={className}
    />
  )
}

/**
 * Variante do BotaoSeguir específica para Fornecedores
 * Pré-configurado com sistemaId='fornecedores'
 *
 * @example
 * ```tsx
 * <BotaoSeguirFornecedor fornecedorId={id} />
 * ```
 */
export const BotaoSeguirFornecedor = ({
  fornecedorId,
  className,
}: {
  fornecedorId: string
  className?: string
}) => {
  return (
    <BotaoSeguir
      entidadeOrigemId={fornecedorId}
      sistemaId="fornecedores"
      className={className}
    />
  )
}

/**
 * Variante do BotaoSeguir específica para Unidades
 * Pré-configurado com sistemaId='unidades'
 *
 * @example
 * ```tsx
 * <BotaoSeguirUnidade unidadeId={id} />
 * ```
 */
export const BotaoSeguirUnidade = ({
  unidadeId,
  className,
}: {
  unidadeId: string
  className?: string
}) => {
  return (
    <BotaoSeguir
      entidadeOrigemId={unidadeId}
      sistemaId="unidades"
      className={className}
    />
  )
}
