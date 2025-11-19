import { useMemo } from 'react'

import { getToken, getTokenInfo } from '@/lib/auth/auth'
import {
  useMinhasPermissoesQuery,
  useValidarPermissaoQuery,
} from '@/lib/auth/permissoes-queries'

/**
 * Hook para verificar se o usuário tem uma permissão específica
 * Combina validação local (JWT) com validação server-side
 *
 * @param permissaoNome - Nome da permissão (ex: 'Visualizar', 'Criar', 'Editar')
 * @param sistemaId - ID do sistema (opcional, usa VITE_SYSTEM_ID se não fornecido)
 * @param validateServer - Se deve validar no servidor (padrão: true para operações críticas)
 *
 * @returns Objeto com:
 *   - hasPermission: boolean | null (null = carregando)
 *   - isLoading: boolean
 *   - isValidating: boolean (validação server-side em progresso)
 *   - localCheck: boolean (resultado da verificação local no JWT)
 *   - serverCheck: boolean | null (resultado da verificação no servidor)
 *
 * @example
 * ```tsx
 * const { hasPermission, isLoading } = useHasPermission('Criar')
 *
 * if (isLoading) return <Skeleton />
 * if (!hasPermission) return <AccessDenied />
 *
 * return <CriarButton />
 * ```
 *
 * @example
 * ```tsx
 * // Validação apenas local (mais rápida, menos segura)
 * const { hasPermission } = useHasPermission('Visualizar', undefined, false)
 * ```
 */
export const useHasPermission = (
  permissaoNome: string,
  sistemaId?: string,
  validateServer = true,
) => {
  const sistemaIdFinal = sistemaId ?? (import.meta.env.VITE_SYSTEM_ID as string)

  // Validação local (JWT)
  const localCheck = useMemo(() => {
    const token = getToken()
    if (!token) return false

    const tokenInfo = getTokenInfo(token)
    if (!tokenInfo) return false

    // Verifica se permissaoNome está no array de permissões do token
    return tokenInfo.permissaoNome.includes(permissaoNome)
  }, [permissaoNome])

  // Validação server-side (apenas se habilitada)
  const {
    data: serverCheck,
    isLoading: isValidatingServer,
    error: serverError,
  } = useValidarPermissaoQuery(
    { sistemaId: sistemaIdFinal, permissaoNome },
    { enabled: validateServer && localCheck }, // Apenas valida server se passou na validação local
  )

  // Resultado final
  const hasPermission = useMemo(() => {
    // Se validação server desabilitada, retorna apenas check local
    if (!validateServer) {
      return localCheck
    }

    // Se validação server habilitada, aguarda resultado do servidor
    if (isValidatingServer) {
      return null // Ainda carregando
    }

    // Se houve erro no servidor mas passou localmente, permite acesso
    // (fallback para evitar bloquear usuário em problemas de rede)
    if (serverError && localCheck) {
      console.warn(
        `Erro ao validar permissão "${permissaoNome}" no servidor, usando validação local como fallback`,
        serverError,
      )
      return localCheck
    }

    // Retorna resultado do servidor
    return serverCheck ?? false
  }, [localCheck, validateServer, isValidatingServer, serverCheck, serverError, permissaoNome])

  return {
    hasPermission,
    isLoading: validateServer ? isValidatingServer : false,
    isValidating: validateServer && isValidatingServer,
    localCheck,
    serverCheck: validateServer ? serverCheck ?? null : null,
  }
}

/**
 * Hook simplificado para verificar se o usuário tem QUALQUER uma das permissões fornecidas
 *
 * @param permissoes - Array de nomes de permissões
 * @param sistemaId - ID do sistema (opcional)
 * @param validateServer - Se deve validar no servidor (padrão: true)
 *
 * @example
 * ```tsx
 * const { hasAnyPermission } = useHasAnyPermission(['Criar', 'Editar', 'Deletar'])
 * if (hasAnyPermission) {
 *   return <BotaoAcoes />
 * }
 * ```
 */
