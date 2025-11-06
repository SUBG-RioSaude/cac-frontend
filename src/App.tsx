import { Routes, Route, Navigate } from 'react-router-dom'

import { LayoutAuthenticated } from '@/components/layout-authenticated'
import { ProtectedRoute, AuthFlowGuard } from '@/lib/middleware'

import CadastrarContrato from './modules/Contratos/pages/CadastroContratos/cadastrar-contrato'
import { ContratosPage } from './modules/Contratos/pages/VisualizacaoContratos/contratos-list-page'
import { VisualizarContrato } from './modules/Contratos/pages/VisualizacaoContratos/visualizar-contrato'
import { DashboardPage } from './modules/Dashboard/pages/dashboard-page'
import VisualizacaoFornecedorPage from './modules/Fornecedores/VisualizacaoFornecedor/pages/visualizacao-fornecedor-page'
import CadastroFuncionarioPage from './modules/Funcionarios/CadastroFuncionario/pages/cadastro-funcionario-page'
import BadRequest from './modules/http-codes/400'
import Unauthorized from './modules/http-codes/401'
import Forbidden from './modules/http-codes/403'
import NotFound from './modules/http-codes/404'
import ServerError from './modules/http-codes/500'
import ServiceUnavailable from './modules/http-codes/503'
import ForgotPasswordForm from './pages/auth/forgot-password-form'
import LoginForm from './pages/auth/login'
import ResetPasswordForm from './pages/auth/reset-password-form'
import VerifyForm from './pages/auth/verify-form'
import FornecedoresPage from './pages/fornecedores/fornecedores-page'
import UnidadeDetailPage from './pages/unidades/UnidadeDetailPage'
import UnidadesPage from './pages/unidades/UnidadesPage'

const App = () => {
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
        <Route
          path="/esqueci-senha"
          element={<Navigate to="/auth/esqueci-senha" replace />}
        />
        <Route
          path="/verificar-codigo"
          element={<Navigate to="/auth/verificar-codigo" replace />}
        />
      </Route>

      {/* Rota de troca de senha */}
      <Route
        path="/trocar-senha"
        element={<Navigate to="/auth/trocar-senha" replace />}
      />

      {/* Rota raiz - Dashboard/Início */}
      <Route
        path="/"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <DashboardPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />

      {/* Rota dashboard - redireciona para a raiz para manter compatibilidade */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />

      {/* Rotas de Contratos */}
      <Route
        path="/contratos/cadastrar"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <CadastrarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      {/* Rotas de Funcionários */}
      <Route
        path="/funcionarios/cadastrar"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <CadastroFuncionarioPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/contratos"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <ContratosPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/contratos/:contratoId"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <VisualizarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/contratos/:id/editar"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <VisualizarContrato />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />

      {/* Rotas de Fornecedores */}
      <Route
        path="/fornecedores"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <FornecedoresPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/fornecedores/:fornecedorId"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <VisualizacaoFornecedorPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />

      {/* Rotas de Unidades */}
      <Route
        path="/unidades"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <UnidadesPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/unidades/:unidadeId"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <UnidadeDetailPage />
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />

      <Route
        path="/perfil"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
                <p>Gerencie suas informações pessoais.</p>
              </div>
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/configuracoes"
        element={(
          <ProtectedRoute requireAuth>
            <LayoutAuthenticated>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p>Configure suas preferências do sistema.</p>
              </div>
            </LayoutAuthenticated>
          </ProtectedRoute>
        )}
      />

      {/* Rota de fallback - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
