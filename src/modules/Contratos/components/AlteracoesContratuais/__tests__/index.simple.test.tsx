import { describe, it, expect, vi } from 'vitest'

// Mock simples para verificar se os componentes podem ser importados
vi.mock('../hooks/useAlteracoesContratuais', () => ({
  useAlteracoesContratuais: () => ({
    dados: {},
    atualizarDados: vi.fn(),
    validarCamposObrigatorios: vi.fn(),
    submeterParaAprovacao: vi.fn(),
    podeSubmeter: false
  })
}))

vi.mock('../../hooks/use-contract-context', () => ({
  useContractContext: () => ({ contract: null }),
  useContractFinancials: () => ({}),
  useContractTerms: () => ({}),
  useContractSuppliers: () => ({}),
  useContractUnits: () => ({})
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}))

describe('AlteracoesContratuais - Import Test', () => {
  it('deve conseguir importar o componente sem erros', async () => {
    const { AlteracoesContratuais } = await import('../index')
    expect(AlteracoesContratuais).toBeDefined()
    expect(typeof AlteracoesContratuais).toBe('function')
  })
})