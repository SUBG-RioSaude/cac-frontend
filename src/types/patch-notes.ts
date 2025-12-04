// Tipos para Patch Notes API

/**
 * Enums para tipos e importância
 */
export const PatchNoteTipo = {
  Feature: 0,
  Fix: 1,
  Improvement: 2,
} as const

export type PatchNoteTipo = (typeof PatchNoteTipo)[keyof typeof PatchNoteTipo]

export const PatchNoteImportancia = {
  Baixa: 0,
  Media: 1,
  Alta: 2,
} as const

export type PatchNoteImportancia =
  (typeof PatchNoteImportancia)[keyof typeof PatchNoteImportancia]

/**
 * Item individual de um patch note
 */
export interface PatchNoteItem {
  id?: string
  tipo: PatchNoteTipo
  tipoDescricao?: string
  mensagem: string
  importancia: PatchNoteImportancia
  ordem?: number
}

/**
 * Request para criar um novo Patch Note
 * POST /api/PatchNotes
 */
export interface CriarPatchNoteRequest {
  sistemaId: string
  versao: string
  titulo: string
  dataPublicacao: string // ISO 8601 format
  importancia: PatchNoteImportancia
  items: PatchNoteItem[]
  publicarImediatamente: boolean
}

/**
 * Response de um Patch Note individual
 */
export interface PatchNote {
  id: string
  sistemaId: string
  entidadeOrigemId: string
  versao: string
  titulo: string
  dataPublicacao: string
  importancia: PatchNoteImportancia
  publicado: boolean
  publicadoEm: string | null
  criadoEm: string
  items: PatchNoteItem[]
}

/**
 * Response do endpoint GET /api/PatchNotes
 * Lista paginada de Patch Notes
 */
export interface ListarPatchNotesResponse {
  items: PatchNote[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

/**
 * Parâmetros de consulta para listar Patch Notes
 */
export interface ListarPatchNotesParams {
  page?: number
  pageSize?: number
  sistemaId?: string
}