export const useHasAnyPermission = (
  permissoes: string[],
  sistemaId?: string,
  validateServer = true,
) => {
  const sistemaIdFinal = sistemaId ?? (import.meta.env.VITE_SYSTEM_ID as string)

  // Validação local
  const localCheck = useMemo(() => {
    const token = getToken()
    if (!token) return false

    const tokenInfo = getTokenInfo(token)
    if (!tokenInfo) return false

    // Verifica se tem ALGUMA das permissões
    return permissoes.some((perm) => tokenInfo.permissaoNome.includes(perm))
  }, [permissoes])

  // Para validação server, busca todas as permissões do usuário e valida localmente
  const { data: minhasPermissoes, isLoading: isValidatingServer } =
    useMinhasPermissoesQuery(sistemaIdFinal, {
      enabled: validateServer && localCheck,
    })

  const hasAnyPermissionServer = useMemo(() => {
    if (!minhasPermissoes?.permissoes) return false
    return permissoes.some((perm) =>
      minhasPermissoes.permissoes.includes(perm),
    )
  }, [minhasPermissoes, permissoes])

  const hasAnyPermission = useMemo(() => {
    if (!validateServer) return localCheck
    if (isValidatingServer) return null
    return hasAnyPermissionServer
  }, [validateServer, localCheck, isValidatingServer, hasAnyPermissionServer])

  return {
    hasAnyPermission,
    isLoading: isValidatingServer,
    localCheck,
    serverChecks: minhasPermissoes?.permissoes
      ? permissoes.map((perm) =>
          minhasPermissoes.permissoes.includes(perm) ? true : null,
        )
      : permissoes.map(() => null),
  }
}

/**
 * Hook para verificar se o usuário tem TODAS as permissões fornecidas
 *
 * @param permissoes - Array de nomes de permissões
 * @param sistemaId - ID do sistema (opcional)
 * @param validateServer - Se deve validar no servidor (padrão: true)
 *
 * @example
 * ```tsx
 * const { hasAllPermissions } = useHasAllPermissions(['Criar', 'Aprovar'])
 * if (hasAllPermissions) {
 *   return <BotaoCriarEAprovar />
 * }
 * ```
 */
export const useHasAllPermissions = (
  permissoes: string[],
  sistemaId?: string,
  validateServer = true,
) => {
  const sistemaIdFinal = sistemaId ?? (import.meta.env.VITE_SYSTEM_ID as string)

  // Validação local
  const localCheck = useMemo(() => {
    const token = getToken()
    if (!token) return false

    const tokenInfo = getTokenInfo(token)
    if (!tokenInfo) return false

    // Verifica se tem TODAS as permissões
    return permissoes.every((perm) => tokenInfo.permissaoNome.includes(perm))
  }, [permissoes])

  // Para validação server, busca todas as permissões do usuário e valida localmente
  const { data: minhasPermissoes, isLoading: isValidatingServer } =
    useMinhasPermissoesQuery(sistemaIdFinal, {
      enabled: validateServer && localCheck,
    })

  const hasAllPermissionsServer = useMemo(() => {
    if (!minhasPermissoes?.permissoes) return false
    return permissoes.every((perm) =>
      minhasPermissoes.permissoes.includes(perm),
    )
  }, [minhasPermissoes, permissoes])

  const hasAllPermissions = useMemo(() => {
    if (!validateServer) return localCheck
    if (isValidatingServer) return null
    return hasAllPermissionsServer
  }, [validateServer, localCheck, isValidatingServer, hasAllPermissionsServer])

  return {
    hasAllPermissions,
    isLoading: isValidatingServer,
    localCheck,
    serverChecks: minhasPermissoes?.permissoes
      ? permissoes.map((perm) =>
          minhasPermissoes.permissoes.includes(perm) ? true : null,
        )
      : permissoes.map(() => null),
  }
}
