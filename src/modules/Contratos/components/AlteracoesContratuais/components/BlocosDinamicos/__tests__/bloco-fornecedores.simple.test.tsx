import { describe, it, expect, vi } from 'vitest'

// Mocks simples
vi.mock('@/modules/Empresas/hooks/use-empresas', () => ({
  useFornecedoresResumo: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../../hooks/use-contract-context', () => ({
  useContractSuppliers: () => ({
    mainSupplier: null,
    suppliers: [],
  }),
}))

describe('BlocoFornecedores - Import Test', () => {
  it('deve conseguir importar o componente sem erros', async () => {
    const { BlocoFornecedores } = await import('../bloco-fornecedores')
    expect(BlocoFornecedores).toBeDefined()
    expect(typeof BlocoFornecedores).toBe('function')
  })
})
