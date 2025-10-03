import { AlertCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'

import LayoutPagina from '@/components/layout-pagina'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListaDocumentosContrato } from '@/modules/Contratos/components/Documentos/ListaDocumentosContrato'
import { TabDocumentos } from '@/modules/Contratos/components/Documentos/tab-documentos'
import { DetalhesContrato } from '@/modules/Contratos/components/VisualizacaoContratos/detalhes-contrato'
import { useContratoDetalhado } from '@/modules/Contratos/hooks/use-contratos'

const ContratoDetailPage = () => {
  const { contratoId } = useParams<{ contratoId: string }>()

  // Usando o hook real para buscar dados do contrato
  const {
    data: contrato,
    isLoading,
    error,
  } = useContratoDetalhado(contratoId!, {
    enabled: !!contratoId,
  })

  if (isLoading) {
    return (
      <LayoutPagina titulo="Carregando Contrato...">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </LayoutPagina>
    )
  }

  if (error || !contrato) {
    return (
      <LayoutPagina
        titulo="Erro"
        descricao="Não foi possível carregar o contrato."
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de Carregamento</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao buscar os detalhes do contrato. Por favor, tente
            novamente mais tarde.
          </AlertDescription>
        </Alert>
      </LayoutPagina>
    )
  }

  return (
    <LayoutPagina
      titulo={`Contrato ${contrato.numeroContrato || 'Sem número'}`}
      descricao={contrato.objeto || 'Contrato sem objeto definido.'}
    >
      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="alteracoes">Registro de Alterações</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          <DetalhesContrato contrato={contrato} />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <TabDocumentos contratoId={contrato.id} />
          <Separator />
          <ListaDocumentosContrato contratoId={contrato.id} />
        </TabsContent>

        <TabsContent value="alteracoes">
          {/* <RegistroAlteracoes alteracoes={contrato.alteracoes} /> */}
          <p>Área para o registro de alterações.</p>
        </TabsContent>
      </Tabs>
    </LayoutPagina>
  )
}

export default ContratoDetailPage
