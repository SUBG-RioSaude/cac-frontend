import { useParams } from 'react-router-dom'
import LayoutPagina from '@/components/layout-pagina'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function FornecedorDetailPage() {
  const { fornecedorId } = useParams<{ fornecedorId: string }>()

  return (
    <LayoutPagina
      titulo={`Fornecedor ${fornecedorId}`}
      descricao="Detalhes e informações completas do fornecedor"
    >
      <Card>
        <CardHeader>
          <CardTitle>Informações do Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Aqui serão exibidos os detalhes completos do fornecedor ID:{' '}
            {fornecedorId}
          </p>
        </CardContent>
      </Card>
    </LayoutPagina>
  )
}

export default FornecedorDetailPage
