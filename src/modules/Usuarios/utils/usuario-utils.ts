import type { Usuario, UsuarioApi } from '../types/usuario-api'

/**
 * Mapeia dados da API para o formato local
 */
export function mapearUsuarioApi(usuarioApi: UsuarioApi): Usuario {
  // Extrair nome(s) da(s) permissão(ões)
  // A API retorna um array de permissões: [{id: 2, nome: "Analista I"}]
  let permissaoAtribuida: string | undefined

  const { permissoes, permissaoAtribuida: permissaoAtribuidaFallback } =
    usuarioApi
  if (permissoes && permissoes.length > 0) {
    // Pegar o nome da primeira permissão ou concatenar todas
    permissaoAtribuida = permissoes.map((p) => p.nome).join(', ')
  } else if (permissaoAtribuidaFallback) {
    // Fallback para compatibilidade
    permissaoAtribuida = permissaoAtribuidaFallback
  }

  return {
    id: usuarioApi.usuarioId,
    nome: usuarioApi.nomeCompleto,
    email: usuarioApi.email ?? '',
    permissaoAtribuida,
    ultimoLogin: usuarioApi.ultimoLogin
      ? new Date(usuarioApi.ultimoLogin)
      : null,
    ativo: usuarioApi.ativo ?? true, // Default para true se não informado
  }
}

