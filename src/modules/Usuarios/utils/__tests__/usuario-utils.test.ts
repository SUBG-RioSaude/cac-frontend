import { describe, it, expect } from 'vitest'

import type { UsuarioApi } from '../../types/usuario-api'
import { mapearUsuarioApi } from '../usuario-utils'

describe('mapearUsuarioApi', () => {
  it('deve mapear permissões múltiplas e manter campos básicos', () => {
    const usuarioApi: UsuarioApi = {
      usuarioId: '123',
      nomeCompleto: 'Ana Souza',
      email: 'ana@teste.com',
      ativo: false,
      ultimoLogin: '2024-01-10T10:00:00Z',
      permissoes: [
        { id: 1, nome: 'Analista' },
        { id: 2, nome: 'Gestor' },
      ],
    }

    const usuario = mapearUsuarioApi(usuarioApi)

    expect(usuario.id).toBe('123')
    expect(usuario.nome).toBe('Ana Souza')
    expect(usuario.email).toBe('ana@teste.com')
    expect(usuario.ativo).toBe(false)
    expect(usuario.permissaoAtribuida).toBe('Analista, Gestor')
    expect(usuario.ultimoLogin).toEqual(new Date('2024-01-10T10:00:00Z'))
  })

  it('deve utilizar fallback de permissão quando lista estiver vazia', () => {
    const usuarioApi: UsuarioApi = {
      usuarioId: '456',
      nomeCompleto: 'Bruno Lima',
      permissaoAtribuida: 'Administrador',
      permissoes: [],
    }

    const usuario = mapearUsuarioApi(usuarioApi)

    expect(usuario.permissaoAtribuida).toBe('Administrador')
  })

  it('deve aplicar valores padrão quando campos opcionais não forem informados', () => {
    const usuarioApi: UsuarioApi = {
      usuarioId: '789',
      nomeCompleto: 'Carla Dias',
    }

    const usuario = mapearUsuarioApi(usuarioApi)

    expect(usuario.email).toBe('')
    expect(usuario.ativo).toBe(true)
    expect(usuario.permissaoAtribuida).toBeUndefined()
    expect(usuario.ultimoLogin).toBeNull()
  })
})

