import LayoutPagina from '@/components/layout-pagina'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Steps } from '@/components/ui/steps'
import { useState, Suspense } from 'react'
import { FormErrorBoundary } from '@/components/error-boundary'
import { FormLoadingFallback } from '@/components/ui/loading'
import { Building2, FileText, Store } from 'lucide-react'
import FornecedorForm, {
  type DadosFornecedor,
} from '@/modules/Contratos/components/CadastroDeContratos/fornecedor-form'
import ContratoForm, {
  type DadosContrato,
} from '@/modules/Contratos/components/CadastroDeContratos/contrato-form'
import UnidadesForm, {
  type DadosUnidades,
} from '@/modules/Contratos/components/CadastroDeContratos/unidades-form'
import ConfirmarAvancoModal from '@/modules/Contratos/components/CadastroDeContratos/confirmar-avanco'


interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
}

export default function CadastrarContrato() {
  const [passoAtual, setPassoAtual] = useState(1)
  const [dadosCompletos, setDadosCompletos] = useState<DadosCompletos>({})


  const [modalAberto, setModalAberto] = useState(false)
  const [proximoPassoPendente, setProximoPassoPendente] = useState<
    number | null
  >(null)
  const [dadosPendentes, setDadosPendentes] = useState<
    DadosFornecedor | DadosContrato | DadosUnidades | null
  >(null)
  const [isFinishing, setIsFinishing] = useState(false)

  const passos = [
    { title: 'Dados do Fornecedor' },
    { title: 'Dados do Contrato' },
    { title: 'Unidades Contempladas' },
  ]

  const handleStepChange = (novoStep: number) => {
    setPassoAtual(novoStep)
  }


  const handleConfirmarAvanco = () => {
    if (isFinishing && dadosPendentes) {
      setDadosCompletos((prev) => ({
        ...prev,
        unidades: dadosPendentes as DadosUnidades,
      }))
      console.log('Dados completos do cadastro:', {
        ...dadosCompletos,
        unidades: dadosPendentes,
      })
      alert('Contrato cadastrado com sucesso!')
    } else if (proximoPassoPendente && dadosPendentes) {
      if (proximoPassoPendente === 2) {
        setDadosCompletos((prev) => ({
          ...prev,
          fornecedor: dadosPendentes as DadosFornecedor,
        }))
      } else if (proximoPassoPendente === 3) {
        setDadosCompletos((prev) => ({
          ...prev,
          contrato: dadosPendentes as DadosContrato,
        }))
      }
      setPassoAtual(proximoPassoPendente)
    }

    setProximoPassoPendente(null)
    setDadosPendentes(null)
    setIsFinishing(false)
    setModalAberto(false)
  }

  const handleCancelarAvanco = () => {
    setProximoPassoPendente(null)
    setDadosPendentes(null)
    setIsFinishing(false)
    setModalAberto(false)
  }

  const handleFornecedorAdvanceRequest = (dados: DadosFornecedor) => {
    setDadosPendentes(dados)
    setProximoPassoPendente(2)
    setModalAberto(true)
  }

  const handleContratoAdvanceRequest = (dados: DadosContrato) => {
    setDadosPendentes(dados)
    setProximoPassoPendente(3)
    setModalAberto(true)
  }

  const handleFinishRequest = (dados: DadosUnidades) => {
    setDadosPendentes(dados)
    setIsFinishing(true)
    setModalAberto(true)
  }

  const handleFornecedorSubmit = (dados: DadosFornecedor) => {
    setDadosCompletos((prev) => ({ ...prev, fornecedor: dados }))
    console.log('Dados do fornecedor:', dados)
    setPassoAtual(2)
  }

  const handleContratoSubmit = (dados: DadosContrato) => {
    setDadosCompletos((prev) => ({ ...prev, contrato: dados }))
    console.log('Dados do contrato:', dados)
    setPassoAtual(3)
  }

  const handleUnidadesSubmit = (dados: DadosUnidades) => {
    setDadosCompletos((prev) => ({ ...prev, unidades: dados }))
    console.log('Dados das unidades:', dados)

    // Aqui você pode implementar a lógica para salvar os dados completos
    console.log('Dados completos do cadastro:', {
      ...dadosCompletos,
      unidades: dados,
    })

    // Por exemplo, fazer uma chamada à API
    // await salvarContrato(dadosCompletos)

    alert('Contrato cadastrado com sucesso!')
  }

  // Função para obter informações do step atual
  const getStepInfo = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return {
          titulo: 'Dados do Fornecedor',
          descricao: 'Preencha as informações básicas da empresa fornecedora',
          icone: <Building2 className="h-4 w-4" aria-hidden="true" />,
        }
      case 2:
        return {
          titulo: 'Dados do Contrato',
          descricao: 'Configure os detalhes e especificações do contrato',
          icone: <FileText className="h-4 w-4" aria-hidden="true" />,
        }
      case 3:
        return {
          titulo: 'Unidades Contempladas',
          descricao: 'Defina as unidades que farão parte deste contrato',
          icone: <Store className="h-4 w-4" aria-hidden="true" />,
        }
      default:
        return { titulo: '', descricao: '', icone: null }
    }
  }

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <FormErrorBoundary>
            <Suspense fallback={<FormLoadingFallback />}>
              <FornecedorForm
                onSubmit={handleFornecedorSubmit}
                onAdvanceRequest={handleFornecedorAdvanceRequest}
                dadosIniciais={dadosCompletos.fornecedor}
              />
            </Suspense>
          </FormErrorBoundary>
        )
      case 2:
        return (
          <FormErrorBoundary>
            <Suspense fallback={<FormLoadingFallback />}>
              <ContratoForm
                onSubmit={handleContratoSubmit}
                onAdvanceRequest={handleContratoAdvanceRequest}
                onPrevious={() => setPassoAtual(1)}
                dadosIniciais={dadosCompletos.contrato}
              />
            </Suspense>
          </FormErrorBoundary>
        )
      case 3:
        return (
          <UnidadesForm
            onSubmit={handleUnidadesSubmit}
            onFinishRequest={handleFinishRequest}
            onPrevious={() => setPassoAtual(2)}
            dadosIniciais={dadosCompletos.unidades}
            valorTotalContrato={parseFloat(
              dadosCompletos.contrato?.valorGlobal || '0',
            )}
          />
        )
      default:
        return null
    }
  }

  const renderStepContentWithCard = (currentStep: number) => {
    const currentStepInfo = getStepInfo(currentStep)

    return (
      <Card className="border-slate-200 border bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="border-slate-200 from-slate-100 border-b bg-gradient-to-r to-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 flex h-10 w-10 items-center justify-center rounded-lg text-lg shadow-sm">
              <span className="text-slate-600">{currentStepInfo.icone}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {currentStepInfo.titulo}
              </CardTitle>
              <p className="text-slate-600 text-sm">
                {currentStepInfo.descricao}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderStepContent(currentStep)}
        </CardContent>
      </Card>
    )
  }


  return (
    <LayoutPagina
      titulo="Cadastrar Contrato"
      descricao="Cadastre um novo contrato seguindo as etapas abaixo"
      className="px-6 py-8"
    >

      {/* Steps component */}
      <Steps
        steps={passos}
        currentStep={passoAtual}
        onStepChange={handleStepChange}
        renderStepContent={renderStepContentWithCard}
        showNavigation={false} // Cada formulário terá sua própria navegação
      />

      <ConfirmarAvancoModal
        aberto={modalAberto}
        onConfirmar={handleConfirmarAvanco}
        onCancelar={handleCancelarAvanco}
        titulo={
          isFinishing
            ? 'Confirmar Finalização'
            : 'Confirmar Avanço para Próxima Etapa'
        }
        descricao={
          isFinishing
            ? 'Tem certeza que deseja finalizar o cadastro do contrato? Após confirmar, todos os dados serão salvos e não poderão ser alterados.'
            : `Deseja avançar para a etapa "${
                proximoPassoPendente
                  ? passos[proximoPassoPendente - 1]?.title
                  : ''
              }"? Esta ação confirmará os dados preenchidos na etapa atual.`
        }
        textoConfirmar={isFinishing ? 'Finalizar Cadastro' : 'Confirmar'}
      />
    </LayoutPagina>
  )
}
