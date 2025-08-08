/**
 * Exemplo demonstrativo da implementação Suspense vs Estado Manual
 * Este arquivo é apenas para documentação - pode ser removido em produção
 */

import { Suspense } from 'react'
import { ErrorBoundary, FormErrorBoundary } from '@/components/error-boundary'
import { FormLoadingFallback, ButtonLoadingSpinner } from '@/components/ui/loading'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { Button } from '@/components/ui/button'

// ❌ ANTES: Abordagem com estado manual
function FormWithManualLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setError(null)
    try {
      await saveData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form>
      {error && <div className="error">{error}</div>}
      <input disabled={isLoading} />
      <Button disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}

// ✅ DEPOIS: Abordagem com Suspense
function FormWithSuspense() {
  const { submitForm, isSubmitting } = useFormAsyncOperation()

  const handleSubmit = (data: any) => {
    const operation = async () => await saveData(data)
    submitForm(data, operation) // Suspense automático!
  }

  return (
    <form>
      <input />
      <Button disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <ButtonLoadingSpinner />
            Salvando...
          </>
        ) : (
          'Salvar'
        )}
      </Button>
    </form>
  )
}

// ✅ Container com Suspense completo
function FormContainer() {
  return (
    <FormErrorBoundary>
      <Suspense fallback={<FormLoadingFallback />}>
        <FormWithSuspense />
      </Suspense>
    </FormErrorBoundary>
  )
}

// 🎯 Vantagens obtidas:
const VANTAGENS_SUSPENSE = {
  performance: 'Sem re-renders desnecessários',
  declarativo: 'Loading/Error states automáticos',
  composição: 'Fallbacks reutilizáveis',
  consistência: 'UX padronizada em toda a app',
  futuroProof: 'Compatível com Server Components',
  acessibilidade: 'Live regions automáticas',
  testabilidade: 'Testes mais simples',
  manutenibilidade: 'Menos código boilerplate'
}

export { FormWithSuspense, FormContainer, VANTAGENS_SUSPENSE }