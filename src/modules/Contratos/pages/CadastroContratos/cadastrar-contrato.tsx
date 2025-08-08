import LayoutPagina from '@/components/layout-pagina'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Steps } from '@/components/ui/steps'
import { useState, useCallback, Suspense } from 'react'
import { ErrorBoundary, FormErrorBoundary } from '@/components/error-boundary'
import { FormLoadingFallback } from '@/components/ui/loading'
import { Building2, FileText, Store, Clipboard, FileCheck, Zap } from 'lucide-react'
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
import { CheckCircle, Clock } from 'lucide-react'
import { cnpjUtils } from '@/lib/utils'

// Componente para mostrar status dos campos
function StatusField({
  label,
  completed,
}: {
  label: string
  completed: boolean
}) {
  return (
    <div
      className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        completed
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {completed ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span>{label}</span>
    </div>
  )
}

// Funções de validação real dos dados
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidCEP = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/
  return cepRegex.test(cep)
}

const isValidValor = (valor: string): boolean => {
  if (!valor) return false
  const numericValue = valor.replace(/[^\d.,]/g, '').replace(',', '.')
  const num = parseFloat(numericValue)
  return !isNaN(num) && num > 0
}

const isValidData = (data: string): boolean => {
  if (!data) return false
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(data)) return false
  const dateObj = new Date(data)
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}

const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const hasValidContacts = (
  contatos?: Array<{ nome?: string; valor?: string; tipo: string }>,
): boolean => {
  if (!contatos || contatos.length === 0) return false
  return contatos.some((contato) => {
    if (!contato.nome || !contato.valor) return false
    if (contato.tipo === 'Email') {
      return isValidEmail(contato.valor)
    }
    return contato.valor.length >= 8 // Telefones devem ter pelo menos 8 dígitos
  })
}

interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
}

