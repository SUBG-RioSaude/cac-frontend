import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Building2, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useErrorHandler } from "@/hooks/use-error-handler"

import unidadesData from "@/modules/Unidades/ListaUnidades/data/unidades.json"
import type { Unidade } from "@/modules/Unidades/ListaUnidades/types/unidade"

function UnidadeDetailPage() {
  const { unidadeId } = useParams<{ unidadeId: string }>()
  const navigate = useNavigate()
  const { handleError } = useErrorHandler()
  const [unidade, setUnidade] = useState<Unidade | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarUnidade = async () => {
      setLoading(true)
      
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const unidadeEncontrada = unidadesData.find(u => u.id === Number(unidadeId))
      
      if (!unidadeEncontrada) {
        handleError("Unidade não encontrada", 404)
        return
      }
      
      setUnidade(unidadeEncontrada)
      setLoading(false)
    }

    carregarUnidade()
  }, [unidadeId, handleError])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!unidade) {
    return null // O hook de erro já redirecionou
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Header Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl border shadow-sm p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            {/* Linha superior - Navegação */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/unidades")}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Voltar</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6" />
            </div>

            {/* Título e status */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-all">{unidade.nome}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 px-3 py-1 text-sm font-semibold">
                    Ativo
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {unidade.sigla}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Informações Administrativas */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5" />
                Códigos Administrativos
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">Unidade Orçamentária (UO):</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                    {unidade.UO}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">Unidade Gestora (UG):</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                    {unidade.UG}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">ID da Unidade:</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                    {unidade.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5" />
                Localização
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {unidade.endereco}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5" />
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="justify-start">
                  Ver Contratos Vinculados
                </Button>
                <Button variant="outline" className="justify-start">
                  Relatórios da Unidade
                </Button>
                <Button variant="outline" className="justify-start">
                  Editar Informações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default UnidadeDetailPage