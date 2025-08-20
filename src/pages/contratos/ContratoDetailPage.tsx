import { useParams } from 'react-router-dom'
import LayoutPagina from '@/components/layout-pagina'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function ContratoDetailPage() {
  const { contratoId } = useParams<{ contratoId: string }>()

  return (
    <LayoutPagina
      titulo={`Contrato ${contratoId}`}
      descricao="Detalhes e informações completas do contrato"
    >
      <Card>
        <CardHeader>
          <CardTitle>Informações do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Aqui serão exibidos os detalhes completos do contrato ID:{' '}
            {contratoId}
          </p>  
        </CardContent>
      </Card>
    </LayoutPagina>
  )
}

export default ContratoDetailPage
