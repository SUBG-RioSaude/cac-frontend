import LayoutPagina from '@/components/layout-pagina'
import FornecedoresListPage from '@/modules/Fornecedores/ListaFornecedores/pages/fornecedores-page'

const FornecedoresPage = () => {
  return (
    <LayoutPagina>
      <main className="flex-1 overflow-auto">
        <FornecedoresListPage />
      </main>
    </LayoutPagina>
  )
}

export default FornecedoresPage
