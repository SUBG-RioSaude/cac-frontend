import { Routes, Route } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import PageBreadcrumb from '@/components/page-breadcrumb'
import ContratoDetailPage from './modules/contratos/pages/ContratoDetailPage'
import ContratosPage from './modules/contratos/pages/ContratosPage'
import FornecedorDetailPage from './pages/fornecedores/FornecedorDetailPage'
import FornecedoresPage from './pages/fornecedores/FornecedoresPage'
import HomePage from './pages/inicial/HomePage'
import CadastrarContrato from './modules/contratos/pages/cadastrar-contrato'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header fixo - nunca sai da tela */}
        <header className="flex-shrink-0 border-b border-gray-100 bg-white shadow-sm">
          <div className="px-6 py-4">
            <PageBreadcrumb />
          </div>
        </header>

        {/* Conteúdo principal com scroll */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/contratos/cadastrar" element={<CadastrarContrato />} />
              <Route
                path="/contratos/:contratoId"
                element={<ContratoDetailPage />}
              />
              <Route path="/fornecedores" element={<FornecedoresPage />} />
              <Route
                path="/fornecedores/:fornecedorId"
                element={<FornecedorDetailPage />}
              />
            </Routes>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
