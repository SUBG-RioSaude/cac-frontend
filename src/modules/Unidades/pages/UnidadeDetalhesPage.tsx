import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  FileText, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useUnidadeDetalhada } from '../hooks/use-unidade-detalhada'

export function UnidadeDetalhesPage() {
  const { unidadeId } = useParams<{ unidadeId: string }>()
  const navigate = useNavigate()
  
  console.log('[DEBUG] UnidadeDetalhesPage - ID recebido:', unidadeId)
  
  const { unidade, carregando, erro, recarregar } = useUnidadeDetalhada({
    id: unidadeId || '',
    enabled: !!unidadeId
  })

  console.log('[DEBUG] UnidadeDetalhesPage - Estado:', { unidade, carregando, erro })

  const handleVoltar = () => {
    navigate('/unidades')
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (erro || !unidade) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">
                Erro ao Carregar Unidade
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              {erro || 'Não foi possível carregar os dados da unidade'}
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={recarregar}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={handleVoltar}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
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
          variant={unidade.ativo ? "default" : "secondary"}
          className={unidade.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {unidade.ativo ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-semibold">{unidade.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sigla</label>
                  <p className="text-lg font-mono">{unidade.sigla}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">CAP (Centro de Aplicação)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome do CAP</label>
                    <p className="font-medium">{unidade.cap.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">UO</label>
                    <p className="font-mono">{unidade.cap.uo}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Códigos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">UA</label>
                    <p className="font-mono">{unidade.ua}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">UO</label>
                    <p className="font-mono">{unidade.uo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">UG</label>
                    <p className="font-mono">{unidade.ug}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CNES</label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="font-medium">{unidade.endereco}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                  <p className="font-medium">{unidade.bairro}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Coordenadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                    <p className="font-mono">{unidade.latitude}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                    <p className="font-mono">{unidade.longitude}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Estrutura Organizacional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subsecretaria</label>
                    <p className="font-mono">{unidade.subsecretaria}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AP</label>
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
