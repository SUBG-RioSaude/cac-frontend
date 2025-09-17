import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface ServerErrorProps {
  error?: string
}

export default function ServerError({ error: propError }: ServerErrorProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRetrying, setIsRetrying] = useState(false)

  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  const handleRetry = async () => {
    setIsRetrying(true)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Erro 500 - Sistema CAC Frontend')
    const body = encodeURIComponent(
      `Detalhes do erro:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error || 'Não especificado'}`,
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Erro interno do servidor
          </CardTitle>
          <div className="mb-2 text-6xl font-bold text-gray-300">500</div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Ocorreu um erro interno no servidor. Nossa equipe foi notificada.
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-left">
              <p className="mb-1 text-xs font-medium text-red-600">
                Erro técnico:
              </p>
              <p className="font-mono text-sm break-all text-red-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="destructive"
              className="flex w-full items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Tentando...' : 'Tentar novamente'}
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="flex w-full items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              <strong>Se o problema persistir:</strong>
            </p>
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              size="sm"
              className="flex w-full items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4" />
              Contactar administrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
