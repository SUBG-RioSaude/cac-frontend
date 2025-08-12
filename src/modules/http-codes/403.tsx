import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Home, ArrowLeft, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface ForbiddenProps {
  error?: string
}

export default function Forbidden({ error: propError }: ForbiddenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Solicitação de Acesso - Sistema CAC Frontend')
    const body = encodeURIComponent(
      `Solicitação de acesso:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error || 'Não especificado'}\n\nPor favor, solicito acesso a este recurso.`
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso negado
          </CardTitle>
          <div className="text-6xl font-bold text-gray-300 mb-2">403</div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Você não tem permissão para acessar este recurso.
          </p>

          {error && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-orange-600 mb-1">Erro técnico:</p>
              <p className="text-sm text-orange-700 font-mono break-all">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="default"
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Precisa de acesso?</strong>
            </p>
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
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
