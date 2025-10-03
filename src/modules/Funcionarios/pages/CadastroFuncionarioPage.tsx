import { UserPlus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CadastroFuncionarioForm } from '@/modules/Funcionarios/components/CadastroFuncionarioForm'

const CadastroFuncionarioPage = () => {
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <UserPlus className="h-6 w-6 text-gray-600" />
          Cadastro de Funcionários
        </h1>
        <p className="text-muted-foreground text-sm">
          Preencha os dados para cadastrar um novo funcionário.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <CadastroFuncionarioForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default CadastroFuncionarioPage
