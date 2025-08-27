"use client"

import LayoutPagina from "@/components/layout-pagina"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps } from "@/components/ui/steps"
import { useState, Suspense } from "react"
import { FormErrorBoundary } from "@/components/error-boundary"
import { FormLoadingFallback } from "@/components/ui/loading"
import { Building2, FileText, Store, UserCheck } from "lucide-react"
import FornecedorForm, {
  type DadosFornecedor,
} from "@/modules/Contratos/components/CadastroDeContratos/fornecedor-form"
import ContratoForm, { type DadosContrato } from "@/modules/Contratos/components/CadastroDeContratos/contrato-form"
import UnidadesFormMelhorado from "@/modules/Contratos/components/CadastroDeContratos/unidades-form"
import type { DadosUnidades } from "@/modules/Contratos/types/unidades"
import AtribuicaoFiscaisForm, { type DadosAtribuicao } from "@/modules/Contratos/components/CadastroDeContratos/atribuicao-fiscais-form"
import ConfirmarAvancoModal from "@/modules/Contratos/components/CadastroDeContratos/confirmar-avanco"

interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
  atribuicao?: DadosAtribuicao
}

export default function CadastrarContrato() {
  const [passoAtual, setPassoAtual] = useState(1)
  const [dadosCompletos, setDadosCompletos] = useState<DadosCompletos>({})

  const [modalAberto, setModalAberto] = useState(false)
  const [proximoPassoPendente, setProximoPassoPendente] = useState<number | null>(null)
  const [dadosPendentes, setDadosPendentes] = useState<
    DadosFornecedor | DadosContrato | DadosUnidades | DadosAtribuicao | null
  >(null)
  const [isFinishing, setIsFinishing] = useState(false)

  const passos = [
    { title: "Dados do Fornecedor" },
    { title: "Dados do Contrato" },
    { title: "Unidades Contempladas" },
    { title: "Atribuição de Fiscais" },
  ]

  const handleStepChange = (novoStep: number) => {
    setPassoAtual(novoStep)
  }

  const handleConfirmarAvanco = () => {
    if (isFinishing && dadosPendentes) {
      setDadosCompletos((prev) => ({
        ...prev,
        atribuicao: dadosPendentes as DadosAtribuicao,
      }))
      console.log("Dados completos do cadastro:", {
        ...dadosCompletos,
        atribuicao: dadosPendentes,
      })
      alert("Contrato cadastrado com sucesso!")
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
      } else if (proximoPassoPendente === 4) {
        setDadosCompletos((prev) => ({
          ...prev,
          unidades: dadosPendentes as DadosUnidades,
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

  const handleUnidadesAdvanceRequest = (dados: DadosUnidades) => {
    setDadosPendentes(dados)
    setProximoPassoPendente(4)
    setModalAberto(true)
  }

  const handleFinishRequest = (dados: DadosAtribuicao) => {
    setDadosPendentes(dados)
    setIsFinishing(true)
    setModalAberto(true)
  }

  const handleFornecedorSubmit = (dados: DadosFornecedor) => {
    setDadosCompletos((prev) => ({ ...prev, fornecedor: dados }))
    console.log("Dados do fornecedor:", dados)
    setPassoAtual(2)
  }

  const handleContratoSubmit = (dados: DadosContrato) => {
    setDadosCompletos((prev) => ({ ...prev, contrato: dados }))
    console.log("Dados do contrato:", dados)
    setPassoAtual(3)
  }

  const handleValorContratoChange = (valor: number) => {
    console.log('handleValorContratoChange chamado com valor:', valor)
    
    // Atualizar o valor total do contrato para uso nas unidades
    setDadosCompletos((prev) => ({
      ...prev,
      contrato: prev.contrato ? { 
        ...prev.contrato, 
        valorGlobal: valor.toString() // Armazenar como string numérica
      } : undefined
    }))
  }

  const handleUnidadesSubmit = (dados: DadosUnidades) => {
    setDadosCompletos((prev) => ({ ...prev, unidades: dados }))
    console.log("Dados das unidades:", dados)
    setPassoAtual(4)
  }

  const handleAtribuicaoSubmit = (dados: DadosAtribuicao) => {
    setDadosCompletos((prev) => ({ ...prev, atribuicao: dados }))
    console.log("Dados da atribuição:", dados)

    console.log("Dados completos do cadastro:", {
      ...dadosCompletos,
      atribuicao: dados,
    })

    alert("Contrato cadastrado com sucesso!")
  }

  // Função para obter informações do step atual
  const getStepInfo = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return {
          titulo: "Dados do Fornecedor",
          descricao: "Preencha as informações básicas da empresa fornecedora",
          icone: <Building2 className="h-4 w-4" aria-hidden="true" />,
        }
      case 2:
        return {
          titulo: "Dados do Contrato",
          descricao: "Configure os detalhes e especificações do contrato",
          icone: <FileText className="h-4 w-4" aria-hidden="true" />,
        }
      case 3:
        return {
          titulo: "Unidades Contempladas",
          descricao: "Defina as unidades que farão parte deste contrato",
          icone: <Store className="h-4 w-4" aria-hidden="true" />,
        }
      case 4:
        return {
          titulo: "Atribuição de Fiscais",
          descricao: "Atribua fiscais e gestores responsáveis pelo contrato",
          icone: <UserCheck className="h-4 w-4" aria-hidden="true" />,
        }
      default:
        return { titulo: "", descricao: "", icone: null }
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
                onValorContratoChange={handleValorContratoChange}
              />
            </Suspense>
          </FormErrorBoundary>
        )
      case 3:
        return (
          <UnidadesFormMelhorado
            onSubmit={handleUnidadesSubmit}
            onFinishRequest={handleUnidadesAdvanceRequest}
            onPrevious={() => setPassoAtual(2)}
            dadosIniciais={dadosCompletos.unidades}
            valorTotalContrato={(() => {
              const valor = dadosCompletos.contrato?.valorGlobal
              if (!valor) return 0
              
              // Se for string formatada (R$ 1.234,56), converter para número
              if (typeof valor === 'string' && valor.includes('R$')) {
                const valorLimpo = valor.replace(/[^\d,]/g, '').replace(',', '.')
                const valorNum = parseFloat(valorLimpo)
                console.log('Convertendo valorTotalContrato:', { valor, valorLimpo, valorNum })
                return isNaN(valorNum) ? 0 : valorNum
              }
              
              // Se for string numérica, converter para número
              if (typeof valor === 'string') {
                const valorNum = parseFloat(valor)
                console.log('Convertendo valorTotalContrato string:', { valor, valorNum })
                return isNaN(valorNum) ? 0 : valorNum
              }
              
              // Se já for número, retornar como está
              if (typeof valor === 'number') {
                console.log('valorTotalContrato já é número:', valor)
                return valor
              }
              
              return 0
            })()}
          />
        )
      case 4:
        return (
          <AtribuicaoFiscaisForm
            onSubmit={handleAtribuicaoSubmit}
            onFinishRequest={handleFinishRequest}
            onPrevious={() => setPassoAtual(3)}
            dadosIniciais={dadosCompletos.atribuicao}
          />
        )
      default:
        return null
    }
  }

  const renderStepContentWithCard = (currentStep: number) => {
    const currentStepInfo = getStepInfo(currentStep)

    return (
      <Card className="border border-slate-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-100 to-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg shadow-sm">
              <span className="text-slate-600">{currentStepInfo.icone}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{currentStepInfo.titulo}</CardTitle>
              <p className="text-sm text-slate-600">{currentStepInfo.descricao}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">{renderStepContent(currentStep)}</CardContent>
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
        titulo={isFinishing ? "Confirmar Finalização" : "Confirmar Avanço para Próxima Etapa"}
        descricao={
          isFinishing
            ? "Tem certeza que deseja finalizar o cadastro do contrato? Após confirmar, todos os dados serão salvos e não poderão ser alterados."
            : `Deseja avançar para a etapa "${proximoPassoPendente ? passos[proximoPassoPendente - 1]?.title : ""}"? Esta ação confirmará os dados preenchidos na etapa atual.`
        }
        textoConfirmar={isFinishing ? "Finalizar Cadastro" : "Confirmar"}
      />
    </LayoutPagina>
  )
}
