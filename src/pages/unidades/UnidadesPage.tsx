import LayoutPagina from '@/components/layout-pagina'
import UnidadesListPage from '@/modules/Unidades/ListaUnidades/pages/unidades-list-page'

const UnidadesPage = () => {
  return (
    <LayoutPagina>
      <main className="flex-1 overflow-auto">
        <UnidadesListPage />
      </main>
    </LayoutPagina>
  )
}

export default UnidadesPage
