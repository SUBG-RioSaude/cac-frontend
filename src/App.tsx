import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AuthFlowGuard } from '@/lib/middleware'
import { LayoutAuthenticated } from '@/components/layout-authenticated'
import LoginForm from './pages/auth/login'
import ForgotPasswordForm from './pages/auth/forgot-password-form'
import ResetPasswordForm from './pages/auth/reset-password-form'
import VerifyForm from './pages/auth/verify-form'
import NotFound from './modules/http-codes/404'
import ServerError from './modules/http-codes/500'
import Unauthorized from './modules/http-codes/401'
import BadRequest from './modules/http-codes/400'
import Forbidden from './modules/http-codes/403'
import ServiceUnavailable from './modules/http-codes/503'
import UnidadeDetailPage from './pages/unidades/UnidadeDetailPage'
import UnidadesPage from './pages/unidades/UnidadesPage'
import FornecedorDetailPage from './pages/fornecedores/FornecedorDetailPage'
import FornecedoresPage from './pages/fornecedores/FornecedoresPage'
import VisualizarContrato from './pages/contratos/ContratoDetailPage'
import CadastrarContrato from './modules/Contratos/pages/CadastroContratos/cadastrar-contrato'
import { ContratosPage } from './modules/Contratos/pages/VisualizacaoContratos/ContratosListPage'

function App() {
  return (
    <Routes>
      {/* Rotas de erro (acessíveis sem autenticação) */}
      <Route path="/500" element={<ServerError />} />
      <Route path="/401" element={<Unauthorized />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/400" element={<BadRequest />} />
      <Route path="/503" element={<ServiceUnavailable />} />

      {/* Rotas de autenticação */}
      <Route path="/auth" element={<AuthFlowGuard />}>
        <Route path="login" element={<LoginForm />} />
        <Route path="esqueci-senha" element={<ForgotPasswordForm />} />
        <Route path="verificar-codigo" element={<VerifyForm />} />
        <Route path="trocar-senha" element={<ResetPasswordForm />} />
      </Route>

      {/* Rotas de autenticação diretas (para compatibilidade) */}
      <Route element={<AuthFlowGuard />}>
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/esqueci-senha" element={<Navigate to="/auth/esqueci-senha" replace />} />
        <Route path="/verificar-codigo" element={<Navigate to="/auth/verificar-codigo" replace />} />
      </Route>

      {/* Rota de troca de senha */}
      <Route path="/trocar-senha" element={<Navigate to="/auth/trocar-senha" replace />} />

      {/* Rota raiz - redireciona baseado no estado de autenticação */}
      <Route path="/" element={
        <ProtectedRoute requireAuth={true}>
          <LayoutAuthenticated>
            <Navigate to="/dashboard" replace />
          </LayoutAuthenticated>
        </ProtectedRoute>
      } />

        {/* Rotas protegidas principais com layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>Bem-vindo ao sistema! Esta é uma rota protegida.</p>
              </div>
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />

        {/* Rotas de Contratos */}
        <Route path="/contratos/cadastrar" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <CadastrarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/contratos" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <ContratosPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/contratos/:contratoId" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <VisualizarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/contratos/:id/editar" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <VisualizarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />

        {/* Rotas de Fornecedores */}
        <Route path="/fornecedores" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <FornecedoresPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/fornecedores/:fornecedorId" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <FornecedorDetailPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />

        {/* Rotas de Unidades */}
        <Route path="/unidades" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <UnidadesPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/unidades/:unidadeId" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <UnidadeDetailPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />

        <Route path="/perfil" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
                <p>Gerencie suas informações pessoais.</p>
              </div>
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />
        <Route path="/configuracoes" element={
          <ProtectedRoute requireAuth={true}>
            <LayoutAuthenticated>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p>Configure suas preferências do sistema.</p>
              </div>
            </LayoutAuthenticated>
          </ProtectedRoute>
        } />

      {/* Rota de fallback - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
