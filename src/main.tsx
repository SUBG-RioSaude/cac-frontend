import { StrictMode } from 'react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
//CSS
import './index.css'

// Import the main App component
import App from './App'
import { useAuthStore } from '@/lib/auth/auth-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter no cache por 10 minutos
      gcTime: 10 * 60 * 1000, 
      // Retry automático para falhas de rede
      retry: (failureCount, error: unknown) => {
        // Não retry para erros 4xx (client errors)
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as { response: { status: number } }).response?.status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Máximo 3 tentativas para outros erros
        return failureCount < 3
      },
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch quando reconecta à internet
      refetchOnReconnect: 'always'
    },
    mutations: {
      // Retry apenas 1x para mutations
      retry: 1,
      // Network mode para mutations
      networkMode: 'offlineFirst'
    }
  },
  
  // Error handling global configurado via defaultOptions para compatibilidade
})

// Componente wrapper para inicializar a autenticação
function AppWrapper() {
  const { verificarAutenticacao } = useAuthStore()

  React.useEffect(() => {
    console.log('AppWrapper - Inicializando verificação de autenticação...')
    verificarAutenticacao()
  }, [verificarAutenticacao])

  return <App />
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppWrapper />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
}
