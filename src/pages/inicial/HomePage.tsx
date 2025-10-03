import LayoutPagina from '@/components/layout-pagina'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const HomePage = () => {
  return (
    <LayoutPagina
      titulo="Painel de Controle"
      descricao="Visão geral do sistema de contratos"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Sistema de Contratos da Prefeitura - CAC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contratos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">--</p>
            <p className="text-sm text-gray-600">Total de contratos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">--</p>
            <p className="text-sm text-gray-600">Fornecedores cadastrados</p>
          </CardContent>
        </Card>
      </div>
    </LayoutPagina>
  )
}

export default HomePage
