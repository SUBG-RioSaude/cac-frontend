import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building,
  MapPin,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useUnidadeDetalhada } from '../hooks/use-unidade-detalhada'

export const UnidadeDetalhesPage = () => {
  const { unidadeId } = useParams<{ unidadeId: string }>()
  const navigate = useNavigate()

  const { unidade, carregando, erro, recarregar } = useUnidadeDetalhada({
    id: unidadeId ?? '',
    enabled: !!unidadeId,
  })

  const handleVoltar = () => {
    navigate('/unidades')
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  if (erro || !unidade) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">
                Erro ao Carregar Unidade
              </h3>
            </div>
            <p className="mb-4 text-red-700">
              {erro ?? 'Não foi possível carregar os dados da unidade'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={recarregar}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button onClick={handleVoltar} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
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
      className="space-y-6"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            <h1 className="text-2xl font-bold">{unidade.nome}</h1>
            <p className="text-muted-foreground">Detalhes da Unidade</p>
          </div>
        </div>
        <Badge
          variant={unidade.ativo ? 'default' : 'secondary'}
          className={
            unidade.ativo
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }
        >
          {unidade.ativo ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Inativo
            </>
          )}
        </Badge>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Informações Gerais
          </TabsTrigger>
          <TabsTrigger value="endereco" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados da Unidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Nome
                  </span>
                  <p className="text-lg font-semibold">{unidade.nome}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Sigla
                  </span>
                  <p className="font-mono text-lg">{unidade.sigla}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                  CAP (Centro de Aplicação)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Nome do CAP
                    </span>
                    <p className="font-medium">{unidade.cap.nome}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      UO
                    </span>
                    <p className="font-mono">{unidade.cap.uo}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                  Códigos
                </h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      UA
                    </span>
                    <p className="font-mono">{unidade.ua}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      UO
                    </span>
                    <p className="font-mono">{unidade.uo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      UG
                    </span>
                    <p className="font-mono">{unidade.ug}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      CNES
                    </span>
                    <p className="font-mono">{unidade.cnes}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Endereço
                  </span>
                  <p className="font-medium">{unidade.endereco}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Bairro
                  </span>
                  <p className="font-medium">{unidade.bairro}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                  Coordenadas
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Latitude
                    </span>
                    <p className="font-mono">{unidade.latitude}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Longitude
                    </span>
                    <p className="font-mono">{unidade.longitude}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                  Estrutura Organizacional
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Subsecretaria
                    </span>
                    <p className="font-mono">{unidade.subsecretaria}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm font-medium">
                      AP
                    </span>
                    <p className="font-mono">{unidade.ap}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
