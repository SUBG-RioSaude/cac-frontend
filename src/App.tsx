import { Routes, Route } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import PageBreadcrumb from '@/components/page-breadcrumb'
import { NotificacoesDropdown } from '@/components/notificacoes-dropdown'
import ContratoDetailPage from './pages/contratos/ContratoDetailPage'
import ContratosPage from './pages/contratos/ContratosPage'
import FornecedorDetailPage from './pages/fornecedores/FornecedorDetailPage'
import FornecedoresPage from './pages/fornecedores/FornecedoresPage'
import HomePage from './pages/inicial/HomePage'
import CadastrarContrato from './modules/Contratos/pages/CadastroContratos/cadastrar-contrato'
import { VisualizarContrato } from './modules/Contratos/pages/VisualizacaoContratos/VisualizarContrato'
import { ErrorBoundary } from './components/error-boundary'
import NotFound from './modules/http-codes/404'
import ServerError from './modules/http-codes/500'
import Unauthorized from './modules/http-codes/401'
import BadRequest from './modules/http-codes/400'
import Forbidden from './modules/http-codes/403'
import ServiceUnavailable from './modules/http-codes/503'
import UnidadesPage from './pages/unidades/UnidadesPage'
import UnidadeDetailPage from './pages/unidades/UnidadeDetailPage'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header fixo - nunca sai da tela */}
        <header className="flex-shrink-0 border-b border-gray-100 bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <PageBreadcrumb />
            <NotificacoesDropdown />
          </div>
        </header>

        {/* Conteúdo principal com scroll */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <ErrorBoundary>
            <div className="mx-auto px-6">
              <Routes>
                {/* Rotas de erro */}
                <Route path="*" element={<NotFound />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="/401" element={<Unauthorized />} />
                <Route path="/403" element={<Forbidden />} />
                <Route path="/400" element={<BadRequest />} />
                <Route path="/503" element={<ServiceUnavailable />} />
                {/* Rotas de erro */}

                {/* Rotas */}
                <Route path="/" element={<HomePage />} />

                <Route path="/contratos" element={<ContratosPage />} />
                <Route
                  path="/contratos/cadastrar"
                  element={<CadastrarContrato />}
                />
                <Route
                  path="/contratos/:contratoId"
                  element={<ContratoDetailPage />}
                />
                <Route path="/fornecedores" element={<FornecedoresPage />} />
                <Route
                  path="/fornecedores/:fornecedorId"
                  element={<FornecedorDetailPage />}
                />
                <Route
                  path="/contratos/:id/editar"
                  element={<VisualizarContrato />}
                />

                <Route path="/unidades" element={<UnidadesPage />} />
                <Route path="/unidades/:unidadeId" element={<UnidadeDetailPage />} />

              </Routes>
            </div>
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
