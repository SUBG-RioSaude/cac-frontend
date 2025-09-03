import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NotFoundProps {
  error?: string
}

export default function NotFound({ error: propError }: NotFoundProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Página não encontrada
          </CardTitle>
          <div className="mb-2 text-6xl font-bold text-gray-300">404</div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>

          {error && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
              <p className="mb-1 text-xs font-medium text-gray-500">
                Erro técnico:
              </p>
              <p className="font-mono text-sm break-all text-gray-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="secondary"
              className="flex w-full items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="default"
              className="flex w-full items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Se o problema persistir, entre em contato com o administrador do
              sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
