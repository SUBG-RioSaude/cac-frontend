import { Routes, Route } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import PageBreadcrumb from '@/components/page-breadcrumb'
import ContratoDetailPage from './pages/contratos/ContratoDetailPage'
import ContratosPage from './pages/contratos/ContratosPage'
import FornecedorDetailPage from './pages/fornecedores/FornecedorDetailPage'
import FornecedoresPage from './pages/fornecedores/FornecedoresPage'
import HomePage from './pages/inicial/HomePage'




function App() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <div className="flex flex-col">
            <div className="border-b p-4">
              <PageBreadcrumb />
            </div>
            <div className="p-4">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/contratos" element={<ContratosPage />} />
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
