import LayoutPagina from '@/components/layout-pagina'
import FornecedoresListPage from '@/modules/Fornecedores/ListaFornecedores/pages/FornecedoresPage'

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
