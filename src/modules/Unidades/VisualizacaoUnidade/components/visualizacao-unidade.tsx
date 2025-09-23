import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Building, MapPin } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useUnidadeDetails } from '../hooks/use-unidade-details'
import { VisaoGeralUnidade } from './visao-geral-unidade'
import { EnderecoUnidade } from './endereco-unidade'

export function VisualizacaoUnidade() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: unidade, isLoading, error } = useUnidadeDetails(id!)

  const handleVoltar = () => {
    navigate('/unidades')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !unidade) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoltar}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-muted-foreground text-lg font-semibold">
                Unidade não encontrada
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Não foi possível carregar as informações da unidade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto space-y-6 p-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoltar}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{unidade.nome}</h1>
            <p className="text-muted-foreground text-sm">
              {unidade.sigla ? `${unidade.sigla} • ` : ''}
              {unidade.cap.nome}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <VisaoGeralUnidade unidade={unidade} />
          </motion.div>
        </TabsContent>

        <TabsContent value="address" className="mt-6">
          <motion.div
            key="address"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <EnderecoUnidade unidade={unidade} />
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
