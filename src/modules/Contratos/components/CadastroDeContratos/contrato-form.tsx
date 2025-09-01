import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  FileText,
  Zap,
  Clock,
  FolderOpen,
  Check,
  X,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { useUnidades } from '@/modules/Unidades/hooks/use-unidades'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import { cn, currencyUtils } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Funções de validação
const validarNumeroContrato = (numero: string) => {
  // Agora aceita apenas números
  return /^\d+$/.test(numero) && numero.length > 0
}

const validarData = (data: string) => {
  const dataInput = new Date(data)
  const dataAtual = new Date()

  // Verifica se a data é válida
  if (isNaN(dataInput.getTime())) return false

  // Verifica se não é posterior à data atual
  return dataInput <= dataAtual
}

const validarURL = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validarPCA = (pca: string) => {
  return /^\d+$/.test(pca)
}




// Interfaces para etapas de pagamento
export interface EtapaPagamento {
  id: string
  numero: number
  dataInicio: string
  dataFim: string
  valor: string
}

// Interfaces para processos
export interface ProcessoSelecionado {
  tipo: 'sei' | 'rio' | 'fisico'
  valor: string
}

export interface DadosContrato {
  numeroContrato: string
  processos: ProcessoSelecionado[]
  categoriaObjeto: string
  descricaoObjeto: string
  tipoContratacao: 'Licitacao' | 'Pregao' | 'Dispensa' | 'Inexigibilidade'
  tipoContrato: 'Compra' | 'Prestacao_Servico' | 'Fornecimento' | 'Manutencao'
  unidadeDemandante: string
  unidadeGestora: string
  unidadeDemandanteId?: string
  unidadeGestoraId?: string
  contratacao: 'Centralizada' | 'Descentralizada'
  vigenciaInicial: string
  vigenciaFinal: string
  prazoInicialMeses: number
  prazoInicialDias: number
  valorGlobal: string
  formaPagamento: 'Mensal' | 'Etapas' | 'Outro'
  formaPagamentoComplemento?: string
  quantidadeEtapas?: number
  etapasPagamento?: EtapaPagamento[]
  tipoTermoReferencia: 'processo_rio' | 'google_drive' | 'texto_livre'
  termoReferencia: string
  vinculacaoPCA: string
}

const schemaContrato = z.object({
  numeroContrato: z
    .string()
    .min(1, 'Número do contrato é obrigatório')
    .refine(
      validarNumeroContrato,
      'Número do contrato deve conter apenas números',
    ),
  processos: z
    .array(
      z.object({
        tipo: z.enum(['sei', 'rio', 'fisico']),
        valor: z.string().min(1, 'Valor do processo é obrigatório'),
      })
    )
    .min(1, 'Pelo menos um processo deve ser informado'),
  categoriaObjeto: z.string().min(1, 'Categoria do objeto é obrigatória'),
  descricaoObjeto: z.string().min(1, 'Descrição do objeto é obrigatória'),
  tipoContratacao: z.enum(['Licitacao', 'Pregao', 'Dispensa', 'Inexigibilidade']),
  tipoContrato: z.enum(['Compra', 'Prestacao_Servico', 'Fornecimento', 'Manutencao']),
  unidadeDemandante: z.string().min(1, 'Unidade demandante é obrigatória'),
  unidadeGestora: z.string().min(1, 'Unidade gestora é obrigatória'),
  unidadeDemandanteId: z.string().optional(),
  unidadeGestoraId: z.string().optional(),
  contratacao: z.enum(['Centralizada', 'Descentralizada']),
  vigenciaInicial: z
    .string()
    .min(1, 'Data de vigência inicial é obrigatória')
    .refine(validarData, 'Data não pode ser posterior à data atual'),
  vigenciaFinal: z.string().min(1, 'Data de vigência final é obrigatória'),
  prazoInicialMeses: z
    .number()
    .min(0, 'Meses deve ser pelo menos 0')
    .max(60, 'Meses máximo de 60'),
  prazoInicialDias: z
    .number()
    .min(0, 'Dias deve ser pelo menos 0')
    .max(30, 'Dias máximo de 30'),
  valorGlobal: z
    .string()
    .min(1, 'Valor do contrato é obrigatório')
    .refine(currencyUtils.validar, 'Valor deve ser maior que zero')
    .refine((valor) => {
      const valorNumerico = parseFloat(
        valor.replace(/[^\d,]/g, '').replace(',', '.'),
      )
      return valorNumerico >= 100
    }, 'Valor mínimo é R$ 100,00'),
  formaPagamento: z.enum(['Mensal', 'Etapas', 'Outro']),
  formaPagamentoComplemento: z.string().optional(),
  quantidadeEtapas: z.number().min(1).max(10).optional(),
  etapasPagamento: z
    .array(
      z.object({
        id: z.string(),
        numero: z.number(),
        dataInicio: z.string().min(1, 'Data de início é obrigatória'),
        dataFim: z.string().min(1, 'Data de fim é obrigatória'),
        valor: z.string().min(1, 'Valor da etapa é obrigatório'),
      })
    )
    .optional(),
  tipoTermoReferencia: z.enum(['processo_rio', 'google_drive', 'texto_livre']),
  termoReferencia: z.string().min(1, 'Termo de referência é obrigatório'),
  vinculacaoPCA: z
    .string()
    .min(1, 'Vinculação a PCA é obrigatória')
    .refine(validarPCA, 'Apenas números são permitidos'),
}).refine((data) => {
  return data.prazoInicialMeses > 0 || data.prazoInicialDias > 0
}, {
  message: 'Informe pelo menos meses ou dias para definir o prazo do contrato',
  path: ['prazoInicialMeses']
}).refine((data) => {
  // Validação adicional: se ambos os campos estão preenchidos, verifica se a soma faz sentido
  if (data.prazoInicialMeses > 0 && data.prazoInicialDias > 0) {
    // Se há meses e dias, verifica se os dias não excedem 30
    return data.prazoInicialDias <= 30
  }
  return true
}, {
  message: 'Dias não podem exceder 30 quando há meses definidos',
  path: ['prazoInicialDias']
}).refine((data) => {
  // Validação de vigência final posterior à vigência inicial
  if (data.vigenciaInicial && data.vigenciaFinal) {
    const dataInicial = new Date(data.vigenciaInicial)
    const dataFinal = new Date(data.vigenciaFinal)
    return dataFinal > dataInicial
  }
  return true
}, {
  message: 'A vigência final deve ser posterior à vigência inicial',
  path: ['vigenciaFinal']
}).refine((data) => {
  // Validação de campos obrigatórios
  if (!data.tipoContratacao) {
    return false
  }
  if (!data.tipoContrato) {
    return false
  }
  if (!data.contratacao) {
    return false
  }
  if (!data.formaPagamento) {
    return false
  }
  if (!data.tipoTermoReferencia) {
    return false
  }
  return true
}, {
  message: 'Todos os campos são obrigatórios',
  path: ['tipoContratacao']
})

type FormDataContrato = z.infer<typeof schemaContrato>

interface ContratoFormProps {
  onSubmit: (dados: DadosContrato) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosContrato>
  onAdvanceRequest?: (dados: DadosContrato) => void
  onDataChange?: (dados: Partial<DadosContrato>) => void
  onValorContratoChange?: (valor: number) => void
}

interface ProcessoInstrutivo {
  prefixos: string[]
  sufixos: string[]
}