export default function CadastrarContrato() {
  const [passoAtual, setPassoAtual] = useState(1)
  const [dadosCompletos, setDadosCompletos] = useState<DadosCompletos>({})

  // Estados para validação em tempo real
  const [dadosTemporarios, setDadosTemporarios] = useState<DadosCompletos>({})

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

  // Funções para atualização em tempo real
  const handleDadosFornecedorChange = useCallback((dados: Partial<DadosFornecedor>) => {
    setDadosTemporarios((prev) => ({
      ...prev,
      fornecedor: {
        ...prev.fornecedor,
        ...dados,
      } as DadosFornecedor,
    }))
  }, [])

  const handleDadosContratoChange = useCallback((dados: Partial<DadosContrato>) => {
    setDadosTemporarios((prev) => ({
      ...prev,
      contrato: {
        ...prev.contrato,
        ...dados,
      } as DadosContrato,
    }))
  }, [])

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
                onDataChange={handleDadosFornecedorChange}
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
                onDataChange={handleDadosContratoChange}
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
      <Card className="border-sidebar-primary/20 border bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="border-sidebar-primary/10 from-sidebar-primary/5 border-b bg-gradient-to-r to-white px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-sidebar-primary/10 flex h-10 w-10 items-center justify-center rounded-lg text-lg shadow-sm">
              <span className="text-sidebar-primary">{currentStepInfo.icone}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {currentStepInfo.titulo}
              </CardTitle>
              <p className="text-sidebar-primary/70 text-sm">
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

  // Obter informações do step atual
  const stepInfo = getStepInfo(passoAtual)

  return (
    <LayoutPagina
      titulo="Cadastrar Contrato"
      descricao="Cadastre um novo contrato seguindo as etapas abaixo"
      className="px-6"
    >
      {/* Painel de Validação e Status */}
      <div className="border-sidebar-primary/20 to-sidebar-primary/5 rounded-lg border bg-gradient-to-r from-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-sidebar-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <div className="text-sidebar-primary">
                  {stepInfo.icone}
                </div>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {passoAtual === 1 && 'Dados do Fornecedor'}
                  {passoAtual === 2 && 'Informações do Contrato'}
                  {passoAtual === 3 && 'Unidades do Contrato'}
                </h2>
                <p className="text-xs text-gray-500">
                  Etapa {passoAtual} de {passos.length} •{' '}
                  {((passoAtual / passos.length) * 100).toFixed(0)}% concluído
                </p>
              </div>
            </div>

            {/* Status dos campos obrigatórios */}
            <div className="flex flex-wrap gap-2">
              {passoAtual === 1 && (
                <>
                  <StatusField
                    label="CNPJ"
                    completed={cnpjUtils.validar(
                      dadosTemporarios.fornecedor?.cnpj ||
                        dadosCompletos.fornecedor?.cnpj ||
                        '',
                    )}
                  />
                  <StatusField
                    label="Razão Social"
                    completed={
                      !!(
                        (
                          dadosTemporarios.fornecedor?.razaoSocial ||
                          dadosCompletos.fornecedor?.razaoSocial ||
                          ''
                        ).trim().length >= 3
                      )
                    }
                  />
                  <StatusField
                    label="Endereço"
                    completed={
                      !!(
                        (
                          dadosTemporarios.fornecedor?.endereco ||
                          dadosCompletos.fornecedor?.endereco ||
                          ''
                        ).trim().length >= 10 &&
                        isValidCEP(
                          dadosTemporarios.fornecedor?.cep ||
                            dadosCompletos.fornecedor?.cep ||
                            '',
                        )
                      )
                    }
                  />
                  <StatusField
                    label="Contatos"
                    completed={hasValidContacts(
                      dadosTemporarios.fornecedor?.contatos ||
                        dadosCompletos.fornecedor?.contatos,
                    )}
                  />
                </>
              )}
              {passoAtual === 2 && (
                <>
                  <StatusField
                    label="Nº Contrato"
                    completed={
                      !!(
                        (
                          dadosTemporarios.contrato?.numeroContrato ||
                          dadosCompletos.contrato?.numeroContrato ||
                          ''
                        ).trim().length >= 5
                      )
                    }
                  />
                  <StatusField
                    label="Processo SEI"
                    completed={
                      !!(
                        (
                          dadosTemporarios.contrato?.processoSei ||
                          dadosCompletos.contrato?.processoSei ||
                          ''
                        ).trim().length >= 10
                      )
                    }
                  />
                  <StatusField
                    label="Vigência"
                    completed={
                      isValidData(
                        dadosTemporarios.contrato?.vigenciaInicial ||
                          dadosCompletos.contrato?.vigenciaInicial ||
                          '',
                      ) &&
                      isValidData(
                        dadosTemporarios.contrato?.vigenciaFinal ||
                          dadosCompletos.contrato?.vigenciaFinal ||
                          '',
                      ) &&
                      new Date(
                        dadosTemporarios.contrato?.vigenciaFinal ||
                          dadosCompletos.contrato?.vigenciaFinal ||
                          '',
                      ) >
                        new Date(
                          dadosTemporarios.contrato?.vigenciaInicial ||
                            dadosCompletos.contrato?.vigenciaInicial ||
                            '',
                        )
                    }
                  />
                  <StatusField
                    label="Valor"
                    completed={isValidValor(
                      dadosTemporarios.contrato?.valorGlobal ||
                        dadosCompletos.contrato?.valorGlobal ||
                        '',
                    )}
                  />
                  <StatusField
                    label="Termo Ref."
                    completed={(() => {
                      const termoRef =
                        dadosTemporarios.contrato?.termoReferencia ||
                        dadosCompletos.contrato?.termoReferencia ||
                        ''
                      const tipoTermo =
                        dadosTemporarios.contrato?.tipoTermoReferencia ||
                        dadosCompletos.contrato?.tipoTermoReferencia

                      if (!termoRef.trim()) return false

                      if (tipoTermo === 'texto_livre') {
                        return termoRef.trim().length >= 20
                      } else {
                        return isValidURL(termoRef)
                      }
                    })()}
                  />
                </>
              )}
              {passoAtual === 3 && (
                <>
                  <StatusField
                    label="Unidades"
                    completed={(() => {
                      const unidades =
                        dadosTemporarios.unidades?.unidades ||
                        dadosCompletos.unidades?.unidades ||
                        []
                      return (
                        unidades.length > 0 &&
                        unidades.every(
                          (unidade) =>
                            unidade.nome?.trim().length >= 3 &&
                            unidade.endereco?.trim().length >= 10 &&
                            isValidCEP(unidade.cep || '') &&
                            isValidEmail(unidade.email || '') &&
                            parseFloat(unidade.valorAlocado || '0') > 0,
                        )
                      )
                    })()}
                  />
                  <StatusField
                    label="Distribuição"
                    completed={(() => {
                      const unidades =
                        dadosTemporarios.unidades?.unidades ||
                        dadosCompletos.unidades?.unidades ||
                        []
                      if (unidades.length === 0) return false

                      const totalPercentual = unidades.reduce(
                        (sum, unidade) =>
                          sum + (unidade.percentualContrato || 0),
                        0,
                      )
                      return Math.abs(totalPercentual - 100) < 0.01 // Permite pequena diferença por arredondamento
                    })()}
                  />
                </>
              )}
            </div>
          </div>

          {/* Indicador visual de progresso */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex h-2 w-20 overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-sidebar-primary transition-all duration-500"
                style={{ width: `${(passoAtual / passos.length) * 100}%` }}
              />
            </div>
            <span className="text-sidebar-primary text-xs font-medium">
              {passoAtual}/{passos.length}
            </span>
          </div>
        </div>
      </div>

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
