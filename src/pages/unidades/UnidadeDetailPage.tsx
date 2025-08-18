import LayoutPagina from '@/components/layout-pagina'
import { UnidadeDetalhesPage } from '@/modules/Unidades/UnidadeDetalhes/pages/UnidadeDetalhesPage'

function UnidadeDetailPage() {
  return (
    <LayoutPagina>
      <main className="flex-1 overflow-auto">
        <UnidadeDetalhesPage />
      </main>
    </LayoutPagina>
  )
}

export default UnidadeDetailPage