import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Building2, Hash } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useErrorHandler } from '@/hooks/use-error-handler'
import unidadesData from '@/modules/Unidades/ListaUnidades/data/unidades.json'
import type { Unidade } from '@/modules/Unidades/ListaUnidades/types/unidade'
import { ListaContratos } from '@/modules/Unidades/UnidadeDetalhes/components/lista-contratos'

export const UnidadeDetalhesPage = () => {
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

      const unidadeEncontrada = unidadesData.find(
        (u) => u.id === Number(unidadeId),
      )

      if (!unidadeEncontrada) {
        handleError('Unidade não encontrada', 404)
        return
      }

      setUnidade(unidadeEncontrada as Unidade)
      setLoading(false)
    }

    void carregarUnidade()
  }, [unidadeId, handleError])

  if (loading) {
    return (
      <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted h-8 w-1/3 rounded" />
            <div className="bg-muted h-32 rounded" />
            <div className="bg-muted h-96 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!unidade) {
    return null // O hook de erro já redirecionou
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6 xl:p-8">
        {/* Header Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            {/* Linha superior - Navegação */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/unidades')}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="xs:inline hidden">Voltar</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6" />
            </div>

            {/* Título e status */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <h1 className="text-xl font-bold break-all sm:text-2xl lg:text-3xl">
                  {unidade.nome}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    Ativo
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-base">
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
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {/* Informações Administrativas */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Hash className="h-5 w-5" />
                Códigos Administrativos
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-medium text-gray-600">
                    Unidade Orçamentária (UO):
                  </span>
                  <span className="rounded border bg-white px-3 py-1 font-mono text-sm">
                    {unidade.UO}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-medium text-gray-600">
                    Unidade Gestora (UG):
                  </span>
                  <span className="rounded border bg-white px-3 py-1 font-mono text-sm">
                    {unidade.UG}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-medium text-gray-600">
                    ID da Unidade:
                  </span>
                  <span className="rounded border bg-white px-3 py-1 font-mono text-sm">
                    {unidade.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                Localização
              </h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="leading-relaxed text-gray-700">
                  {unidade.endereco}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Contratos */}
          <div className="lg:col-span-2">
            <ListaContratos
              contratos={unidade.contratos ?? []}
              unidadeNome={unidade.nome}
            />
          </div>

          {/* Ações Rápidas */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button variant="outline" className="justify-start">
                  Ver Todos os Contratos
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

export default UnidadeDetalhesPage
