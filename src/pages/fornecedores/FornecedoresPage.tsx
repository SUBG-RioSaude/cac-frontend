import LayoutPagina from '@/components/layout-pagina'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function FornecedoresPage() {
  return (
    <LayoutPagina
      titulo="Fornecedores"
      descricao="Gerencie todos os fornecedores cadastrados"
    >
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Aqui será exibida a lista de fornecedores do sistema.
          </p>
        </CardContent>
      </Card>
    </LayoutPagina>
  )
}

export default FornecedoresPage
