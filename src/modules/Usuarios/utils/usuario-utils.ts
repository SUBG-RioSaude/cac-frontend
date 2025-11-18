import type { Usuario, UsuarioApi } from '../types/usuario-api'

/**
 * Mapeia dados da API para o formato local
 */
export function mapearUsuarioApi(usuarioApi: UsuarioApi): Usuario {
  // Extrair nome(s) da(s) permissão(ões)
  // A API retorna um array de permissões: [{id: 2, nome: "Analista I"}]
  let permissaoAtribuida: string | undefined

  if (usuarioApi.permissoes && usuarioApi.permissoes.length > 0) {
    // Pegar o nome da primeira permissão ou concatenar todas
    permissaoAtribuida = usuarioApi.permissoes
      .map((p) => p.nome)
      .join(', ')
  } else if (usuarioApi.permissaoAtribuida) {
    // Fallback para compatibilidade
    permissaoAtribuida = usuarioApi.permissaoAtribuida
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

