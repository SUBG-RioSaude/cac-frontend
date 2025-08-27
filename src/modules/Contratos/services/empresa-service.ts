
import { api } from "@/lib/axios"
import type { EmpresaRequest, EmpresaResponse } from "../types/empresa"


/**
 * Cadastra uma nova empresa/fornecedor
 */
export async function cadastrarEmpresa(
  dadosEmpresa: EmpresaRequest,
): Promise<EmpresaResponse> {
  const { data } = await api.post<EmpresaResponse>(
    '/api/Empresas',
    dadosEmpresa,
    {
      baseURL: import.meta.env.VITE_API_URL_EMPRESA,
    },
  )
  return data
}

/**
 * Consulta empresa por CNPJ
 */
export async function consultarEmpresaPorCNPJ(
  cnpj: string
): Promise<EmpresaResponse | null> {
  try {
    const { data } = await api.get<EmpresaResponse>(`/api/Empresas/cnpj/${cnpj}`, {
      baseURL: import.meta.env.VITE_API_URL_EMPRESA
    })
    return data
  } catch (error) {
    // Se retornar 404, significa que a empresa não foi encontrada
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number } }
      if (axiosError.response?.status === 404) {
        return null
      }
    }
    throw error
  }
}