export default function ContratoForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
  onValorContratoChange,
}: ContratoFormProps) {
  const { isSubmitting } = useFormAsyncOperation()
  const [tipoTermo, setTipoTermo] = useState<
    'processo_rio' | 'google_drive' | 'texto_livre'
  >('processo_rio')
  const [processoInstrutivo, setProcessoInstrutivo] =
    useState<ProcessoInstrutivo | null>(null)

  const [pesquisaProcesso, setPesquisaProcesso] = useState('')
  const [openProcesso, setOpenProcesso] = useState(false)
  const [vigenciaFinalEditadaManualmente, setVigenciaFinalEditadaManualmente] = useState(false)
  const [processosSelecionados, setProcessosSelecionados] = useState<ProcessoSelecionado[]>([])
  const [etapasPagamento, setEtapasPagamento] = useState<EtapaPagamento[]>([])
  const [quantidadeEtapas, setQuantidadeEtapas] = useState<number>(0)

  // Carregar dados do processo instrutivo
  useEffect(() => {
    const carregarProcessoInstrutivo = async () => {
      try {
        const response = await fetch(
          '/src/modules/Contratos/data/processo-instrutivo.json',
        )
        const data = await response.json()
        setProcessoInstrutivo(data)
      } catch (error) {
        console.error('Erro ao carregar processo instrutivo:', error)
      }
    }
    carregarProcessoInstrutivo()
  }, [])

  // Estados para comboboxes de unidades
  const [openDemandante, setOpenDemandante] = useState(false)
  const [openGestora, setOpenGestora] = useState(false)
  
  // Carregar unidades da API
  const { 
    data: unidadesData, 
    isLoading: carregandoUnidades,
    error: erroUnidades 
  } = useUnidades({ 
    tamanhoPagina: 100 
  })

  const form = useForm<FormDataContrato>({
    resolver: zodResolver(schemaContrato),
    defaultValues: {
      numeroContrato: '',
      processos: [],
      categoriaObjeto: '',
      descricaoObjeto: '',
      tipoContratacao: undefined,
      tipoContrato: undefined,
      unidadeDemandante: '',
      unidadeGestora: '',
      contratacao: undefined,
      vigenciaInicial: '',
      vigenciaFinal: '',
      prazoInicialMeses: 12,
      prazoInicialDias: 0,
      valorGlobal: '',
      formaPagamento: undefined,
      formaPagamentoComplemento: '',
      quantidadeEtapas: 0,
      etapasPagamento: [],
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: '',
      vinculacaoPCA: '',
      ...dadosIniciais,
    },
  })

  // Watch para mudanças em tempo real
  const watchedValues = form.watch()
  const previousDataRef = useRef<string | null>(null)
  const previousValorRef = useRef<string | null>(null)

  // Watch específico para os campos de ID das unidades
  const watchedUnidadeDemandanteId = form.watch('unidadeDemandanteId')
  const watchedUnidadeGestoraId = form.watch('unidadeGestoraId')

  // Callback memoizado para onDataChange
  const handleDataChange = useCallback((dados: DadosContrato) => {
    if (onDataChange) {
      try {
        onDataChange(dados)
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao chamar onDataChange:', error)
      }
    }
  }, [onDataChange])

  // Callback memoizado para onValorContratoChange
  const handleValorContratoChange = useCallback((valor: number) => {
    if (onValorContratoChange) {
      try {
        onValorContratoChange(valor)
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao chamar onValorContratoChange:', error)
      }
    }
  }, [onValorContratoChange])

  // Resetar formulário quando dadosIniciais mudarem (para suporte ao debug)
  useEffect(() => {
    if (dadosIniciais && Object.keys(dadosIniciais).length > 0) {
      form.reset({
        numeroContrato: dadosIniciais?.numeroContrato || '',
        processos: dadosIniciais?.processos || [],
        categoriaObjeto: dadosIniciais?.categoriaObjeto || '',
        descricaoObjeto: dadosIniciais?.descricaoObjeto || '',
        tipoContratacao: dadosIniciais?.tipoContratacao || undefined,
        tipoContrato: dadosIniciais?.tipoContrato || undefined,
        unidadeDemandante: dadosIniciais?.unidadeDemandante || '',
        unidadeGestora: dadosIniciais?.unidadeGestora || '',
        unidadeDemandanteId: dadosIniciais?.unidadeDemandanteId || '',
        unidadeGestoraId: dadosIniciais?.unidadeGestoraId || '',
        contratacao: dadosIniciais?.contratacao || undefined,
        vigenciaInicial: dadosIniciais?.vigenciaInicial || '',
        vigenciaFinal: dadosIniciais?.vigenciaFinal || '',
        prazoInicialMeses: dadosIniciais?.prazoInicialMeses || 12,
        prazoInicialDias: dadosIniciais?.prazoInicialDias || 0,
        valorGlobal: dadosIniciais?.valorGlobal ? currencyUtils.aplicarMascara(dadosIniciais.valorGlobal) : '',
        formaPagamento: dadosIniciais?.formaPagamento || undefined,
        formaPagamentoComplemento: dadosIniciais?.formaPagamentoComplemento || '',
        tipoTermoReferencia: dadosIniciais?.tipoTermoReferencia || 'processo_rio',
        termoReferencia: dadosIniciais?.termoReferencia || '',
        vinculacaoPCA: dadosIniciais?.vinculacaoPCA || '',
      })
    }
  }, [dadosIniciais])

  // Sincronizar processos selecionados com dados iniciais
  useEffect(() => {
    if (dadosIniciais.processos && dadosIniciais.processos.length > 0) {
      setProcessosSelecionados(dadosIniciais.processos)
    }
  }, [dadosIniciais.processos])

  // Limpar pesquisa quando popover fechar
  useEffect(() => {
    if (!openProcesso) {
      setPesquisaProcesso('')
    }
  }, [openProcesso])

  // Emitir mudanças no valor do contrato
  useEffect(() => {
    const valorAtual = watchedValues.valorGlobal || ''
    if (valorAtual !== previousValorRef.current && onValorContratoChange) {
      const valorNumerico = currencyUtils.paraNumero(valorAtual)
      handleValorContratoChange(valorNumerico)
      previousValorRef.current = valorAtual
    }
  }, [watchedValues.valorGlobal, handleValorContratoChange])

  useEffect(() => {
    if (onDataChange) {
      // Usar form.getValues() para obter todos os valores, incluindo os definidos via setValue
      const todosOsValores = form.getValues()
      
      const dados = {
        numeroContrato: todosOsValores.numeroContrato || '',
        processos: todosOsValores.processos || [],
        categoriaObjeto: todosOsValores.categoriaObjeto || '',
        descricaoObjeto: todosOsValores.descricaoObjeto || '',
        tipoContratacao: todosOsValores.tipoContratacao || '',
        tipoContrato: todosOsValores.tipoContrato || '',
        unidadeDemandante: todosOsValores.unidadeDemandante || '',
        unidadeGestora: todosOsValores.unidadeGestora || '',
        unidadeDemandanteId: watchedUnidadeDemandanteId || todosOsValores.unidadeDemandanteId,
        unidadeGestoraId: watchedUnidadeGestoraId || todosOsValores.unidadeGestoraId,
        contratacao: todosOsValores.contratacao || 'Centralizada',
        vigenciaInicial: todosOsValores.vigenciaInicial || '',
        vigenciaFinal: todosOsValores.vigenciaFinal || '',
        prazoInicialMeses: todosOsValores.prazoInicialMeses || 0,
        prazoInicialDias: todosOsValores.prazoInicialDias || 0,
        valorGlobal: todosOsValores.valorGlobal || '',
        formaPagamento: todosOsValores.formaPagamento || 'Mensal',
        formaPagamentoComplemento: todosOsValores.formaPagamentoComplemento || '',
        tipoTermoReferencia:
          todosOsValores.tipoTermoReferencia || 'processo_rio',
        termoReferencia: todosOsValores.termoReferencia || '',
        vinculacaoPCA: todosOsValores.vinculacaoPCA || '',
      }

      const currentDataString = JSON.stringify(dados)
      if (previousDataRef.current !== currentDataString) {
        previousDataRef.current = currentDataString
        console.log('🔄 [DEBUG] onDataChange chamado com dados:', dados)
        handleDataChange(dados)
      }
    }
  }, [watchedValues, handleDataChange])

  const handleFormSubmit = (dados: FormDataContrato) => {
    // Obter todos os valores do formulário, incluindo os campos definidos via setValue
    const todosOsValores = form.getValues()
    
    // Criar objeto DadosContrato com todos os campos necessários
    const dadosContrato: DadosContrato = {
      ...dados,
      unidadeDemandanteId: watchedUnidadeDemandanteId || todosOsValores.unidadeDemandanteId,
      unidadeGestoraId: watchedUnidadeGestoraId || todosOsValores.unidadeGestoraId,
    }

    console.log('📝 [DEBUG] handleFormSubmit - dados do schema:', dados)
    console.log('📝 [DEBUG] handleFormSubmit - todos os valores:', todosOsValores)
    console.log('📝 [DEBUG] handleFormSubmit - dadosContrato final:', dadosContrato)

    const submitOperation = async () => {
      if (onAdvanceRequest) {
        await onAdvanceRequest(dadosContrato)
      } else {
        await onSubmit?.(dadosContrato)
      }
    }

    // Chamada direta para evitar atrasos em ambientes de teste
    void submitOperation()
  }

  // Função helper para mapear dados do formulário para API


  const calcularVigenciaFinal = (
    vigenciaInicial: string,
    prazoMeses: number,
    prazoDias: number,
  ) => {
    if (!vigenciaInicial) return ''
    if (prazoMeses === 0 && prazoDias === 0) return vigenciaInicial

    try {
      const data = new Date(vigenciaInicial)
      
      // Adiciona meses primeiro
      if (prazoMeses > 0) {
        data.setMonth(data.getMonth() + prazoMeses)
      }
      
      // Adiciona dias depois
      if (prazoDias > 0) {
        data.setDate(data.getDate() + prazoDias)
      }
      
      // Verifica se a data resultante é válida
      if (isNaN(data.getTime())) {
        console.error('Data inválida calculada:', { vigenciaInicial, prazoMeses, prazoDias })
        return ''
      }
      
      return data.toISOString().split('T')[0]
    } catch (error) {
      console.error('Erro ao calcular vigência final:', error)
      return ''
    }
  }

  const handleVigenciaInicialChange = (value: string) => {
    if (!value) {
      // Se não há vigência inicial, limpa a vigência final
      form.setValue('vigenciaFinal', '')
      return
    }
    
    const prazoMeses = form.getValues('prazoInicialMeses')
    const prazoDias = form.getValues('prazoInicialDias')
    
    // Só calcula se há pelo menos um prazo definido
    if (prazoMeses > 0 || prazoDias > 0) {
      const vigenciaFinal = calcularVigenciaFinal(value, prazoMeses, prazoDias)
      
      if (vigenciaFinal) {
        form.setValue('vigenciaFinal', vigenciaFinal)
      } else {
        form.setValue('vigenciaFinal', '')
      }
    } else {
      // Se não há prazo definido, limpa a vigência final
      form.setValue('vigenciaFinal', '')
    }
  }

  const handlePrazoChange = (prazoMeses: number, prazoDias: number) => {
    const vigenciaInicial = form.getValues('vigenciaInicial')
    
    if (!vigenciaInicial) {
      // Se não há vigência inicial, limpa a vigência final
      form.setValue('vigenciaFinal', '')
      return
    }
    
    const vigenciaFinal = calcularVigenciaFinal(vigenciaInicial, prazoMeses, prazoDias)
    
    if (vigenciaFinal) {
      form.setValue('vigenciaFinal', vigenciaFinal)
      // Marca que a vigência final foi calculada automaticamente
      setVigenciaFinalEditadaManualmente(false)
    } else {
      // Se o cálculo falhou, limpa o campo
      form.setValue('vigenciaFinal', '')
    }
  }

  const calcularPrazoAPartirDaVigenciaFinal = (
    vigenciaInicial: string,
    vigenciaFinal: string,
  ) => {
    if (!vigenciaInicial || !vigenciaFinal) return { meses: 0, dias: 0 }

    try {
      const dataInicial = new Date(vigenciaInicial)
      const dataFinal = new Date(vigenciaFinal)
      
      if (isNaN(dataInicial.getTime()) || isNaN(dataFinal.getTime())) {
        return { meses: 0, dias: 0 }
      }

      // Calcula a diferença em milissegundos
      const diferencaMs = dataFinal.getTime() - dataInicial.getTime()
      
      if (diferencaMs <= 0) {
        return { meses: 0, dias: 0 }
      }

      // Converte para dias
      const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24))
      
      // Calcula meses e dias restantes
      const meses = Math.floor(diferencaDias / 30)
      const dias = diferencaDias % 30
      
      return { meses, dias }
    } catch (error) {
      console.error('Erro ao calcular prazo a partir da vigência final:', error)
      return { meses: 0, dias: 0 }
    }
  }

  const handleVigenciaFinalChange = (value: string) => {
    const vigenciaInicial = form.getValues('vigenciaInicial')
    
    if (!vigenciaInicial || !value) {
      // Se não há vigência inicial ou final, limpa os prazos
      form.setValue('prazoInicialMeses', 0)
      form.setValue('prazoInicialDias', 0)
      return
    }
    
    // Valida se a vigência final é posterior à inicial
    const dataInicial = new Date(vigenciaInicial)
    const dataFinal = new Date(value)
    
    if (dataFinal <= dataInicial) {
      toast.error('A vigência final deve ser posterior à vigência inicial')
      return
    }
    
    // Calcula o prazo a partir da vigência final informada
    const { meses, dias } = calcularPrazoAPartirDaVigenciaFinal(vigenciaInicial, value)
    
    // Atualiza os campos de prazo
    form.setValue('prazoInicialMeses', meses)
    form.setValue('prazoInicialDias', dias)
    
    toast.success('Prazo recalculado automaticamente!')
  }

  const formatarPrazoTotal = (meses: number, dias: number): string => {
    if (meses === 0 && dias === 0) return '0 dias'
    
    const partes: string[] = []
    
    if (meses > 0) {
      partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`)
    }
    
    if (dias > 0) {
      partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`)
    }
    
    return partes.join(' e ')
  }

  // Funções para gerenciar etapas de pagamento
  const criarEtapasVazias = (quantidade: number): EtapaPagamento[] => {
    return Array.from({ length: quantidade }, (_, index) => ({
      id: `etapa-${Date.now()}-${index}`,
      numero: index + 1,
      dataInicio: '',
      dataFim: '',
      valor: '',
    }))
  }

  const handleQuantidadeEtapasChange = (quantidade: number) => {
    setQuantidadeEtapas(quantidade)
    form.setValue('quantidadeEtapas', quantidade)
    
    if (quantidade > 0) {
      const novasEtapas = criarEtapasVazias(quantidade)
      setEtapasPagamento(novasEtapas)
      form.setValue('etapasPagamento', novasEtapas)
    } else {
      setEtapasPagamento([])
      form.setValue('etapasPagamento', [])
    }
  }

  const atualizarEtapa = (index: number, campo: keyof EtapaPagamento, valor: string) => {
    const etapasAtualizadas = [...etapasPagamento]
    etapasAtualizadas[index] = {
      ...etapasAtualizadas[index],
      [campo]: valor,
    }
    setEtapasPagamento(etapasAtualizadas)
    form.setValue('etapasPagamento', etapasAtualizadas)
  }

  // Funções para gerenciar processos
  const adicionarProcesso = (tipo: 'sei' | 'rio' | 'fisico') => {
    // Verificar se já existe um processo do mesmo tipo
    const jaExiste = processosSelecionados.some(p => p.tipo === tipo)
    if (jaExiste) {
      toast.error(`Já existe um processo ${tipo.toUpperCase()} adicionado`)
      return
    }

    const novoProcesso: ProcessoSelecionado = { tipo, valor: '' }
    const novosProcessos = [...processosSelecionados, novoProcesso]
    setProcessosSelecionados(novosProcessos)
    form.setValue('processos', novosProcessos)
  }

  const removerProcesso = (index: number) => {
    const novosProcessos = processosSelecionados.filter((_, i) => i !== index)
    setProcessosSelecionados(novosProcessos)
    form.setValue('processos', novosProcessos)
  }

  const atualizarProcesso = (index: number, valor: string) => {
    const processosAtualizados = [...processosSelecionados]
    processosAtualizados[index] = {
      ...processosAtualizados[index],
      valor,
    }
    setProcessosSelecionados(processosAtualizados)
    form.setValue('processos', processosAtualizados)
  }

  // Funções de máscara para processos
  const aplicarMascaraSEI = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 6) {
      return `SEI-${apenasNumeros}`
    } else if (apenasNumeros.length <= 10) {
      return `SEI-${apenasNumeros.slice(0, 6)}-${apenasNumeros.slice(6)}`
    } else {
      return `SEI-${apenasNumeros.slice(0, 6)}-${apenasNumeros.slice(6, 10)}`
    }
  }

  const aplicarMascaraFisico = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 2) {
      return `LEG-${apenasNumeros}`
    } else if (apenasNumeros.length <= 5) {
      return `LEG-${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`
    } else if (apenasNumeros.length <= 8) {
      return `LEG-${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5)}`
    } else {
      return `LEG-${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8, 12)}`
    }
  }

  const preencherDadosTeste = () => {
    const processosTesteData: ProcessoSelecionado[] = [
      { tipo: 'sei', valor: 'SEI-123456-2024' },
      { tipo: 'rio', valor: 'SMS-PRO-2024/001' }
    ]
    
    form.reset({
      numeroContrato: '20240001',
      processos: processosTesteData,
      categoriaObjeto: 'prestacao_servico_com_mao_obra',
      descricaoObjeto:
        'Prestação de serviços de limpeza e conservação para unidades de saúde, incluindo fornecimento de materiais e equipamentos necessários.',
      tipoContratacao: 'Pregao',
      tipoContrato: 'Prestacao_Servico',
      unidadeDemandante: 'Secretaria Municipal de Saúde',
      unidadeGestora: 'Departamento de Administração e Finanças',
      contratacao: 'Centralizada',
      vigenciaInicial: '2024-01-15',
      vigenciaFinal: '2024-12-31',
      prazoInicialMeses: 12,
      prazoInicialDias: 0,
      valorGlobal: currencyUtils.formatar(1500000),
             formaPagamento: 'Mensal',
      // COMENTADO PARA PRÓXIMA ENTREGA - quantidadeEtapas: 0,
      // COMENTADO PARA PRÓXIMA ENTREGA - etapasPagamento: [],
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: 'https://processo.rio/processo/12345',
      vinculacaoPCA: '2024',
    })
    
    setProcessosSelecionados(processosTesteData)
    // COMENTADO PARA PRÓXIMA ENTREGA - setQuantidadeEtapas(0)
    // COMENTADO PARA PRÓXIMA ENTREGA - setEtapasPagamento([])
  }

  // Função para filtrar opções baseado na pesquisa
  const filtrarOpcoesProcesso = useCallback(
    (pesquisa: string) => {
      if (!processoInstrutivo || !pesquisa.trim()) return []

      const pesquisaLower = pesquisa.toLowerCase().trim()
      const opcoes: string[] = []

      processoInstrutivo.prefixos.forEach((prefixo) => {
        processoInstrutivo.sufixos.forEach((sufixo) => {
          const opcao = `${prefixo}-${sufixo}`
          if (opcao.toLowerCase().includes(pesquisaLower)) {
            opcoes.push(opcao)
          }
        })
      })

      return opcoes.sort()
    },
    [processoInstrutivo],
  )

  // Função para obter o prefixo-sufixo selecionado
  const obterPrefixoSufixo = useCallback((processoCompleto: string) => {
    if (!processoCompleto) return ''
    const partes = processoCompleto.split('-')
    if (partes.length >= 2) {
      return `${partes[0]}-${partes[1]}`
    }
    return processoCompleto
  }, [])

  // Função para obter o ano/numero do processo
  const obterAnoNumero = useCallback((processoCompleto: string) => {
    if (!processoCompleto) return ''
    const partes = processoCompleto.split('-')
    if (partes.length >= 3) {
      return partes.slice(2).join('-')
    }
    return ''
  }, [])

  // Memoizar as opções filtradas para evitar recálculos desnecessários
  const opcoesFiltradas = useMemo(() => {
    return filtrarOpcoesProcesso(pesquisaProcesso)
  }, [pesquisaProcesso, filtrarOpcoesProcesso])



  // Função para aplicar máscara no campo ano/numero
  const aplicarMascaraAnoNumero = useCallback((valor: string) => {
    // Remove tudo que não é número ou ponto
    const apenasNumerosEPonto = valor.replace(/[^\d.]/g, '')

    if (apenasNumerosEPonto.length === 0) return ''
    if (apenasNumerosEPonto.length <= 4) return apenasNumerosEPonto

    // Para mais de 4 caracteres, aplica formato ano/numero
    const ano = apenasNumerosEPonto.slice(0, 4)
    const numero = apenasNumerosEPonto.slice(4)

    return `${ano}/${numero}`
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        {/* Informações Básicas */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
              <FileText className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Informações Básicas
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Número do Contrato */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="numeroContrato"
                render={({ field }) => {
                  const numeroValue = field.value || ''
                  const isValidNumero =
                    numeroValue.length > 0
                      ? validarNumeroContrato(numeroValue)
                      : null

                  return (
                    <FormItem>
                      <FormLabel htmlFor="numeroContrato" className="mb-2">
                        Número do Contrato (CCon)*
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="numeroContrato"
                            placeholder="Ex: 20240001"
                            {...field}
                            onChange={(e) => {
                              // Remove tudo que não é número
                              const apenasNumeros = e.target.value.replace(/\D/g, '')
                              field.onChange(apenasNumeros)

                            }}
                            className={cn(
                              isValidNumero === true &&
                                'border-green-500 bg-green-50 pr-10',
                              isValidNumero === false &&
                                'border-red-500 bg-red-50 pr-10',
                            )}
                          />
                          {isValidNumero !== null && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                              {isValidNumero ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            {/* Container para Processos */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="processos"
                render={() => (
                  <FormItem>
                    <FormLabel className="mb-2">
                      Processos *
                    </FormLabel>
                    <div className="space-y-3">
                      {/* Botões para adicionar processos */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProcesso('sei')}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Processo SEI
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProcesso('rio')}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Processo RIO
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProcesso('fisico')}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Processo Físico
                        </Button>
                      </div>


                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Processos adicionados - Seção separada */}
          {processosSelecionados.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                <FileText className="h-4 w-4" />
                Processos Adicionados ({processosSelecionados.length})
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processosSelecionados.map((processo, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {processo.tipo === 'sei' ? 'Processo SEI' : 
                         processo.tipo === 'rio' ? 'Processo RIO' : 
                         'Processo Físico'}
                              </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerProcesso(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                            </div>
                    
                    {processo.tipo === 'sei' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">
                          Número do Processo SEI *
                        </Label>
                        <Input
                          placeholder="SEI-123456-2024"
                          value={processo.valor}
                          onChange={(e) => {
                            const valorMascarado = aplicarMascaraSEI(e.target.value)
                            atualizarProcesso(index, valorMascarado)
                          }}
                          className="mt-1 text-sm"
                        />
                      </div>
                    )}
                    
                    {processo.tipo === 'rio' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-gray-600">
                            Prefixo/Sufixo *
                          </Label>
                          <Popover open={openProcesso} onOpenChange={setOpenProcesso}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between text-xs mt-1">
                                {obterPrefixoSufixo(processo.valor) || 'Selecione o processo...'}
                                <ChevronsUpDown className="h-3 w-3" />
                              </Button>
                          </PopoverTrigger>
                            <PopoverContent className="w-full p-2">
                            <Command>
                              <CommandInput
                                placeholder="Buscar processo (ex: SMS, CGM, FOM)..."
                                value={pesquisaProcesso}
                                onValueChange={setPesquisaProcesso}
                              />
                              <CommandList>
                                  <CommandEmpty>Digite para buscar um processo...</CommandEmpty>
                                <CommandGroup>
                                  {opcoesFiltradas.map((opcao) => (
                                    <CommandItem
                                      key={opcao}
                                      value={opcao}
                                      onSelect={(currentValue) => {
                                          const anoNumero = obterAnoNumero(processo.valor)
                                          const processoCompleto = anoNumero
                                            ? `${currentValue}-${anoNumero}`
                                            : currentValue
                                          atualizarProcesso(index, processoCompleto)
                                          setOpenProcesso(false)
                                          setPesquisaProcesso('')
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                            obterPrefixoSufixo(processo.valor) === opcao
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {opcao}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-gray-600">
                            ANO/NÚMERO *
                          </Label>
                        <Input
                            placeholder="2024/001"
                            value={obterAnoNumero(processo.valor)}
                          onChange={(e) => {
                              const prefixo = obterPrefixoSufixo(processo.valor)
                              const valorMascarado = aplicarMascaraAnoNumero(e.target.value)
                              const processoCompleto = prefixo && valorMascarado
                                ? `${prefixo}-${valorMascarado}`
                                : prefixo
                              atualizarProcesso(index, processoCompleto)
                          }}
                          onKeyDown={(e) => {
                            // Permite números, ponto e algumas teclas de navegação
                            if (
                              !/[\d.]/.test(e.key) &&
                              ![
                                'Backspace',
                                'Delete',
                                'Tab',
                                'ArrowLeft',
                                'ArrowRight',
                                'Home',
                                'End',
                              ].includes(e.key)
                            ) {
                              e.preventDefault()
                            }
                          }}
                            disabled={!obterPrefixoSufixo(processo.valor)}
                            className={cn(
                              'mt-1 text-sm',
                              obterPrefixoSufixo(processo.valor)
                                ? 'cursor-text border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
                                : 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-600',
                            )}
                        />
                      </div>
                      </div>
                    )}
                    
                    {processo.tipo === 'fisico' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">
                          Número do Processo Físico *
                        </Label>
                        <Input
                          placeholder="LEG-01/123.456/2024"
                          value={processo.valor}
                          onChange={(e) => {
                            const valorMascarado = aplicarMascaraFisico(e.target.value)
                            atualizarProcesso(index, valorMascarado)
                          }}
                          className="mt-1 text-sm"
              />
            </div>
                    )}
          </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid reorganizado para melhor alinhamento */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Container para Categoria do Objeto */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="categoriaObjeto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="categoriaObjeto" className="mb-2">
                      Categoria do Objeto do Contrato *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger id="categoriaObjeto">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manutencao_corretiva_preventiva_equipamentos_medicos">
                          Manutenção corretiva e preventiva equipamentos médicos
                        </SelectItem>
                        <SelectItem value="manutencao_corretiva_preventiva_predial">
                          Manutenção corretiva e preventiva predial
                        </SelectItem>
                        <SelectItem value="prestacao_servico_com_mao_obra">
                          Prestação de serviço COM mão de obra
                        </SelectItem>
                        <SelectItem value="prestacao_servico_sem_mao_obra">
                          Prestação de serviço SEM mão de obra
                        </SelectItem>
                        <SelectItem value="servico_com_fornecimento_cessao_insumo">
                          Serviço com fornecimento e Cessão com insumo
                        </SelectItem>
                        <SelectItem value="servico_locacao_veiculos">
                          Serviço de locação veículos
                        </SelectItem>
                        <SelectItem value="informatica">
                          Informática
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Tipo de Contratação */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="tipoContratacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="tipoContratacao" className="mb-2">
                      Tipo de Contratação *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger id="tipoContratacao">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Licitacao">Licitação</SelectItem>
                        <SelectItem value="Pregao">Pregão</SelectItem>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">
                          Inexigibilidade
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Tipo de Contrato */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="tipoContrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="tipoContrato" className="mb-2">Tipo de Contrato *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger id="tipoContrato">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Compra">Compra</SelectItem>
                        <SelectItem value="Prestacao_Servico">
                          Prestação de Serviço
                        </SelectItem>
                        <SelectItem value="Fornecimento">
                          Fornecimento
                        </SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Container para Descrição do Objeto - Full width abaixo do grid */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="descricaoObjeto"
              render={({ field }) => {
                const caracteresRestantes = 1000 - (field.value?.length || 0)
                const isLimiteAtingido = caracteresRestantes <= 0

                return (
                  <FormItem>
                    <FormLabel htmlFor="descricaoObjeto" className="mb-2">
                      Descrição do Objeto *
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Textarea
                          id="descricaoObjeto"
                          placeholder="Descrição detalhada do objeto do contrato..."
                          rows={3}
                          maxLength={1000}
                          {...field}
                          onChange={(e) => {
                            if (e.target.value.length <= 1000) {
                              field.onChange(e.target.value)
                            }
                          }}
                          className={cn(
                            isLimiteAtingido && 'border-red-500 bg-red-50',
                          )}
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={cn(
                              'text-gray-500',
                              isLimiteAtingido && 'font-medium text-red-500',
                            )}
                          >
                            {caracteresRestantes} caracteres restantes
                          </span>
                          <span
                            className={cn(
                              'text-gray-400',
                              isLimiteAtingido && 'text-red-400',
                            )}
                          >
                            {field.value?.length || 0}/1000
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Unidade Demandante */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="unidadeDemandante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="unidadeDemandante" className="mb-2">Unidade Demandante *</FormLabel>
                    <Popover open={openDemandante} onOpenChange={setOpenDemandante}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDemandante}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Busque por uma unidade demandante..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Busque por nome da unidade..." />
                          <CommandList>
                            {carregandoUnidades ? (
                              <CommandEmpty>
                                <div className="flex items-center gap-2 py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Carregando unidades...
                                </div>
                              </CommandEmpty>
                            ) : erroUnidades ? (
                              <CommandEmpty>Erro ao carregar unidades</CommandEmpty>
                            ) : (
                              <>
                                <CommandEmpty>Nenhuma unidade encontrada</CommandEmpty>
                                <CommandGroup>
                                  {unidadesData?.dados?.map((unidade) => (
                                    <CommandItem
                                      key={unidade.id}
                                      value={unidade.nome}
                                                                                                                    onSelect={(currentValue) => {
                                         const selectedUnit = unidadesData.dados.find(u => u.nome === currentValue)
                                         if (selectedUnit) {
                                           field.onChange(currentValue === field.value ? "" : currentValue)
                                           // Atualizar o campo do formulário com o ID
                                           form.setValue('unidadeDemandanteId', selectedUnit.id)
                                           console.log('🔍 [DEBUG] Unidade demandante selecionada:', {
                                             nome: currentValue,
                                             id: selectedUnit.id
                                           })
                                         }
                                         setOpenDemandante(false)
                                       }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === unidade.nome ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {unidade.nome}
                                      {unidade.sigla && <span className="ml-auto text-xs text-muted-foreground">({unidade.sigla})</span>}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Unidade Gestora */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="unidadeGestora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="unidadeGestora" className="mb-2">Unidade Gestora *</FormLabel>
                    <Popover open={openGestora} onOpenChange={setOpenGestora}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGestora}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Busque por uma unidade gestora..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Busque por nome da unidade..." />
                          <CommandList>
                            {carregandoUnidades ? (
                              <CommandEmpty>
                                <div className="flex items-center gap-2 py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Carregando unidades...
                                </div>
                              </CommandEmpty>
                            ) : erroUnidades ? (
                              <CommandEmpty>Erro ao carregar unidades</CommandEmpty>
                            ) : (
                              <>
                                <CommandEmpty>Nenhuma unidade encontrada</CommandEmpty>
                                <CommandGroup>
                                  {unidadesData?.dados?.map((unidade) => (
                                    <CommandItem
                                      key={unidade.id}
                                      value={unidade.nome}
                                                                                                                    onSelect={(currentValue) => {
                                         const selectedUnit = unidadesData.dados.find(u => u.nome === currentValue)
                                         if (selectedUnit) {
                                           field.onChange(currentValue === field.value ? "" : currentValue)
                                           // Atualizar o campo do formulário com o ID
                                           form.setValue('unidadeGestoraId', selectedUnit.id)
                                           console.log('🔍 [DEBUG] Unidade gestora selecionada:', {
                                             nome: currentValue,
                                             id: selectedUnit.id
                                           })
                                         }
                                         setOpenGestora(false)
                                       }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === unidade.nome ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {unidade.nome}
                                      {unidade.sigla && <span className="ml-auto text-xs text-muted-foreground">({unidade.sigla})</span>}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Container para Contratação */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="contratacao"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="mb-2">Contratação *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Centralizada"
                          id="centralizada"
                          className="border-slate-300"
                        />
                        <Label htmlFor="centralizada">Centralizada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Descentralizada"
                          id="descentralizada"
                          className="border-slate-300"
                        />
                        <Label htmlFor="descentralizada">Descentralizada</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Prazos e Valores */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">Prazos e Valores</h3>
          </div>

                     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
             {/* Container para Vigência Inicial */}
             <div className="space-y-2">
               <FormField
                 control={form.control}
                 name="vigenciaInicial"
                 render={({ field }) => {
                   const dataValue = field.value || ''
                   const isValidData =
                     dataValue.length > 0 ? validarData(dataValue) : null

                   return (
                     <FormItem>
                       <FormLabel htmlFor="vigenciaInicial" className="mb-2">Vigência Inicial *</FormLabel>
                       <FormControl>
                         <div className="relative">
                           <Input
                             id="vigenciaInicial"
                             type="date"
                             max={new Date().toISOString().split('T')[0]}
                             value={field.value || ''}
                             onChange={(e) => {
                               field.onChange(e.target.value)
                               handleVigenciaInicialChange(e.target.value)

                               if (e.target.value) {
                                 const isValid = validarData(e.target.value)
                                 if (isValid) {
                                   toast.success('Data válida!')
                                 } else {
                                   toast.error(
                                     'Data não pode ser posterior à data atual',
                                   )
                                 }
                               }
                             }}
                             onBlur={field.onBlur}
                             name={field.name}
                             className={cn(
                               isValidData === true &&
                                 'border-green-500 bg-green-50 pr-10',
                               isValidData === false &&
                                 'border-red-500 bg-red-50 pr-10',
                             )}
                           />
                           {isValidData !== null && (
                             <div className="absolute top-1/2 right-3 -translate-y-1/2">
                               {isValidData ? (
                                 <Check className="h-4 w-4 text-green-500" />
                               ) : (
                                 <X className="h-4 w-4 text-red-500" />
                               )}
                             </div>
                           )}
                         </div>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )
                 }}
               />
             </div>

            {/* Container para Prazo Inicial */}
               <div className="space-y-2">
                 <FormField
                   control={form.control}
                   name="prazoInicialMeses"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel htmlFor="prazoInicialMeses" className="mb-2">Prazo Inicial *</FormLabel>
                       <div className="grid grid-cols-2 gap-2">
                         <div className="relative">
                           <FormControl>
                             <div className="relative">
                               <Input
                                 id="prazoInicialMeses"
                                 type="text"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 value={field.value || ''}
                                 onChange={(e) => {
                                   let valor = parseInt(e.target.value) || 0
                                   if (valor > 60) {
                                     valor = 60
                                   }
                                   field.onChange(valor)
                                   const prazoDias = form.getValues('prazoInicialDias')
                                   handlePrazoChange(valor, prazoDias)
                                 }}
                                 onBlur={field.onBlur}
                                 name={field.name}
                                 className="pr-8 h-10 text-center"
                                 placeholder="0"
                               />
                               <div className="bg-gray-100 rounded-s-sm pr-3 absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                 <span className="text-xs text-muted-foreground font-medium">Meses</span>
                               </div>
                               <div className="absolute inset-y-0 right-0 flex flex-col">
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const novoValor = Math.min((field.value || 0) + 1, 60)
                                     field.onChange(novoValor)
                                     const prazoDias = form.getValues('prazoInicialDias')
                                     handlePrazoChange(novoValor, prazoDias)
                                   }}
                                   className="h-1/2 w-6 flex items-center justify-center hover:bg-gray-100 border-l border-b rounded-tr-sm"
                                   aria-label="Aumentar meses"
                                 >
                                   <ChevronsUpDown className="h-2 w-2 rotate-180" />
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const novoValor = Math.max((field.value || 0) - 1, 0)
                                     field.onChange(novoValor)
                                     const prazoDias = form.getValues('prazoInicialDias')
                                     handlePrazoChange(novoValor, prazoDias)
                                   }}
                                   className="h-1/2 w-6 flex items-center justify-center hover:bg-gray-100 border-l rounded-br-sm"
                                   aria-label="Diminuir meses"
                                 >
                                   <ChevronsUpDown className="h-2 w-2" />
                                 </button>
                               </div>
                             </div>
                           </FormControl>
                         </div>
                         
                         <div className="relative">
                           <FormControl>
                             <div className="relative">
                               <Input
                                 id="prazoInicialDias"
                                 type="text"
                                 inputMode="numeric"
                                 pattern="[0-9]*"
                                 maxLength={4}
                                 value={form.watch('prazoInicialDias') || ''}
                                 onChange={(e) => {
                                   let valor = parseInt(e.target.value) || 0
                                   
                                   // Limita o valor máximo a 30 dias
                                   if (valor > 30) {
                                     valor = 30
                                   }
                                   
                                   form.setValue('prazoInicialDias', valor)
                                   const prazoMeses = form.getValues('prazoInicialMeses')
                                   handlePrazoChange(prazoMeses, valor)
                                 }}
                                 onBlur={field.onBlur}
                                 name="prazoInicialDias"
                                 className="pr-8 h-10 text-center"
                                 placeholder="0"
                                 data-testid="prazo-dias-input"
                               />
                               <div className="bg-gray-100 rounded-s-sm pr-3 absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                 <span className="text-xs text-muted-foreground font-medium">Dias</span>
                               </div>
                               <div className="absolute inset-y-0 right-0 flex flex-col">
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const novoValor = Math.min((form.watch('prazoInicialDias') || 0) + 1, 30)
                                     form.setValue('prazoInicialDias', novoValor)
                                     const prazoMeses = form.getValues('prazoInicialMeses')
                                     handlePrazoChange(prazoMeses, novoValor)
                                   }}
                                   className="h-1/2 w-6 flex items-center justify-center hover:bg-gray-100 border-l border-b rounded-tr-sm"
                                   aria-label="Aumentar dias"
                                 >
                                   <ChevronsUpDown className="h-2 w-2 rotate-180" />
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const novoValor = Math.max((form.watch('prazoInicialDias') || 0) - 1, 0)
                                     form.setValue('prazoInicialDias', novoValor)
                                     const prazoMeses = form.getValues('prazoInicialMeses')
                                     handlePrazoChange(prazoMeses, novoValor)
                                   }}
                                   className="h-1/2 w-6 flex items-center justify-center hover:bg-gray-100 border-l rounded-br-sm"
                                   aria-label="Diminuir dias"
                                 >
                                   <ChevronsUpDown className="h-2 w-2" />
                                 </button>
                               </div>
                             </div>
                           </FormControl>
                         </div>
                       </div>
                       
                                               {/* Exibição do prazo total calculado */}
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Prazo total:</span>{' '}
                          {formatarPrazoTotal(
                            form.watch('prazoInicialMeses') || 0,
                            form.watch('prazoInicialDias') || 0
                          )}
                          {vigenciaFinalEditadaManualmente && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Calculado automaticamente
                            </span>
                          )}
                        </div>
                       
                       {/* Aviso para prazos muito longos */}
                       {(form.watch('prazoInicialMeses') || 0) > 60 && (
                         <div className="mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                           ⚠️ Prazo muito longo. Considere revisar a duração do contrato.
                         </div>
                       )}
                       
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

             {/* Container para Vigência Final */}
             <div className="space-y-2">
               <FormField
                 control={form.control}
                 name="vigenciaFinal"
                 render={({ field }) => {
                                       const vigenciaInicial = form.watch('vigenciaInicial')
                    const isDisabled = !vigenciaInicial

                   return (
                     <FormItem>
                                               <FormLabel htmlFor="vigenciaFinal" className="mb-2">
                          Vigência Final
                          {vigenciaFinalEditadaManualmente && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              Editada manualmente
                            </span>
                          )}
                        </FormLabel>
                                               <FormControl>
                          <Input
                            id="vigenciaFinal"
                            type="date"
                            readOnly={isDisabled}
                            className={cn(
                              isDisabled && 'cursor-not-allowed bg-gray-50',
                            )}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                              // Se o usuário alterar manualmente a vigência final, recalcula o prazo
                              if (!isDisabled) {
                                handleVigenciaFinalChange(e.target.value)
                                // Marca que foi editada manualmente
                                setVigenciaFinalEditadaManualmente(true)
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                          />
                        </FormControl>
                       <FormMessage />
                     </FormItem>
                   )
                 }}
               />
             </div>
           </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Valor do Contrato */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="valorGlobal"
                render={({ field }) => {
                  const valorValue = field.value || ''
                  const isValidValor =
                    valorValue.length > 0
                      ? currencyUtils.validar(valorValue)
                      : null
                  const valorNumerico =
                    valorValue.length > 0
                      ? parseFloat(
                          valorValue.replace(/[^\d,]/g, '').replace(',', '.'),
                        )
                      : 0
                  const isValorMinimo = valorNumerico >= 100

                  return (
                    <FormItem>
                      <FormLabel htmlFor="valorGlobal" className="mb-2">Valor do Contrato *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="valorGlobal"
                            placeholder="R$ 0,00"
                            {...field}
                            onChange={(e) => {
                              const valorMascarado =
                                currencyUtils.aplicarMascara(e.target.value)
                              field.onChange(valorMascarado)
                            }}
                            className=""
                          />
                          {isValidValor !== null && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                              {isValidValor && isValorMinimo ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      {isValidValor === true && isValorMinimo && (
                        <p className="flex items-center gap-1 text-sm text-green-600">
                          <span className="text-green-500">✓</span>
                          Valor válido
                        </p>
                      )}
                      {(isValidValor === false || !isValorMinimo) &&
                        valorValue.length > 0 && (
                          <p className="flex items-center gap-1 text-sm text-red-600">
                            <span className="text-red-500">✗</span>
                            {!isValorMinimo
                              ? 'Valor mínimo é R$ 100,00'
                              : 'Valor deve ser maior que zero'}
                          </p>
                        )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

                         {/* Container para Forma de Pagamento */}
             <div className="space-y-2">
               <FormField
                 control={form.control}
                 name="formaPagamento"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel htmlFor="formaPagamento" className="mb-2">Forma de Pagamento *</FormLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Limpar etapas quando não for "Etapas"
                            if (value !== 'Etapas') {
                              setQuantidadeEtapas(0)
                              setEtapasPagamento([])
                              form.setValue('quantidadeEtapas', 0)
                              form.setValue('etapasPagamento', [])
                            }
                          }} 
                          value={field.value}
                        >
                       <FormControl className="w-full">
                         <SelectTrigger id="formaPagamento">
                           <SelectValue placeholder="Selecione a forma" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="Mensal">Mensal</SelectItem>
                         {/* <SelectItem value="Etapas">Etapas</SelectItem> */}
                         <SelectItem value="Outro">Outro</SelectItem>
                       </SelectContent>
                     </Select>
                      </div>
                      
                      {/* Campo de quantidade ao lado quando "Etapas" for selecionado */}
                      {field.value === 'Etapas' && (
                        <div className="w-24">
                          <FormField
                            control={form.control}
                            name="quantidadeEtapas"
                            render={() => (
                              <FormControl>
                                <Input
                                  id="quantidadeEtapas"
                                  type="number"
                                  min="1"
                                  max="10"
                                  placeholder="Qtd"
                                  value={quantidadeEtapas || ''}
                                  onChange={(e) => {
                                    const valor = parseInt(e.target.value) || 0
                                    if (valor >= 0 && valor <= 10) {
                                      handleQuantidadeEtapasChange(valor)
                                    }
                                  }}
                                  className="text-center text-sm"
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                      )}
                    </div>

                     {/* Campo complementar para "Outro" */}
                     {field.value === 'Outro' && (
                       <FormField
                         control={form.control}
                         name="formaPagamentoComplemento"
                         render={({ field: complementoField }) => (
                           <FormItem className="mt-3">
                             <FormLabel htmlFor="formaPagamentoComplemento" className="text-sm">
                               Detalhamento da forma de pagamento *
                             </FormLabel>
                             <FormControl>
                               <Input
                                 id="formaPagamentoComplemento"
                                 placeholder="Descreva a forma de pagamento..."
                                 maxLength={100}
                                 value={complementoField.value || ''}
                                 onChange={complementoField.onChange}
                                 onBlur={complementoField.onBlur}
                                 name={complementoField.name}
                               />
                             </FormControl>
                             <div className="flex justify-between text-xs text-muted-foreground">
                               <span>Campo obrigatório quando "Outro" é selecionado</span>
                               <span>{(complementoField.value?.length || 0)}/100</span>
                             </div>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                     )}

                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
          </div>

          {/* Etapas de pagamento - Seção separada */}
          {form.watch('formaPagamento') === 'Etapas' && etapasPagamento.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                    <DollarSign className="h-4 w-4" />
                    Etapas de Pagamento ({etapasPagamento.length})
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {etapasPagamento.map((etapa, index) => (
                      <div key={etapa.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Etapa {etapa.numero}</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">
                              Data de Início *
                            </Label>
                            <Input
                              type="date"
                              value={etapa.dataInicio}
                              onChange={(e) => atualizarEtapa(index, 'dataInicio', e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium text-gray-600">
                              Data de Fim *
                            </Label>
                            <Input
                              type="date"
                              value={etapa.dataFim}
                              onChange={(e) => atualizarEtapa(index, 'dataFim', e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium text-gray-600">
                              Valor da Etapa *
                            </Label>
                            <Input
                              placeholder="R$ 0,00"
                              value={etapa.valor}
                              onChange={(e) => {
                                const valorMascarado = currencyUtils.aplicarMascara(e.target.value)
                                atualizarEtapa(index, 'valor', valorMascarado)
                              }}
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          )}
        </div>

        <Separator />

        {/* Documentos e Informações Adicionais */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">
              Documentos e Informações Adicionais
            </h3>
          </div>

          {/* Tipo de Termo de Referência */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="tipoTermoReferencia"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="mb-2">
                    Tipo de Termo de Referência *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value)
                        setTipoTermo(
                          value as
                            | 'processo_rio'
                            | 'google_drive'
                            | 'texto_livre',
                        )
                        form.setValue('termoReferencia', '')
                      }}
                      value={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <label 
                        htmlFor="processo_rio"
                        className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300 cursor-pointer"
                      >
                        <RadioGroupItem
                          value="processo_rio"
                          id="processo_rio"
                          className="border-slate-300"
                        />
                        <ExternalLink className="h-5 w-5 text-slate-600" />
                        <div className="flex-1">
                          <span className="font-medium cursor-pointer">
                            Processo.Rio
                          </span>
                          <p className="text-xs text-gray-500">
                            Link do processo no sistema Processo.Rio
                          </p>
                        </div>
                      </label>
                      <label 
                        htmlFor="google_drive"
                        className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300 cursor-pointer"
                      >
                        <RadioGroupItem
                          value="google_drive"
                          id="google_drive"
                          className="border-slate-300"
                        />
                        <ExternalLink className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <span className="font-medium cursor-pointer">
                            Google Drive
                          </span>
                          <p className="text-xs text-gray-500">
                            Link público do arquivo no Google Drive
                          </p>
                        </div>
                      </label>
                      <label 
                        htmlFor="texto_livre"
                        className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300 cursor-pointer"
                      >
                        <RadioGroupItem
                          value="texto_livre"
                          id="texto_livre"
                          className="border-slate-300"
                        />
                        <FileText className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <span className="font-medium cursor-pointer">
                            Texto Livre
                          </span>
                          <p className="text-xs text-gray-500">
                            Descrição textual do termo de referência
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Campo dinâmico baseado no tipo selecionado */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="termoReferencia"
              render={({ field }) => {
                const termoValue = field.value || ''
                const isValidURL =
                  termoValue.length > 0 && tipoTermo !== 'texto_livre'
                    ? validarURL(termoValue)
                    : null

                return (
                  <FormItem>
                    <FormLabel htmlFor="termoReferencia" className="mb-2">
                      {tipoTermo === 'processo_rio'
                        ? 'Link do Processo.Rio *'
                        : tipoTermo === 'google_drive'
                        ? 'Link do Google Drive *'
                        : 'Descrição do Termo de Referência *'}
                    </FormLabel>
                    <FormControl>
                      {tipoTermo === 'texto_livre' ? (
                        <Textarea
                          id="termoReferencia"
                          placeholder="Descreva o termo de referência..."
                          rows={4}
                          maxLength={2000}
                          {...field}
                          onChange={(e) => {
                            if (e.target.value.length <= 2000) {
                              field.onChange(e.target.value)
                            }
                          }}
                        />
                      ) : (
                        <Input
                          id="termoReferencia"
                          type="url"
                          placeholder={
                            tipoTermo === 'processo_rio'
                              ? 'https://processo.rio.gov.br/...'
                              : 'https://drive.google.com/...'
                          }
                          {...field}
                          className={cn(
                            'w-full',
                            isValidURL === false && 'border-red-500 bg-red-50',
                            isValidURL === true && 'border-green-500 bg-green-50',
                          )}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          {/* Container para Vinculação PCA */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="vinculacaoPCA"
              render={({ field }) => {
                const pcaValue = field.value || ''
                const isValidPCA =
                  pcaValue.length > 0 ? validarPCA(pcaValue) : null

                return (
                  <FormItem>
                    <FormLabel htmlFor="vinculacaoPCA" className="mb-2">
                      Vinculação a PCA - Ano *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="vinculacaoPCA"
                          placeholder="Ex: 2024"
                          {...field}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, '')
                            field.onChange(valor)

                            if (valor.length > 0) {
                              const isValid = validarPCA(valor)
                              if (isValid) {
                                toast.success('Ano válido!')
                              } else {
                                toast.error('Apenas números são permitidos')
                              }
                            }
                          }}
                          className={cn(
                            isValidPCA === true &&
                              'border-green-500 bg-green-50 pr-10',
                            isValidPCA === false &&
                              'border-red-500 bg-red-50 pr-10',
                          )}
                        />
                        {isValidPCA !== null && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            {isValidPCA ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>


        </div>

        {/* Botões */}
        <div className="space-y-6 border-t border-gray-200 pt-8">
          {/* Botão de preenchimento rápido para testes */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={preencherDadosTeste}
              className="border-violet-300 bg-gradient-to-r from-violet-100 to-purple-100 text-sm text-violet-700 shadow-sm hover:from-violet-200 hover:to-purple-200"
            >
              <Zap className="mr-2 h-4 w-4" />
              Preencher Dados de Teste
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-8 py-2.5 transition-all duration-200 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              )}
              {onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  className="flex items-center gap-2 px-8 py-2.5 transition-all duration-200 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-label={
                isSubmitting
                  ? 'Processando dados do contrato...'
                  : 'Avançar para próximo passo'
              }
              className={cn(
                'flex items-center gap-2 bg-slate-700 px-8 py-2.5 shadow-lg shadow-slate-700/20 transition-all duration-200 hover:bg-slate-600',
                isSubmitting && 'cursor-not-allowed opacity-50',
              )}
            >
              {isSubmitting ? (
                <>
                  <ButtonLoadingSpinner />
                  Processando...
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
