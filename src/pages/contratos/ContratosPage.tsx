import LayoutPagina from '@/components/layout-pagina'
import { ContratosPage as ContratosPageModerna } from '@/modules/Contratos/pages/VisualizacaoContratos/ContratosListPage'

function ContratosPage() {
  return (
    <LayoutPagina>
      <main className="flex-1 overflow-auto">
        <ContratosPageModerna />
      </main>
    </LayoutPagina>
  )
}

export default ContratosPage
