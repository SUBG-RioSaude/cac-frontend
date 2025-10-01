import { Shield, Home, ArrowLeft, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ForbiddenProps {
  error?: string
}

interface LocationState {
  error?: string
}

function isValidLocationState(state: unknown): state is LocationState {
  return typeof state === 'object' && state !== null
}

const Forbidden = ({ error: propError }: ForbiddenProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Buscar erro do state da navegação ou usar prop
  const locationError =
    isValidLocationState(location.state) &&
    typeof location.state.error === 'string'
      ? location.state.error
      : undefined
  const error = locationError ?? propError

  const handleContactAdmin = () => {
    const subject = encodeURIComponent(
      'Solicitação de Acesso - Sistema CAC Frontend',
    )
    const body = encodeURIComponent(
      `Solicitação de acesso:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error ?? 'Não especificado'}\n\nPor favor, solicito acesso a este recurso.`,
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso negado
          </CardTitle>
          <div className="mb-2 text-6xl font-bold text-gray-300">403</div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Você não tem permissão para acessar este recurso.
          </p>

          {error && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-left">
              <p className="mb-1 text-xs font-medium text-orange-600">
                Erro técnico:
              </p>
              <p className="font-mono text-sm break-all text-orange-700">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              className="flex w-full items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="default"
              className="flex w-full items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              <strong>Precisa de acesso?</strong>
            </p>
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              size="sm"
              className="flex w-full items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4" />
              Solicitar acesso ao administrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Forbidden
