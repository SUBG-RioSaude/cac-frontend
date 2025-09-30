import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  FileText,
  Clock,
  FolderOpen,
  Check,
  X,
  ChevronsUpDown,
  Plus,
  Trash2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { cn, currencyUtils } from '@/lib/utils'
import processoInstrutivoData from '@/modules/Contratos/data/processo-instrutivo.json'
import { useValidarNumeroContrato } from '@/modules/Contratos/hooks/use-validar-numero-contrato'
import { validateUnidadesResponsaveis } from '@/modules/Contratos/types/contrato'
import type { CriarUnidadeResponsavelPayload } from '@/modules/Contratos/types/contrato'

import { UnidadeResponsavelManager } from './UnidadeResponsavelManager'

// Funções de validação
const validarNumeroContrato = (numero: string) => {
  // Agora aceita apenas números
  return /^\d+$/.test(numero) && numero.length > 0
}

const validarData = (data: string) => {
  const dataInput = new Date(data)

  // Verifica se a data é válida
  if (isNaN(dataInput.getTime())) return false

  // Data válida (permite datas futuras)
  return true
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
  unidadesResponsaveis: CriarUnidadeResponsavelPayload[]
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
  tipoTermoReferencia?: 'processo_rio' | 'google_drive' | 'texto_livre'
  termoReferencia?: string
  vinculacaoPCA?: string
}

// Função para criar schema com validação de duplicação dinâmica
const createSchemaContrato = (isNumeroUnique: boolean | null) =>
  z
    .object({
      numeroContrato: z
        .string()
        .min(1, 'Número do contrato é obrigatório')
        .refine(
          validarNumeroContrato,
          'Número do contrato deve conter apenas números',
        )
        .refine(
          () => isNumeroUnique !== false,
          'Este número de contrato já existe no sistema',
        ),
      processos: z
        .array(
          z.object({
            tipo: z.enum(['sei', 'rio', 'fisico']),
            valor: z.string().min(1, 'Valor do processo é obrigatório'),
          }),
        )
        .min(1, 'Pelo menos um processo deve ser informado'),
      categoriaObjeto: z.string().min(1, 'Categoria do objeto é obrigatória'),
      descricaoObjeto: z.string().min(1, 'Descrição do objeto é obrigatória'),
      tipoContratacao: z.enum([
        'Licitacao',
        'Pregao',
        'Dispensa',
        'Inexigibilidade',
      ]),
      tipoContrato: z.enum([
        'Compra',
        'Prestacao_Servico',
        'Fornecimento',
        'Manutencao',
      ]),
      unidadesResponsaveis: z
        .array(
          z.object({
            unidadeSaudeId: z.string().min(1, 'ID da unidade é obrigatório'),
            tipoResponsabilidade: z.number().min(1).max(2), // 1=Demandante, 2=Gestora
            principal: z.boolean().optional(),
            observacoes: z.string().optional(),
          }),
        )
        .min(1, 'É necessário pelo menos uma unidade responsável')
        .refine(
          (unidades) => unidades.some((u) => u.tipoResponsabilidade === 1),
          {
            message: 'Unidade demandante é obrigatória',
          },
        )
        .refine(
          (unidades) => unidades.some((u) => u.tipoResponsabilidade === 2),
          {
            message: 'Unidade gestora é obrigatória',
          },
        ),
      contratacao: z.enum(['Centralizada', 'Descentralizada']),
      vigenciaInicial: z
        .string()
        .min(1, 'Data de vigência inicial é obrigatória')
        .refine(validarData, 'Data inválida'),
      vigenciaFinal: z.string().min(1, 'Data de vigência final é obrigatória'),
      prazoInicialMeses: z
        .number()
        .min(0, 'Meses deve ser pelo menos 0')
        .max(72, 'Meses máximo de 72'),
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
          }),
        )
        .optional(),
      tipoTermoReferencia: z
        .enum(['processo_rio', 'google_drive', 'texto_livre'])
        .optional(),
      termoReferencia: z.string().optional(),
      vinculacaoPCA: z
        .string()
        .optional()
        .refine(
          (val) => !val || validarPCA(val),
          'Apenas números são permitidos',
        ),
    })
    .refine(
      (data) => {
        return data.prazoInicialMeses > 0 || data.prazoInicialDias > 0
      },
      {
        message:
          'Informe pelo menos meses ou dias para definir o prazo do contrato',
        path: ['prazoInicialMeses'],
      },
    )
    .refine(
      (data) => {
        // Validação adicional: se ambos os campos estão preenchidos, verifica se a soma faz sentido
        if (data.prazoInicialMeses > 0 && data.prazoInicialDias > 0) {
          // Se há meses e dias, verifica se os dias não excedem 30
          return data.prazoInicialDias <= 30
        }
        return true
      },
      {
        message: 'Dias não podem exceder 30 quando há meses definidos',
        path: ['prazoInicialDias'],
      },
    )
    .refine(
      (data) => {
        // Validação de vigência final posterior à vigência inicial
        if (data.vigenciaInicial && data.vigenciaFinal) {
          const dataInicial = new Date(data.vigenciaInicial)
          const dataFinal = new Date(data.vigenciaFinal)
          return dataFinal > dataInicial
        }
        return true
      },
      {
        message: 'A vigência final deve ser posterior à vigência inicial',
        path: ['vigenciaFinal'],
      },
    )
    .refine(
      (data) => {
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
      },
      {
        message: 'Todos os campos são obrigatórios',
        path: ['tipoContratacao'],
      },
    )

