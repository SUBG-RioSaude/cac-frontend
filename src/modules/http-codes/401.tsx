import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, LogIn, Home, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface UnauthorizedProps {
  error?: string
}

export default function Unauthorized({ error: propError }: UnauthorizedProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  const handleLogin = () => {
    // Implementar redirecionamento para login
    // TODO: Implementar navegação para login
  }

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Erro de Acesso - Sistema CAC Frontend')
    const body = encodeURIComponent(
      `Detalhes do erro:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error || 'Não especificado'}`,
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso não autorizado
          </CardTitle>
          <div className="mb-2 text-6xl font-bold text-gray-300">401</div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Você precisa estar autenticado para acessar esta página.
          </p>

          {error && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-left">
              <p className="mb-1 text-xs font-medium text-yellow-600">
                Erro técnico:
              </p>
              <p className="font-mono text-sm break-all text-yellow-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
            <Button
              onClick={handleLogin}
              variant="default"
              className="flex w-full items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700"
            >
              <LogIn className="h-4 w-4" />
              Fazer Login
            </Button>
            <Button
              onClick={() => navigate('/')}
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
