import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, ArrowLeft, Mail } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface BadRequestProps {
  error?: string
}

export default function BadRequest({ error: propError }: BadRequestProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Buscar erro do state da navegação ou usar prop
  const error = location.state?.error || propError

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Erro 400 - Requisição Inválida - Sistema CAC Frontend')
    const body = encodeURIComponent(
      `Detalhes do erro:\n\nHorário: ${new Date().toLocaleString()}\nURL: ${window.location.href}\nErro técnico: ${error || 'Não especificado'}`
    )
    window.location.href = `mailto:admin@sistema.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Requisição inválida
          </CardTitle>
          <div className="text-6xl font-bold text-gray-300 mb-2">400</div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            A requisição contém dados inválidos ou malformados.
          </p>

          {error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-blue-600 mb-1">Erro técnico:</p>
              <p className="text-sm text-blue-700 font-mono break-all">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="default"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar e corrigir
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
              <strong>Se o problema persistir:</strong>
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
