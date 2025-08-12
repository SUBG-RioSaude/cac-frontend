
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, RefreshCw, Home, Clock, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface ServiceUnavailableProps {
  error?: string
}

export default function ServiceUnavailable({ error: propError }: ServiceUnavailableProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRetrying, setIsRetrying] = useState(false)
  const [countdown, setCountdown] = useState(30)
  
  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Serviço Indisponível - Sistema CAC Frontend')
    const body = encodeURIComponent(
      `Detalhes do erro:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error || 'Não especificado'}`
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Server className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Serviço indisponível
          </CardTitle>
          <div className="text-6xl font-bold text-gray-300 mb-2">503</div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            O serviço está temporariamente indisponível. Tente novamente em alguns minutos.
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <p className="text-sm text-purple-700">
              Próxima tentativa automática em: <strong>{countdown}s</strong>
            </p>
          </div>

          {error && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-purple-600 mb-1">Erro técnico:</p>
              <p className="text-sm text-purple-700 font-mono break-all">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              variant="default"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentando...' : 'Tentar agora'}
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para início
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Problema persiste?</strong>
            </p>
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
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
