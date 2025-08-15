import LayoutPagina from '@/components/layout-pagina'
import UnidadesListPage from '@/modules/Unidades/ListaUnidades/pages/UnidadesListPage'

function UnidadesPage() {
  return (
    <LayoutPagina>
      <main className="flex-1 overflow-auto">
        <UnidadesListPage />
      </main>
    </LayoutPagina>
  )
}

export default UnidadesPage
