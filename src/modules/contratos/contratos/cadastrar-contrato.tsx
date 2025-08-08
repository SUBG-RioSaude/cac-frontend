import LayoutPagina from '@/components/layout-pagina'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Steps } from '@/components/ui/steps'
import { useState } from 'react'
import FornecedorForm, {
  type DadosFornecedor,
} from '../components/CadastroDeContratos/fornecedor-form'
import ContratoForm, { type DadosContrato } from '../components/CadastroDeContratos/contrato-form'
import UnidadesForm, { type DadosUnidades } from '../components/CadastroDeContratos/unidades-form'
import ConfirmarAvancoModal from '../components/CadastroDeContratos/confirmar-avanco'

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
      // Finalizar cadastro
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
      // Avançar para próximo step
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

    // Reset estados
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

  // Funções para requisições de avanço (mostram modal)
  const handleFornecedorAdvanceRequest = (dados: DadosFornecedor) => {
    console.log('🔥 handleFornecedorAdvanceRequest chamado', dados)
    setDadosPendentes(dados)
    setProximoPassoPendente(2)
    setModalAberto(true)
    console.log('🔥 Modal deveria estar aberto agora')
  }

  const handleContratoAdvanceRequest = (dados: DadosContrato) => {
    console.log('🔥 handleContratoAdvanceRequest chamado', dados)
    setDadosPendentes(dados)
    setProximoPassoPendente(3)
    setModalAberto(true)
    console.log('🔥 Modal deveria estar aberto agora')
  }

  const handleFinishRequest = (dados: DadosUnidades) => {
    console.log('🔥 handleFinishRequest chamado', dados)
    setDadosPendentes(dados)
    setIsFinishing(true)
    setModalAberto(true)
    console.log('🔥 Modal deveria estar aberto agora')
  }

  // Funções para submit direto (fallback)
  const handleFornecedorSubmit = (dados: DadosFornecedor) => {
    setDadosCompletos((prev) => ({ ...prev, fornecedor: dados }))
    setPassoAtual(2)
  }

  const handleContratoSubmit = (dados: DadosContrato) => {
    setDadosCompletos((prev) => ({ ...prev, contrato: dados }))
    setPassoAtual(3)
  }

  const handleUnidadesSubmit = (dados: DadosUnidades) => {
    setDadosCompletos((prev) => ({ ...prev, unidades: dados }))

    // Aqui você pode implementar a lógica para salvar os dados completos
    console.log('Dados completos do cadastro:', {
      ...dadosCompletos,
      unidades: dados,
    })

    // Por exemplo, fazer uma chamada à API
    // await salvarContrato(dadosCompletos)

    alert('Contrato cadastrado com sucesso!')
  }

  const renderStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <FornecedorForm
            onSubmit={handleFornecedorSubmit}
            onAdvanceRequest={handleFornecedorAdvanceRequest}
            dadosIniciais={dadosCompletos.fornecedor}
          />
        )
      case 2:
        return (
          <ContratoForm
            onSubmit={handleContratoSubmit}
            onAdvanceRequest={handleContratoAdvanceRequest}
            onPrevious={() => setPassoAtual(1)}
            dadosIniciais={dadosCompletos.contrato}
          />
        )
      case 3:
        return (
          <UnidadesForm
            onSubmit={handleUnidadesSubmit}
            onFinishRequest={handleFinishRequest}
            onPrevious={() => setPassoAtual(2)}
            dadosIniciais={dadosCompletos.unidades}
            valorTotalContrato={parseFloat(
              dadosCompletos.contrato?.valorTotal || '0',
            )}
          />
        )
      default:
        return null
    }
  }

  const renderStepContentWithCard = (currentStep: number) => {
    const getTituloStep = () => {
      switch (currentStep) {
        case 1:
          return 'Dados do Fornecedor'
        case 2:
          return 'Dados do Contrato'
        case 3:
          return 'Unidades Contempladas'
        default:
          return ''
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTituloStep()}</CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent(currentStep)}</CardContent>
      </Card>
    )
  }

  return (
    <LayoutPagina
      titulo="Cadastrar Contrato"
      descricao="Cadastre um novo contrato"
    >
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
            : `Deseja avançar para a etapa "${proximoPassoPendente ? passos[proximoPassoPendente - 1]?.title : ''}"? Esta ação confirmará os dados preenchidos na etapa atual.`
        }
        textoConfirmar={isFinishing ? 'Finalizar Cadastro' : 'Confirmar'}
      />
    </LayoutPagina>
  )
}
