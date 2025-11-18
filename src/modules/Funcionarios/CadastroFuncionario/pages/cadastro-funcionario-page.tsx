import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { Stepper, useStepper, type Step } from '@/components/ui/stepper'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

import { AtribuirPermissaoForm } from '../components/atribuir-permissao-form'
import { BuscaCpfForm } from '../components/busca-cpf-form'
import { CadastroFuncionarioForm } from '../components/cadastro-funcionario-form'
import { ModalSucessoCadastro } from '../components/modal-sucesso-cadastro'

type WizardStep = 'busca-cpf' | 'cadastro-funcionario'

const CadastroFuncionarioPage = () => {
  const navigate = useNavigate()
  const { currentStep, next } = useStepper(2)

  // Estado do wizard
  const [funcionarioEncontrado, setFuncionarioEncontrado] =
    useState<FuncionarioApi | null>(null)
  const [cpfBuscado, setCpfBuscado] = useState<string | null>(null)
  const [precisaCadastrarManualmente, setPrecisaCadastrarManualmente] =
    useState(false)
  const [funcionarioId, setFuncionarioId] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [permissoesExistentes, setPermissoesExistentes] = useState<
    {
      sistemaId: string
      sistemaNome: string
      permissoes: {
        id: number
        nome: string
      }[]
    }[]
  >([])

  // Determina qual substep mostrar no Step 1
  const step1Content: WizardStep =
    funcionarioEncontrado || precisaCadastrarManualmente
      ? 'cadastro-funcionario'
      : 'busca-cpf'

  // Configuração dos steps do Stepper visual
  const steps: Step[] = [
    {
      id: 'step-1',
      label: 'Cadastro de Funcionário e Usuário',
      description: 'Buscar funcionário por CPF ou cadastrar manualmente',
      status:
        currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending',
    },
    {
      id: 'step-2',
      label: 'Atribuir Permissão',
      description: 'Definir permissão de acesso ao sistema',
      status:
        currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending',
    },
  ]

  // Handler: Funcionário encontrado na busca por CPF
  const handleFuncionarioEncontrado = (func: FuncionarioApi) => {
    setFuncionarioEncontrado(func)
    setCpfBuscado(func.cpf)
    setPrecisaCadastrarManualmente(false)
  }

  // Handler: CPF não encontrado após 3 retries HTTP, habilitar cadastro manual
  const handleCadastroManual = (cpf: string) => {
    setCpfBuscado(cpf) // Armazena o CPF buscado
    setPrecisaCadastrarManualmente(true)
  }

  // Handler: Usuário criado com sucesso (funcionário encontrado ou cadastrado manualmente)
  const handleUsuarioCriado = (
    funcId: string,
    userId: string,
    permissoes?: {
      sistemaId: string
      sistemaNome: string
      permissoes: {
        id: number
        nome: string
      }[]
    }[]
  ) => {
    setFuncionarioId(funcId)
    setUsuarioId(userId)
    if (permissoes) {
      setPermissoesExistentes(permissoes)
    }
    next() // Vai para Step 2: Atribuir Permissão
  }

  // Handler: Permissão atribuída com sucesso
  const handlePermissaoAtribuida = () => {
    setShowSuccessModal(true)
  }

  // Handler: Fechar modal e ir para dashboard
  const handleCloseModal = () => {
    setShowSuccessModal(false)
    navigate('/')
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <UserPlus className="size-6 text-gray-600" />
          Cadastro de Funcionário, Usuário e Permissões
        </h1>
        <p className="text-sm text-muted-foreground">
          Busque o funcionário na base (ou cadastre manualmente), crie o usuário do
          sistema e atribua permissão de acesso
        </p>
      </div>

      {/* Stepper Visual */}
      <div className="mb-8">
        <Stepper steps={steps} />
      </div>

      {/* Conteúdo do Wizard */}
      <Card>
        <CardContent className="pt-6">
          {/* STEP 1: Buscar Funcionário e Criar Usuário */}
          {currentStep === 0 && (
            <>
              {/* Step 1a: Busca por CPF */}
              {step1Content === 'busca-cpf' && (
                <BuscaCpfForm
                  onFuncionarioEncontrado={handleFuncionarioEncontrado}
                  onCadastroManual={handleCadastroManual}
                />
              )}

              {/* Step 1b: Formulário de Cadastro (modo funcionário encontrado) */}
              {step1Content === 'cadastro-funcionario' &&
                funcionarioEncontrado && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Funcionário encontrado!</strong>
                        <br />
                        Os dados foram preenchidos automaticamente. Revise e crie o
                        usuário do sistema.
                      </p>
                    </div>
                    <CadastroFuncionarioForm
                      funcionarioEncontrado={funcionarioEncontrado}
                      cpfPrefilled={cpfBuscado}
                      onUsuarioCriado={handleUsuarioCriado}
                    />
                  </div>
                )}

              {/* Step 1c: Formulário de Cadastro (modo manual - funcionário não encontrado) */}
              {step1Content === 'cadastro-funcionario' &&
                !funcionarioEncontrado &&
                precisaCadastrarManualmente && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Funcionário não encontrado na base.</strong>
                        <br />
                        Por favor, preencha todos os dados manualmente para cadastrar o
                        funcionário e criar o usuário do sistema.
                      </p>
                    </div>
                    <CadastroFuncionarioForm
                      cpfPrefilled={cpfBuscado}
                      onUsuarioCriado={handleUsuarioCriado}
                    />
                  </div>
                )}
            </>
          )}

          {/* STEP 2: Atribuir Permissão */}
          {currentStep === 1 && funcionarioId && usuarioId && (
            <AtribuirPermissaoForm
              funcionarioId={funcionarioId}
              usuarioId={usuarioId}
              onSuccess={handlePermissaoAtribuida}
              permissoesExistentes={permissoesExistentes.length > 0 ? permissoesExistentes : undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Sucesso */}
      {showSuccessModal && funcionarioId && usuarioId && (
        <ModalSucessoCadastro
          isOpen={showSuccessModal}
          onConfirm={handleCloseModal}
          usuarioId={usuarioId}
          funcionario={{
            nomeCompleto: funcionarioEncontrado?.nomeCompleto ?? 'Funcionário',
            matricula: funcionarioEncontrado?.matricula ?? 'N/A',
          }}
        />
      )}
    </div>
  )
}

export default CadastroFuncionarioPage
