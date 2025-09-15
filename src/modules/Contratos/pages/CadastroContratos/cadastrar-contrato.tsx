"use client"

import LayoutPagina from "@/components/layout-pagina"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Steps } from "@/components/ui/steps"
import { useState, Suspense } from "react"
import { useNavigate } from "react-router-dom"
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
import { useCriarContrato, type CriarContratoData } from "@/modules/Contratos/hooks/use-contratos-mutations"
import { toast } from "sonner"
import { cnpjUtils } from "@/lib/utils"

interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
  atribuicao?: DadosAtribuicao
}

export default function CadastrarContrato() {
  const navigate = useNavigate()
  const [passoAtual, setPassoAtual] = useState(1)
  const [dadosCompletos, setDadosCompletos] = useState<DadosCompletos>({})

  const [modalAberto, setModalAberto] = useState(false)
  const [proximoPassoPendente, setProximoPassoPendente] = useState<number | null>(null)
  const [dadosPendentes, setDadosPendentes] = useState<
    DadosFornecedor | DadosContrato | DadosUnidades | DadosAtribuicao | null
  >(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const [empresaCadastradaNaSessao, setEmpresaCadastradaNaSessao] = useState<{cnpj: string, razaoSocial: string} | null>(null)
  // React Query mutation hook
  const createContratoMutation = useCriarContrato()

  const passos = [
    { title: "Dados do Fornecedor" },
    { title: "Dados do Contrato" },
    { title: "Unidades Contempladas" },
    { title: "Atribuição de Fiscais" },
  ]

  const handleStepChange = (novoStep: number) => {
    setPassoAtual(novoStep)
  }

  const handleConfirmarAvanco = async () => {
    // Fechar modal primeiro para evitar travamentos
    setModalAberto(false)
    
    if (isFinishing && dadosPendentes) {
      // Atualizar dados completos primeiro
      const dadosFinais = {
        fornecedor: dadosCompletos.fornecedor,
        contrato: dadosCompletos.contrato,
        unidades: dadosCompletos.unidades,
        atribuicao: dadosPendentes as DadosAtribuicao,
      }
      
      setDadosCompletos((prev) => ({
        ...prev,
        atribuicao: dadosPendentes as DadosAtribuicao,
      }))
      

      try {
        // Mapear dados para API e criar contrato
        const dadosAPI = mapearDadosParaAPI(dadosFinais)
        
        await createContratoMutation.mutateAsync(dadosAPI)
        
        // Sucesso será tratado pelo toast no hook
      } catch (error) {
        // Erro será tratado pelo toast no hook
      }
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

    // Limpar estados pendentes
    setProximoPassoPendente(null)
    setDadosPendentes(null)
    setIsFinishing(false)
  }

  const handleCancelarAvanco = () => {
    // Se uma empresa foi cadastrada nesta sessão, informar o usuário e redirecionar
    if (empresaCadastradaNaSessao) {
      const cnpjFormatado = cnpjUtils.formatar(empresaCadastradaNaSessao.cnpj)
      
      toast.success('Empresa salva com sucesso!', {
        description: `Para continuar o cadastro do contrato, digite o CNPJ ${cnpjFormatado} novamente no formulário.`,
        duration: 8000,
      })
      
      // Redirecionar para listagem de empresas
      setTimeout(() => {
        navigate('/fornecedores')
      }, 1000)
    } else {
      // Se não cadastrou empresa, apenas redirecionar
      navigate('/fornecedores')
    }
    
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
    setPassoAtual(2)
  }

  const handleContratoSubmit = (dados: DadosContrato) => {
    
    setDadosCompletos((prev) => {
      const novosDados = { ...prev, contrato: dados }
      return novosDados
    })
    setPassoAtual(3)
  }

  const handleValorContratoChange = (valor: number) => {
    
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
    setPassoAtual(4)
  }

  // Mapear dados do formulário para API
  const mapearDadosParaAPI = (dadosCompletos: DadosCompletos): CriarContratoData => {
    const { fornecedor, contrato, unidades, atribuicao } = dadosCompletos

    if (!fornecedor || !contrato || !unidades) {
      throw new Error('Dados incompletos para criação do contrato')
    }

    
            // Exigir pelo menos um funcion�rio com cargo definido (Fiscal ou Gestor)
    const atribuicoes = atribuicao?.usuariosAtribuidos || []
    const comTipo = atribuicoes.filter(u => u.tipo === 'fiscal' || u.tipo === 'gestor')
    if (comTipo.length === 0) {
      throw new Error('Atribua pelo menos um Fiscal ou Gestor ao contrato antes de finalizar.')
    }
// Validar: todos os usu�rios atribu�dos devem ter tipo definido (fiscal/gestor)
    const usuariosAtribuidos = atribuicao?.usuariosAtribuidos || []
    const usuariosSemTipo = usuariosAtribuidos.filter(u => u.tipo !== 'fiscal' && u.tipo !== 'gestor')
    if (usuariosSemTipo.length > 0) {
      throw new Error('Defina o cargo (Fiscal ou Gestor) para todos os usu�rios atribu�dos antes de continuar.')
    }
// Valida��oção de campos obrigatórios
    if (!fornecedor.empresaId) {
      throw new Error('ID da empresa não encontrado. Verifique se a empresa foi cadastrada corretamente.')
    }
    
    
    
    

    // Converter valor global para número
    const valorGlobal = (() => {
      const valor = contrato.valorGlobal
      if (!valor) return 0
      
      // Se for string formatada (R$ 1.234,56), converter para número
      if (typeof valor === 'string' && valor.includes('R$')) {
        const valorLimpo = valor.replace(/[^\d,]/g, '').replace(',', '.')
        const valorNum = parseFloat(valorLimpo)
        return isNaN(valorNum) ? 0 : valorNum
      }
      
      // Se for string numérica, converter para número
      if (typeof valor === 'string') {
        const valorNum = parseFloat(valor)
        return isNaN(valorNum) ? 0 : valorNum
      }
      
      // Se já for número, retornar como está
      return typeof valor === 'number' ? valor : 0
    })()

    // Extrair processos do array
    const processoSei = contrato.processos?.find(p => p.tipo === 'sei')?.valor
    const processoRio = contrato.processos?.find(p => p.tipo === 'rio')?.valor
    const processoLegado = contrato.processos?.find(p => p.tipo === 'fisico')?.valor

    const payload: CriarContratoData = {
      numeroContrato: contrato.numeroContrato || undefined,
      processoSei: processoSei || undefined,
      processoRio: processoRio || undefined,
      processoLegado: processoLegado || undefined,
      categoriaObjeto: contrato.categoriaObjeto || undefined,
      descricaoObjeto: contrato.descricaoObjeto || undefined,
      tipoContratacao: contrato.tipoContratacao || undefined,
      tipoContrato: contrato.tipoContrato || undefined,
      unidadesResponsaveis: contrato.unidadesResponsaveis || [],
      contratacao: contrato.contratacao || undefined,
      vigenciaInicial: contrato.vigenciaInicial || '',
      vigenciaFinal: contrato.vigenciaFinal || '',
      prazoInicialMeses: contrato.prazoInicialMeses || 0,
      valorGlobal: valorGlobal,
      formaPagamento: contrato.formaPagamento === 'Outro' 
        ? contrato.formaPagamentoComplemento || contrato.formaPagamento
        : contrato.formaPagamento || undefined,
      tipoTermoReferencia: contrato.tipoTermoReferencia || undefined,
      termoReferencia: contrato.termoReferencia || undefined,
      vinculacaoPCA: contrato.vinculacaoPCA || undefined,
      empresaId: fornecedor.empresaId || '', // Usar ID (UUID) da empresa
      // Nova estrutura de unidades vinculadas
      unidadesVinculadas: unidades.unidades?.map(unidade => ({
        unidadeSaudeId: unidade.unidadeHospitalar.id,
        valorAtribuido: (() => {
          const valor = unidade.valorAlocado
          if (typeof valor === 'string' && valor.includes('R$')) {
            const valorLimpo = valor.replace(/[^\d,]/g, '').replace(',', '.')
            return parseFloat(valorLimpo) || 0
          }
          return parseFloat(valor?.toString() || '0') || 0
        })(),
        vigenciaInicialUnidade: contrato.vigenciaInicial || '', // Usar vigência do contrato
        vigenciaFinalUnidade: contrato.vigenciaFinal || '', // Usar vigência do contrato
        observacoes: unidade.observacoes || unidades.observacoes || undefined
      })) || [],
      // Nova estrutura de documentos (vazia por enquanto)
      documentos: [],
      // Nova estrutura de funcionários
      funcionarios: atribuicao?.usuariosAtribuidos
        ?.filter(usuario => usuario.tipo !== null) // Só incluir usuários com tipo definido
        ?.map(usuario => ({
          funcionarioId: usuario.id,
          tipoGerencia: usuario.tipo === 'fiscal' ? 1 : 2, // 1=Fiscal, 2=Gestor
          observacoes: usuario.observacoes || undefined
        })) || []
    }

    
    return payload
  }

  const handleAtribuicaoSubmit = async (dados: DadosAtribuicao) => {
    setDadosCompletos((prev) => ({ ...prev, atribuicao: dados }))

    const dadosFinais = {
      fornecedor: dadosCompletos.fornecedor,
      contrato: dadosCompletos.contrato,
      unidades: dadosCompletos.unidades,
      atribuicao: dados,
    }


    try {
      // Mapear dados para API e criar contrato
      const dadosAPI = mapearDadosParaAPI(dadosFinais)
      
      await createContratoMutation.mutateAsync(dadosAPI)
      
      // Sucesso será tratado pelo toast no hook
    } catch (error) {
      // Erro será tratado pelo toast no hook
      console.error('Erro ao criar contrato:', error)
    }
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
                onDataChange={(dados) => {
                  setDadosCompletos(prev => ({
                    ...prev,
                    fornecedor: { ...prev.fornecedor, ...dados } as DadosFornecedor
                  }))
                }}
                onEmpresaCadastrada={setEmpresaCadastradaNaSessao}
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
                onDataChange={(dados) => {
                  setDadosCompletos(prev => {
                    const novosDados = {
                      ...prev,
                      contrato: { ...prev.contrato, ...dados } as DadosContrato
                    }
                    return novosDados
                  })
                }}
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
                return isNaN(valorNum) ? 0 : valorNum
              }
              
              // Se for string numérica, converter para número
              if (typeof valor === 'string') {
                const valorNum = parseFloat(valor)
                return isNaN(valorNum) ? 0 : valorNum
              }
              
              // Se já for número, retornar como está
              if (typeof valor === 'number') {
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



