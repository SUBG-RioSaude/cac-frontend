import LayoutPagina from '@/components/layout-pagina'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function ContratosPage() {
  return (
    <LayoutPagina
      titulo="Contratos"
      descricao="Gerencie todos os contratos do sistema"
    >
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Aqui será exibida a lista de contratos do sistema.
          </p>
        </CardContent>
      </Card>
    </LayoutPagina>
  )
}

export default ContratosPage