// Schema base para inferir o tipo
const baseSchemaContrato = createSchemaContrato(null)
type FormDataContrato = z.infer<typeof baseSchemaContrato>

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

const ContratoForm = ({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
  onValorContratoChange,
}: ContratoFormProps) => {
  const { isSubmitting } = useFormAsyncOperation()
  const [tipoTermo, setTipoTermo] = useState<
    'processo_rio' | 'google_drive' | 'texto_livre'
  >('processo_rio')
  const [processoInstrutivo, setProcessoInstrutivo] =
    useState<ProcessoInstrutivo | null>(null)

  const [pesquisaProcesso, setPesquisaProcesso] = useState('')
  const [openProcesso, setOpenProcesso] = useState(false)
  const [vigenciaFinalEditadaManualmente, setVigenciaFinalEditadaManualmente] =
    useState(false)
  const [processosSelecionados, setProcessosSelecionados] = useState<
    ProcessoSelecionado[]
  >([])
  const [etapasPagamento, setEtapasPagamento] = useState<EtapaPagamento[]>([])
  const [quantidadeEtapas, setQuantidadeEtapas] = useState<number>(0)

  // Inicializar dados do processo instrutivo
  useEffect(() => {
    setProcessoInstrutivo(processoInstrutivoData)
  }, [])

  const form = useForm<FormDataContrato>({
    resolver: zodResolver(baseSchemaContrato),
    defaultValues: {
      numeroContrato: '',
      processos: [],
      categoriaObjeto: '',
      descricaoObjeto: '',
      tipoContratacao: 'Licitacao',
      tipoContrato: undefined,
      unidadesResponsaveis: [],
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

  // Hook para validar número do contrato em tempo real
  const numeroContrato = form.watch('numeroContrato')
  const validacaoNumero = useValidarNumeroContrato(numeroContrato)

  // Watch para mudanças em tempo real
  const watchedValues = form.watch()
  const previousDataRef = useRef<string | null>(null)
  const previousValorRef = useRef<string | null>(null)

  // Callback memoizado para onDataChange
  const handleDataChange = useCallback(
    (dados: DadosContrato) => {
      if (onDataChange) {
        try {
          onDataChange(dados)
        } catch (error) {
          console.error('❌ [DEBUG] Erro ao chamar onDataChange:', error)
        }
      }
    },
    [onDataChange],
  )

  // Callback memoizado para onValorContratoChange
  const handleValorContratoChange = useCallback(
    (valor: number) => {
      if (onValorContratoChange) {
        try {
          onValorContratoChange(valor)
        } catch (error) {
          console.error(
            '❌ [DEBUG] Erro ao chamar onValorContratoChange:',
            error,
          )
        }
      }
    },
    [onValorContratoChange],
  )

  // Resetar formulário quando dadosIniciais mudarem (para suporte ao debug)
  useEffect(() => {
    if (dadosIniciais && Object.keys(dadosIniciais).length > 0) {
      form.reset({
        numeroContrato: dadosIniciais?.numeroContrato ?? '',
        processos: dadosIniciais?.processos ?? [],
        categoriaObjeto: dadosIniciais?.categoriaObjeto ?? '',
        descricaoObjeto: dadosIniciais?.descricaoObjeto ?? '',
        tipoContratacao: dadosIniciais?.tipoContratacao ?? undefined,
        tipoContrato: dadosIniciais?.tipoContrato ?? undefined,
        unidadesResponsaveis: dadosIniciais?.unidadesResponsaveis ?? [],
        contratacao: dadosIniciais?.contratacao ?? undefined,
        vigenciaInicial: dadosIniciais?.vigenciaInicial ?? '',
        vigenciaFinal: dadosIniciais?.vigenciaFinal ?? '',
        prazoInicialMeses: dadosIniciais?.prazoInicialMeses ?? 12,
        prazoInicialDias: dadosIniciais?.prazoInicialDias ?? 0,
        valorGlobal: dadosIniciais?.valorGlobal
          ? currencyUtils.aplicarMascara(dadosIniciais.valorGlobal)
          : '',
        formaPagamento: dadosIniciais?.formaPagamento ?? undefined,
        formaPagamentoComplemento:
          dadosIniciais?.formaPagamentoComplemento ?? '',
        tipoTermoReferencia:
          dadosIniciais?.tipoTermoReferencia ?? 'processo_rio',
        termoReferencia: dadosIniciais?.termoReferencia ?? '',
        vinculacaoPCA: dadosIniciais?.vinculacaoPCA ?? '',
      })
    }
  }, [dadosIniciais, form])

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
  }, [
    watchedValues.valorGlobal,
    handleValorContratoChange,
    onValorContratoChange,
  ])

  useEffect(() => {
    if (onDataChange) {
      // Usar form.getValues() para obter todos os valores, incluindo os definidos via setValue
      const todosOsValores = form.getValues()

      // Transformar unidades para garantir que principal seja sempre boolean
      const unidadesResponsaveisTransformadas = (
        todosOsValores.unidadesResponsaveis || []
      ).map((unidade) => ({
        ...unidade,
        principal: unidade.principal ?? false,
      }))

      const dados = {
        numeroContrato: todosOsValores.numeroContrato || '',
        processos: todosOsValores.processos || [],
        categoriaObjeto: todosOsValores.categoriaObjeto || '',
        descricaoObjeto: todosOsValores.descricaoObjeto || '',
        tipoContratacao: todosOsValores.tipoContratacao || '',
        tipoContrato: todosOsValores.tipoContrato || '',
        unidadesResponsaveis: unidadesResponsaveisTransformadas,
        contratacao: todosOsValores.contratacao || 'Centralizada',
        vigenciaInicial: todosOsValores.vigenciaInicial || '',
        vigenciaFinal: todosOsValores.vigenciaFinal || '',
        prazoInicialMeses: todosOsValores.prazoInicialMeses || 0,
        prazoInicialDias: todosOsValores.prazoInicialDias || 0,
        valorGlobal: todosOsValores.valorGlobal ?? '',
        formaPagamento: todosOsValores.formaPagamento ?? 'Mensal',
        formaPagamentoComplemento:
          todosOsValores.formaPagamentoComplemento ?? '',
        tipoTermoReferencia:
          todosOsValores.tipoTermoReferencia ?? 'processo_rio',
        termoReferencia: todosOsValores.termoReferencia ?? '',
        vinculacaoPCA: todosOsValores.vinculacaoPCA ?? '',
      }

      const currentDataString = JSON.stringify(dados)
      if (previousDataRef.current !== currentDataString) {
        previousDataRef.current = currentDataString
        handleDataChange(dados)
      }
    }
  }, [watchedValues, handleDataChange, onDataChange, form])

  const handleFormSubmit = (dados: FormDataContrato) => {
    // Transformar unidades para garantir que principal seja sempre boolean
    const unidadesResponsaveis = dados.unidadesResponsaveis || []
    const unidadesComPrincipalDefinido = unidadesResponsaveis.map(
      (unidade) => ({
        ...unidade,
        principal: unidade.principal ?? false,
      }),
    )

    // Validar unidades responsáveis
    const validacao = validateUnidadesResponsaveis(unidadesComPrincipalDefinido)

    if (!validacao.isValid) {
      toast.error(
        `Erro na validação das unidades: ${validacao.errors.join(', ')}`,
      )
      return
    }

    // Criar objeto DadosContrato diretamente dos dados do formulário
    const dadosContrato: DadosContrato = {
      ...dados,
      unidadesResponsaveis: unidadesComPrincipalDefinido,
    }

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
        console.error('Data inválida calculada:', {
          vigenciaInicial,
          prazoMeses,
          prazoDias,
        })
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

    const vigenciaFinal = calcularVigenciaFinal(
      vigenciaInicial,
      prazoMeses,
      prazoDias,
    )

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
      // Parse das datas usando split para evitar problemas de timezone
      const [anoInicial, mesInicial, diaInicial] = vigenciaInicial
        .split('-')
        .map(Number)
      const [anoFinal, mesFinal, diaFinal] = vigenciaFinal
        .split('-')
        .map(Number)

      if (
        !anoInicial ||
        !mesInicial ||
        !diaInicial ||
        !anoFinal ||
        !mesFinal ||
        !diaFinal
      ) {
        return { meses: 0, dias: 0 }
      }

      // Criar datas usando construtor local para evitar problemas de timezone
      const dataInicial = new Date(anoInicial, mesInicial - 1, diaInicial) // mes - 1 porque Date usa 0-based
      const dataFinal = new Date(anoFinal, mesFinal - 1, diaFinal)

      if (dataFinal <= dataInicial) {
        return { meses: 0, dias: 0 }
      }

      // Cálculo baseado em meses calendário reais (consistente com calcularVigenciaFinal)
      let anos = dataFinal.getFullYear() - dataInicial.getFullYear()
      let meses = dataFinal.getMonth() - dataInicial.getMonth()
      let dias = dataFinal.getDate() - dataInicial.getDate()

      // Ajustar se dias negativos
      if (dias < 0) {
        meses--
        // Calcular dias do mês anterior
        const ultimoDiaMesAnterior = new Date(
          dataFinal.getFullYear(),
          dataFinal.getMonth(),
          0,
        ).getDate()
        dias += ultimoDiaMesAnterior
      }

      // Ajustar se meses negativos
      if (meses < 0) {
        anos--
        meses += 12
      }

      // Converter anos para meses totais
      const mesesTotais = anos * 12 + meses

      return { meses: mesesTotais, dias }
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
    const { meses, dias } = calcularPrazoAPartirDaVigenciaFinal(
      vigenciaInicial,
      value,
    )

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

  const atualizarEtapa = (
    index: number,
    campo: keyof EtapaPagamento,
    valor: string,
  ) => {
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
    const jaExiste = processosSelecionados.some((p) => p.tipo === tipo)
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
                  // Obter estado da validação de duplicação
                  const {
                    isChecking,
                    isWaiting,
                    isUnique,
                    conflictData,
                    error,
                  } = validacaoNumero

                  // Estado visual baseado na validação
                  const getVisualState = () => {
                    if (error) return 'error'
                    if (isWaiting) return 'waiting'
                    if (isChecking) return 'checking'
                    if (isUnique === true) return 'available'
                    if (isUnique === false) return 'duplicate'
                    return 'default'
                  }

                  const visualState = getVisualState()

                  // Classes CSS baseadas no estado
                  const getInputClasses = () => {
                    switch (visualState) {
                      case 'waiting':
                        return 'border-gray-300 bg-gray-50 pr-10 transition-all duration-300'
                      case 'checking':
                        return 'border-blue-300 bg-blue-50 pr-10 transition-all duration-300'
                      case 'available':
                        return 'border-green-500 bg-green-50 pr-10 transition-all duration-300'
                      case 'duplicate':
                        return 'border-red-500 bg-red-50 pr-10 transition-all duration-300'
                      case 'error':
                        return 'border-yellow-500 bg-yellow-50 pr-10 transition-all duration-300'
                      default:
                        return 'transition-all duration-300'
                    }
                  }

                  // Ícone baseado no estado
                  const getIcon = () => {
                    switch (visualState) {
                      case 'waiting':
                        return (
                          <div className="flex items-center justify-center">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                            <div
                              className="mx-1 h-2 w-2 animate-pulse rounded-full bg-gray-400"
                              style={{ animationDelay: '0.2s' }}
                            />
                            <div
                              className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
                              style={{ animationDelay: '0.4s' }}
                            />
                          </div>
                        )
                      case 'checking':
                        return (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        )
                      case 'available':
                        return <Check className="h-4 w-4 text-green-500" />
                      case 'duplicate':
                        return <X className="h-4 w-4 text-red-500" />
                      case 'error':
                        return (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )
                      default:
                        return null
                    }
                  }

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
                            disabled={isChecking}
                            onChange={(e) => {
                              // Remove tudo que não é número
                              const apenasNumeros = e.target.value.replace(
                                /\D/g,
                                '',
                              )
                              field.onChange(apenasNumeros)
                            }}
                            className={cn(getInputClasses())}
                          />
                          {visualState !== 'default' && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                              {getIcon()}
                            </div>
                          )}
                        </div>
                      </FormControl>

                      {/* Mensagem de status */}
                      {visualState === 'waiting' && (
                        <p className="mt-1 text-xs text-gray-500 transition-opacity duration-300">
                          Aguardando para verificar...
                        </p>
                      )}

                      {visualState === 'checking' && (
                        <p className="mt-1 text-xs text-blue-600 transition-opacity duration-300">
                          Verificando disponibilidade...
                        </p>
                      )}

                      {visualState === 'available' && (
                        <p className="animate-in fade-in-0 mt-1 text-xs text-green-600 transition-all duration-300">
                          ✓ Número disponível
                        </p>
                      )}

                      {visualState === 'duplicate' && conflictData && (
                        <div className="animate-in fade-in-0 mt-1 text-xs text-red-600 transition-all duration-300">
                          <p>
                            ❌ Já existe - Contrato #
                            {conflictData.numeroContrato}
                          </p>
                          {conflictData.empresaRazaoSocial && (
                            <p className="mt-0.5 text-gray-600 transition-opacity duration-200">
                              Empresa: {conflictData.empresaRazaoSocial}
                            </p>
                          )}
                        </div>
                      )}

                      {visualState === 'error' && (
                        <p className="animate-in fade-in-0 mt-1 text-xs text-yellow-600 transition-all duration-300">
                          ⚠️ Erro na verificação - Tente novamente
                        </p>
                      )}

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
                    <FormLabel className="mb-2">Processos *</FormLabel>
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
                          <Plus className="mr-1 h-3 w-3" />
                          Processo SEI
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProcesso('rio')}
                          className="text-xs"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Processo RIO
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarProcesso('fisico')}
                          className="text-xs"
                        >
                          <Plus className="mr-1 h-3 w-3" />
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
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4" />
                Processos Adicionados ({processosSelecionados.length})
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {processosSelecionados.map((processo, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {processo.tipo === 'sei'
                          ? 'Processo SEI'
                          : processo.tipo === 'rio'
                            ? 'Processo RIO'
                            : 'Processo Físico'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerProcesso(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
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
                            const valorMascarado = aplicarMascaraSEI(
                              e.target.value,
                            )
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
                          <Popover
                            open={openProcesso}
                            onOpenChange={setOpenProcesso}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="mt-1 w-full justify-between text-xs"
                              >
                                {obterPrefixoSufixo(processo.valor) ||
                                  'Selecione o processo...'}
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
                                  <CommandEmpty>
                                    Digite para buscar um processo...
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {opcoesFiltradas.map((opcao) => (
                                      <CommandItem
                                        key={opcao}
                                        value={opcao}
                                        onSelect={(currentValue) => {
                                          const anoNumero = obterAnoNumero(
                                            processo.valor,
                                          )
                                          const processoCompleto = anoNumero
                                            ? `${currentValue}-${anoNumero}`
                                            : currentValue
                                          atualizarProcesso(
                                            index,
                                            processoCompleto,
                                          )
                                          setOpenProcesso(false)
                                          setPesquisaProcesso('')
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            obterPrefixoSufixo(
                                              processo.valor,
                                            ) === opcao
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
                              const valorMascarado = aplicarMascaraAnoNumero(
                                e.target.value,
                              )
                              const processoCompleto =
                                prefixo && valorMascarado
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
                            const valorMascarado = aplicarMascaraFisico(
                              e.target.value,
                            )
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <SelectItem value="Manutenção Corretiva e Preventiva Equipamentos Médicos">
                          Manutenção corretiva e preventiva equipamentos médicos
                        </SelectItem>
                        <SelectItem value="Manutenção Corretiva e Preventiva Predial">
                          Manutenção corretiva e preventiva predial
                        </SelectItem>
                        <SelectItem value="Prestação de Serviço COM Mão de Obra">
                          Prestação de serviço COM mão de obra
                        </SelectItem>
                        <SelectItem value="Prestação de Serviço SEM Mão de Obra">
                          Prestação de serviço SEM mão de obra
                        </SelectItem>
                        <SelectItem value="Serviço com Fornecimento e Cessão com Insumo">
                          Serviço com fornecimento e Cessão com insumo
                        </SelectItem>
                        <SelectItem value="Serviço de Locação Veículos">
                          Serviço de locação veículos
                        </SelectItem>
                        <SelectItem value="Informática">Informática</SelectItem>
                        <SelectItem value="Obra">Obra</SelectItem>
                        <SelectItem value="Permanente">Permanente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Tipo de Contratação - CAMPO OCULTO */}
            <div className="hidden">
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
                      defaultValue="Licitacao"
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
                    <FormLabel htmlFor="tipoContrato" className="mb-2">
                      Tipo de Contrato *
                    </FormLabel>
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

          {/* Nova Seção: Gerenciador de Unidades Responsáveis */}
          <FormField
            control={form.control}
            name="unidadesResponsaveis"
            render={({ field }) => (
              <FormItem>
                <UnidadeResponsavelManager
                  unidades={(field.value || []).map((unidade) => ({
                    ...unidade,
                    principal: unidade.principal ?? false,
                  }))}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Container para Contratação */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="contratacao"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="mb-2">Tipo de Contratação *</FormLabel>
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
                      <FormLabel htmlFor="vigenciaInicial" className="mb-2">
                        Vigência Inicial *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="vigenciaInicial"
                            type="date"
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
                    <FormLabel htmlFor="prazoInicialMeses" className="mb-2">
                      Prazo Inicial *
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="prazoInicialMeses"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={field.value?.toString() || ''}
                              onChange={(e) => {
                                const valorDigitado = e.target.value

                                // Permite campo vazio ou apenas números
                                if (
                                  valorDigitado === '' ||
                                  /^\d+$/.test(valorDigitado)
                                ) {
                                  const valor =
                                    valorDigitado === ''
                                      ? 0
                                      : parseInt(valorDigitado)

                                  // Aplica limite apenas se o valor exceder 72
                                  const valorFinal = valor > 72 ? 72 : valor

                                  field.onChange(valorFinal)

                                  // Só chama handlePrazoChange se o valor for válido
                                  if (valorFinal >= 0) {
                                    const prazoDias =
                                      form.getValues('prazoInicialDias')
                                    handlePrazoChange(valorFinal, prazoDias)
                                  }
                                }
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              className="h-10 pr-8 text-center"
                              placeholder="0"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-s-sm bg-gray-100 pr-3 pl-3">
                              <span className="text-muted-foreground text-xs font-medium">
                                Meses
                              </span>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex flex-col">
                              <button
                                type="button"
                                onClick={() => {
                                  const novoValor = Math.min(
                                    (field.value || 0) + 1,
                                    72,
                                  )
                                  field.onChange(novoValor)
                                  const prazoDias =
                                    form.getValues('prazoInicialDias')
                                  handlePrazoChange(novoValor, prazoDias)
                                }}
                                className="flex h-1/2 w-6 items-center justify-center rounded-tr-sm border-b border-l hover:bg-gray-100"
                                aria-label="Aumentar meses"
                              >
                                <ChevronsUpDown className="h-2 w-2 rotate-180" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const novoValor = Math.max(
                                    (field.value || 0) - 1,
                                    0,
                                  )
                                  field.onChange(novoValor)
                                  const prazoDias =
                                    form.getValues('prazoInicialDias')
                                  handlePrazoChange(novoValor, prazoDias)
                                }}
                                className="flex h-1/2 w-6 items-center justify-center rounded-br-sm border-l hover:bg-gray-100"
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
                              value={
                                form.watch('prazoInicialDias')?.toString() || ''
                              }
                              onChange={(e) => {
                                const valorDigitado = e.target.value

                                // Permite campo vazio ou apenas números
                                if (
                                  valorDigitado === '' ||
                                  /^\d+$/.test(valorDigitado)
                                ) {
                                  const valor =
                                    valorDigitado === ''
                                      ? 0
                                      : parseInt(valorDigitado)

                                  // Limita o valor máximo a 30 dias
                                  const valorFinal = valor > 30 ? 30 : valor

                                  form.setValue('prazoInicialDias', valorFinal)

                                  // Só chama handlePrazoChange se o valor for válido
                                  if (valorFinal >= 0) {
                                    const prazoMeses =
                                      form.getValues('prazoInicialMeses')
                                    handlePrazoChange(prazoMeses, valorFinal)
                                  }
                                }
                              }}
                              onBlur={field.onBlur}
                              name="prazoInicialDias"
                              className="h-10 pr-8 text-center"
                              placeholder="0"
                              data-testid="prazo-dias-input"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-s-sm bg-gray-100 pr-3 pl-3">
                              <span className="text-muted-foreground text-xs font-medium">
                                Dias
                              </span>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex flex-col">
                              <button
                                type="button"
                                onClick={() => {
                                  const novoValor = Math.min(
                                    (form.watch('prazoInicialDias') || 0) + 1,
                                    30,
                                  )
                                  form.setValue('prazoInicialDias', novoValor)
                                  const prazoMeses =
                                    form.getValues('prazoInicialMeses')
                                  handlePrazoChange(prazoMeses, novoValor)
                                }}
                                className="flex h-1/2 w-6 items-center justify-center rounded-tr-sm border-b border-l hover:bg-gray-100"
                                aria-label="Aumentar dias"
                              >
                                <ChevronsUpDown className="h-2 w-2 rotate-180" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const novoValor = Math.max(
                                    (form.watch('prazoInicialDias') || 0) - 1,
                                    0,
                                  )
                                  form.setValue('prazoInicialDias', novoValor)
                                  const prazoMeses =
                                    form.getValues('prazoInicialMeses')
                                  handlePrazoChange(prazoMeses, novoValor)
                                }}
                                className="flex h-1/2 w-6 items-center justify-center rounded-br-sm border-l hover:bg-gray-100"
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
                    <div className="text-muted-foreground mt-2 text-sm">
                      <span className="font-medium">Prazo total:</span>{' '}
                      {formatarPrazoTotal(
                        form.watch('prazoInicialMeses') || 0,
                        form.watch('prazoInicialDias') || 0,
                      )}
                      {vigenciaFinalEditadaManualmente && (
                        <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                          Calculado automaticamente
                        </span>
                      )}
                    </div>

                    {/* Aviso para prazos muito longos */}
                    {(form.watch('prazoInicialMeses') || 0) > 72 && (
                      <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
                        ⚠️ Prazo muito longo. Considere revisar a duração do
                        contrato.
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
                          <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-600">
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
                      <FormLabel htmlFor="valorGlobal" className="mb-2">
                        Valor do Contrato *
                      </FormLabel>
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
                    <FormLabel htmlFor="formaPagamento" className="mb-2">
                      Forma de Pagamento *
                    </FormLabel>
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
                            <FormLabel
                              htmlFor="formaPagamentoComplemento"
                              className="text-sm"
                            >
                              Detalhamento da forma de pagamento *
                            </FormLabel>
                            <FormControl>
                              <Input
                                id="formaPagamentoComplemento"
                                placeholder="Descreva a forma de pagamento..."
                                maxLength={100}
                                value={complementoField.value ?? ''}
                                onChange={complementoField.onChange}
                                onBlur={complementoField.onBlur}
                                name={complementoField.name}
                              />
                            </FormControl>
                            <div className="text-muted-foreground flex justify-between text-xs">
                              <span>
                                Campo obrigatório quando "Outro" é selecionado
                              </span>
                              <span>
                                {complementoField.value?.length ?? 0}/100
                              </span>
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
          {form.watch('formaPagamento') === 'Etapas' &&
            etapasPagamento.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4" />
                  Etapas de Pagamento ({etapasPagamento.length})
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {etapasPagamento.map((etapa, index) => (
                    <div
                      key={etapa.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          Etapa {etapa.numero}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-gray-600">
                            Data de Início *
                          </Label>
                          <Input
                            type="date"
                            value={etapa.dataInicio}
                            onChange={(e) =>
                              atualizarEtapa(
                                index,
                                'dataInicio',
                                e.target.value,
                              )
                            }
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
                            onChange={(e) =>
                              atualizarEtapa(index, 'dataFim', e.target.value)
                            }
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
                              const valorMascarado =
                                currencyUtils.aplicarMascara(e.target.value)
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
                    Tipo de Termo de Referência
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
                        className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300"
                      >
                        <RadioGroupItem
                          value="processo_rio"
                          id="processo_rio"
                          className="border-slate-300"
                        />
                        <ExternalLink className="h-5 w-5 text-slate-600" />
                        <div className="flex-1">
                          <span className="cursor-pointer font-medium">
                            Processo.Rio
                          </span>
                          <p className="text-xs text-gray-500">
                            Link do processo no sistema Processo.Rio
                          </p>
                        </div>
                      </label>
                      <label
                        htmlFor="google_drive"
                        className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300"
                      >
                        <RadioGroupItem
                          value="google_drive"
                          id="google_drive"
                          className="border-slate-300"
                        />
                        <ExternalLink className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <span className="cursor-pointer font-medium">
                            Google Drive
                          </span>
                          <p className="text-xs text-gray-500">
                            Link público do arquivo no Google Drive
                          </p>
                        </div>
                      </label>
                      <label
                        htmlFor="texto_livre"
                        className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-slate-300"
                      >
                        <RadioGroupItem
                          value="texto_livre"
                          id="texto_livre"
                          className="border-slate-300"
                        />
                        <FileText className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <span className="cursor-pointer font-medium">
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
                const termoValue = field.value ?? ''
                const isValidURL =
                  termoValue.length > 0 && tipoTermo !== 'texto_livre'
                    ? validarURL(termoValue)
                    : null

                return (
                  <FormItem>
                    <FormLabel htmlFor="termoReferencia" className="mb-2">
                      {tipoTermo === 'processo_rio'
                        ? 'Link do Processo.Rio'
                        : tipoTermo === 'google_drive'
                          ? 'Link do Google Drive'
                          : 'Descrição do Termo de Referência'}
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
                            isValidURL === true &&
                              'border-green-500 bg-green-50',
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
                const pcaValue = field.value ?? ''
                const isValidPCA =
                  pcaValue.length > 0 ? validarPCA(pcaValue) : null

                return (
                  <FormItem>
                    <FormLabel htmlFor="vinculacaoPCA" className="mb-2">
                      Vinculação a PCA - Ano
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

export default ContratoForm
