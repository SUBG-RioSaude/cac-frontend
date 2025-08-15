import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, ExternalLink, FileText, Zap, Clock, FolderOpen, Check, X, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
  const regex = /^CONT-\d{4}-\d{4}$/
  if (!regex.test(numero)) return false
  
  const [, ano] = numero.split('-')
  const anoAtual = new Date().getFullYear()
  return parseInt(ano) <= anoAtual
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

export interface DadosContrato {
  numeroContrato: string
  processoSei: string
  categoriaObjeto: string
  descricaoObjeto: string
  tipoContratacao: 'Licitacao' | 'Pregao' | 'Dispensa' | 'Inexigibilidade'
  tipoContrato: 'Compra' | 'Prestacao_Servico' | 'Fornecimento' | 'Manutencao'
  unidadeDemandante: string
  unidadeGestora: string
  contratacao: 'Centralizada' | 'Descentralizada'
  vigenciaInicial: string
  vigenciaFinal: string
  prazoInicialMeses: number
  valorGlobal: string
  formaPagamento: string
  tipoTermoReferencia: 'processo_rio' | 'google_drive' | 'texto_livre'
  termoReferencia: string
  vinculacaoPCA: string
  ativo: boolean
}

const schemaContrato = z.object({
  numeroContrato: z.string()
    .min(1, 'Número do contrato é obrigatório')
    .refine(validarNumeroContrato, 'Formato inválido. Use: CONT-ANO-NUMERO (ex: CONT-2024-0003)'),
  processoSei: z.string().min(1, 'Processo SEI é obrigatório'),
  categoriaObjeto: z.string().min(1, 'Categoria do objeto é obrigatória'),
  descricaoObjeto: z.string().min(1, 'Descrição do objeto é obrigatória'),
  tipoContratacao: z.enum(['Licitacao', 'Pregao', 'Dispensa', 'Inexigibilidade']),
  tipoContrato: z.enum(['Compra', 'Prestacao_Servico', 'Fornecimento', 'Manutencao']),
  unidadeDemandante: z.string().min(1, 'Unidade demandante é obrigatória'),
  unidadeGestora: z.string().min(1, 'Unidade gestora é obrigatória'),
  contratacao: z.enum(['Centralizada', 'Descentralizada']),
  vigenciaInicial: z.string()
    .min(1, 'Data de vigência inicial é obrigatória')
    .refine(validarData, 'Data não pode ser posterior à data atual'),
  vigenciaFinal: z.string().min(1, 'Data de vigência final é obrigatória'),
  prazoInicialMeses: z.number()
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .max(60, 'Prazo máximo de 60 meses'),
  valorGlobal: z.string()
    .min(1, 'Valor global é obrigatório')
    .refine(currencyUtils.validar, 'Valor deve ser maior que zero')
    .refine((valor) => {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'))
      return valorNumerico >= 100
    }, 'Valor mínimo é R$ 100,00'),
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  tipoTermoReferencia: z.enum(['processo_rio', 'google_drive', 'texto_livre']),
  termoReferencia: z.string().min(1, 'Termo de referência é obrigatório'),
  vinculacaoPCA: z.string()
    .min(1, 'Vinculação a PCA é obrigatória')
    .refine(validarPCA, 'Apenas números são permitidos'),
  ativo: z.boolean(),
})

type FormDataContrato = z.infer<typeof schemaContrato>

interface ContratoFormProps {
  onSubmit: (dados: DadosContrato) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosContrato>
  onAdvanceRequest?: (dados: DadosContrato) => void
  onDataChange?: (dados: Partial<DadosContrato>) => void
}

interface ProcessoInstrutivo {
  prefixos: string[]
  sufixos: string[]
}

interface Unidades {
  demandantes: string[]
  gestoras: string[]
}

export default function ContratoForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
}: ContratoFormProps) {
  const { submitForm, isSubmitting } = useFormAsyncOperation()
  const [tipoTermo, setTipoTermo] = useState<'processo_rio' | 'google_drive' | 'texto_livre'>('processo_rio')
  const [processoInstrutivo, setProcessoInstrutivo] = useState<ProcessoInstrutivo | null>(null)
  const [unidades, setUnidades] = useState<Unidades | null>(null)
  const [openProcesso, setOpenProcesso] = useState(false)
  const [processoSelecionado, setProcessoSelecionado] = useState('')
  const [pesquisaProcesso, setPesquisaProcesso] = useState('')

  // Carregar dados do processo instrutivo
  useEffect(() => {
    const carregarProcessoInstrutivo = async () => {
      try {
        const response = await fetch('/src/modules/Contratos/data/processo-instrutivo.json')
        const data = await response.json()
        setProcessoInstrutivo(data)
      } catch (error) {
        console.error('Erro ao carregar processo instrutivo:', error)
      }
    }
    carregarProcessoInstrutivo()
  }, [])

  // Carregar dados das unidades
  useEffect(() => {
    const carregarUnidades = async () => {
      try {
        const response = await fetch('/src/modules/Contratos/data/contratos-data.json')
        const data = await response.json()
        setUnidades(data.unidades)
      } catch (error) {
        console.error('Erro ao carregar unidades:', error)
      }
    }
    carregarUnidades()
  }, [])

  const form = useForm<FormDataContrato>({
    resolver: zodResolver(schemaContrato),
    defaultValues: {
      numeroContrato: '',
      processoSei: '',
      categoriaObjeto: '',
      descricaoObjeto: '',
      tipoContratacao: 'Licitacao',
      tipoContrato: 'Compra',
      unidadeDemandante: '',
      unidadeGestora: '',
      contratacao: 'Centralizada',
      vigenciaInicial: '',
      vigenciaFinal: '',
      prazoInicialMeses: 12,
      valorGlobal: '',
      formaPagamento: '',
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: '',
      vinculacaoPCA: '',
      ativo: true,
      ...dadosIniciais,
    },
  })

  // Watch para mudanças em tempo real
  const watchedValues = form.watch()
  const previousDataRef = useRef<string | null>(null)

  // Sincronizar processo selecionado com dados iniciais
  useEffect(() => {
    if (dadosIniciais.processoSei) {
      setProcessoSelecionado(dadosIniciais.processoSei)
    }
  }, [dadosIniciais.processoSei])

  // Limpar pesquisa quando popover fechar
  useEffect(() => {
    if (!openProcesso) {
      setPesquisaProcesso('')
    }
  }, [openProcesso])

  useEffect(() => {
    if (onDataChange) {
      const dados = {
        numeroContrato: watchedValues.numeroContrato || '',
        processoSei: watchedValues.processoSei || '',
        categoriaObjeto: watchedValues.categoriaObjeto || '',
        descricaoObjeto: watchedValues.descricaoObjeto || '',
        tipoContratacao: watchedValues.tipoContratacao || '',
        tipoContrato: watchedValues.tipoContrato || '',
        unidadeDemandante: watchedValues.unidadeDemandante || '',
        unidadeGestora: watchedValues.unidadeGestora || 'Centralizada',
        contratacao: watchedValues.contratacao || 'Centralizada',
        vigenciaInicial: watchedValues.vigenciaInicial || '',
        vigenciaFinal: watchedValues.vigenciaFinal || '',
        prazoInicialMeses: watchedValues.prazoInicialMeses || 0,
        valorGlobal: watchedValues.valorGlobal || '',
        formaPagamento: watchedValues.formaPagamento || '',
        tipoTermoReferencia: watchedValues.tipoTermoReferencia || 'processo_rio',
        termoReferencia: watchedValues.termoReferencia || '',
        vinculacaoPCA: watchedValues.vinculacaoPCA || '',
        ativo: watchedValues.ativo || false,
      }
      
      const currentDataString = JSON.stringify(dados)
      if (previousDataRef.current !== currentDataString) {
        previousDataRef.current = currentDataString
        onDataChange(dados)
      }
    }
  }, [watchedValues, onDataChange])

  const handleFormSubmit = (dados: FormDataContrato) => {
    const dadosContrato = dados as DadosContrato
    
    const submitOperation = async () => {
      if (onAdvanceRequest) {
        await onAdvanceRequest(dadosContrato)
      } else {
        await onSubmit?.(dadosContrato)
      }
    }

    submitForm(dados, submitOperation)
  }

  const calcularVigenciaFinal = (vigenciaInicial: string, prazoMeses: number) => {
    if (!vigenciaInicial) return ''

    const data = new Date(vigenciaInicial)
    data.setMonth(data.getMonth() + prazoMeses)
    return data.toISOString().split('T')[0]
  }

  const handleVigenciaInicialChange = (value: string) => {
    const prazoAtual = form.getValues('prazoInicialMeses')
    const vigenciaFinal = calcularVigenciaFinal(value, prazoAtual)
    form.setValue('vigenciaFinal', vigenciaFinal)
  }

  const handlePrazoChange = (value: number) => {
    const vigenciaInicial = form.getValues('vigenciaInicial')
    const vigenciaFinal = calcularVigenciaFinal(vigenciaInicial, value)
    form.setValue('vigenciaFinal', vigenciaFinal)
  }

  const aplicarMascaraNumeroContrato = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 4) {
      return `CONT-${apenasNumeros}`
    } else if (apenasNumeros.length <= 8) {
      return `CONT-${apenasNumeros.slice(0, 4)}-${apenasNumeros.slice(4)}`
    } else {
      return `CONT-${apenasNumeros.slice(0, 4)}-${apenasNumeros.slice(4, 8)}`
    }
  }

  const preencherDadosTeste = () => {
    const processoTeste = 'SMS-PRO-2024/001'
    form.reset({
      numeroContrato: 'CONT-2024-0001',
      processoSei: processoTeste,
      categoriaObjeto: 'prestacao_servico_com_mao_obra',
      descricaoObjeto: 'Prestação de serviços de limpeza e conservação para unidades de saúde, incluindo fornecimento de materiais e equipamentos necessários.',
      tipoContratacao: 'Pregao',
      tipoContrato: 'Prestacao_Servico',
      unidadeDemandante: 'Secretaria Municipal de Saúde',
      unidadeGestora: 'Departamento de Administração e Finanças',
      contratacao: 'Centralizada',
      vigenciaInicial: '2024-01-15',
      vigenciaFinal: '2024-12-31',
      prazoInicialMeses: 12,
      valorGlobal: currencyUtils.formatar(1500000),
      formaPagamento: 'Boleto',
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: 'https://processo.rio/processo/12345',
      vinculacaoPCA: '2024',
      ativo: true,
    })
    setProcessoSelecionado(processoTeste)
  }

  // Função para filtrar opções baseado na pesquisa
  const filtrarOpcoesProcesso = useCallback((pesquisa: string) => {
    if (!processoInstrutivo || !pesquisa.trim()) return []
    
    const pesquisaLower = pesquisa.toLowerCase().trim()
    const opcoes: string[] = []
    
    processoInstrutivo.prefixos.forEach(prefixo => {
      processoInstrutivo.sufixos.forEach(sufixo => {
        const opcao = `${prefixo}-${sufixo}`
        if (opcao.toLowerCase().includes(pesquisaLower)) {
          opcoes.push(opcao)
        }
      })
    })
    
    return opcoes.sort()
  }, [processoInstrutivo])

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

  // Memoizar o prefixo-sufixo selecionado para evitar recálculos
  const prefixoSufixoSelecionado = useMemo(() => {
    return obterPrefixoSufixo(processoSelecionado)
  }, [processoSelecionado, obterPrefixoSufixo])

  // Memoizar a função de seleção para evitar recriações
  const handleSelecaoProcesso = useCallback((currentValue: string) => {
    const prefixoSufixo = currentValue
    const anoNumero = obterAnoNumero(processoSelecionado)
    const processoCompleto = anoNumero ? `${prefixoSufixo}-${anoNumero}` : prefixoSufixo
    
    setProcessoSelecionado(processoCompleto)
    setOpenProcesso(false)
    setPesquisaProcesso('')
    return processoCompleto
  }, [processoSelecionado, obterAnoNumero])

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
            <h3 className="text-base font-semibold text-gray-900">Informações Básicas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Número do Contrato */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="numeroContrato"
                render={({ field }) => {
                  const numeroValue = field.value || ''
                  const isValidNumero = numeroValue.length > 0 ? validarNumeroContrato(numeroValue) : null

                  return (
                    <FormItem>
                      <FormLabel className="mb-2">Número do Contrato *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="CONT-2024-0001"
                            {...field}
                            onChange={(e) => {
                              const valorMascarado = aplicarMascaraNumeroContrato(e.target.value)
                              field.onChange(valorMascarado)
                              
                              if (valorMascarado.length >= 13) {
                                const isValid = validarNumeroContrato(valorMascarado)
                                if (isValid) {
                                  toast.success('Número do contrato válido!')
                                } else {
                                  toast.error('Formato inválido. Use: CONT-ANO-NUMERO')
                                }
                              }
                            }}
                            className={cn(
                              isValidNumero === true && "border-green-500 bg-green-50 pr-10",
                              isValidNumero === false && "border-red-500 bg-red-50 pr-10"
                            )}
                          />
                          {isValidNumero !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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

            {/* Container para Processo SEI */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="processoSei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Processo SEI / Processo.rio *</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                         <Popover open={openProcesso} onOpenChange={setOpenProcesso}>
                           <PopoverTrigger asChild>
                             <Button
                               variant="outline"
                               role="combobox"
                               aria-expanded={openProcesso}
                               className="w-full justify-between"
                             >
                               {prefixoSufixoSelecionado || "Selecione o processo..."}
                               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-full p-2" align="start">
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
                                         const processoCompleto = handleSelecaoProcesso(currentValue)
                                         field.onChange(processoCompleto)
                                       }}
                                     >
                                       <Check
                                         className={cn(
                                           "mr-2 h-4 w-4",
                                           obterPrefixoSufixo(processoSelecionado) === opcao ? "opacity-100" : "opacity-0"
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
                         
                         <Input
                           placeholder="ANO/NUMERO"
                           className="w-full"
                           value={obterAnoNumero(field.value)}
                           onChange={(e) => {
                             const prefixoSufixo = obterPrefixoSufixo(field.value)
                             const anoNumero = e.target.value
                             const processoCompleto = prefixoSufixo && anoNumero ? `${prefixoSufixo}-${anoNumero}` : prefixoSufixo
                             
                             field.onChange(processoCompleto)
                             setProcessoSelecionado(processoCompleto)
                           }}
                         />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Container para Categoria do Objeto */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="categoriaObjeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Categoria do Objeto do Contrato *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cessao_com_insumo">
                        Cessão com insumo
                      </SelectItem>
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
                      <SelectItem value="servico_com_fornecimento">
                        Serviço com fornecimento
                      </SelectItem>
                      <SelectItem value="servico_locacao_veiculos">
                        Serviço de locação veículos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Container para Descrição do Objeto */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="descricaoObjeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Descrição do Objeto *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do objeto do contrato..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Tipo de Contratação */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="tipoContratacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Tipo de Contratação *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Licitacao">Licitação</SelectItem>
                        <SelectItem value="Pregao">Pregão</SelectItem>
                        <SelectItem value="Dispensa">Dispensa</SelectItem>
                        <SelectItem value="Inexigibilidade">Inexigibilidade</SelectItem>
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
                    <FormLabel className="mb-2">Tipo de Contrato *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Compra">Compra</SelectItem>
                        <SelectItem value="Prestacao_Servico">Prestação de Serviço</SelectItem>
                        <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                        <SelectItem value="Manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Unidade Demandante */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="unidadeDemandante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Unidade Demandante *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidades?.demandantes?.map((unidade: string) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <FormLabel className="mb-2">Unidade Gestora *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidades?.gestoras?.map((unidade: string) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  const isValidData = dataValue.length > 0 ? validarData(dataValue) : null

                  return (
                    <FormItem>
                      <FormLabel className="mb-2">Vigência Inicial *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleVigenciaInicialChange(e.target.value)
                              
                              if (e.target.value) {
                                const isValid = validarData(e.target.value)
                                if (isValid) {
                                  toast.success('Data válida!')
                                } else {
                                  toast.error('Data não pode ser posterior à data atual')
                                }
                              }
                            }}
                            className={cn(
                              isValidData === true && "border-green-500 bg-green-50 pr-10",
                              isValidData === false && "border-red-500 bg-red-50 pr-10"
                            )}
                          />
                          {isValidData !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                    <FormLabel className="mb-2">Prazo Inicial (meses) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        {...field}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 12
                          field.onChange(valor)
                          handlePrazoChange(valor)
                        }}
                      />
                    </FormControl>
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
                  const prazoMeses = form.watch('prazoInicialMeses')
                  const isDisabled = !vigenciaInicial || !prazoMeses

                  return (
                    <FormItem>
                      <FormLabel className="mb-2">Vigência Final</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          readOnly={isDisabled}
                          className={cn(
                            isDisabled && "bg-gray-50 cursor-not-allowed"
                          )}
                          {...field}
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
            {/* Container para Valor Global */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="valorGlobal"
                render={({ field }) => {
                  const valorValue = field.value || ''
                  const isValidValor = valorValue.length > 0 ? currencyUtils.validar(valorValue) : null
                  const valorNumerico = valorValue.length > 0 ? parseFloat(valorValue.replace(/[^\d,]/g, '').replace(',', '.')) : 0
                  const isValorMinimo = valorNumerico >= 100

                  return (
                    <FormItem>
                      <FormLabel className="mb-2">Valor Global *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="R$ 0,00"
                            {...field}
                            onChange={(e) => {
                              const valorMascarado = currencyUtils.aplicarMascara(e.target.value)
                              field.onChange(valorMascarado)
                            }}
                            className={cn(
                              isValidValor === true && isValorMinimo && "border-green-500 bg-green-50 pr-10",
                              (isValidValor === false || !isValorMinimo) && "border-red-500 bg-red-50 pr-10"
                            )}
                          />
                          {isValidValor !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                      {(isValidValor === false || !isValorMinimo) && valorValue.length > 0 && (
                        <p className="flex items-center gap-1 text-sm text-red-600">
                          <span className="text-red-500">✗</span>
                          {!isValorMinimo ? 'Valor mínimo é R$ 100,00' : 'Valor deve ser maior que zero'}
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
                    <FormLabel className="mb-2">Forma de Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cartao">Cartão</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Espaço reservado para manter alinhamento com campo de valor */}
                    <div className="h-6 mt-1"></div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Documentos e Informações Adicionais */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">Documentos e Informações Adicionais</h3>
          </div>

          {/* Tipo de Termo de Referência */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="tipoTermoReferencia"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="mb-2">Tipo de Termo de Referência *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value)
                        setTipoTermo(value as 'processo_rio' | 'google_drive' | 'texto_livre')
                        form.setValue('termoReferencia', '')
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="hover:border-slate-300 flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors">
                        <RadioGroupItem
                          value="processo_rio"
                          id="processo_rio"
                          className="border-slate-300"
                        />
                        <ExternalLink className="text-slate-600 h-5 w-5" />
                        <div>
                          <Label htmlFor="processo_rio" className="font-medium">
                            Processo.Rio
                          </Label>
                          <p className="text-xs text-gray-500">
                            Link do processo no sistema Processo.Rio
                          </p>
                        </div>
                      </div>
                      <div className="hover:border-slate-300 flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors">
                        <RadioGroupItem
                          value="google_drive"
                          id="google_drive"
                          className="border-slate-300"
                        />
                        <ExternalLink className="h-5 w-5 text-green-600" />
                        <div>
                          <Label htmlFor="google_drive" className="font-medium">
                            Google Drive
                          </Label>
                          <p className="text-xs text-gray-500">
                            Link público do arquivo no Google Drive
                          </p>
                        </div>
                      </div>
                      <div className="hover:border-slate-300 flex items-center space-x-3 rounded-lg border border-gray-200 p-3 transition-colors">
                        <RadioGroupItem
                          value="texto_livre"
                          id="texto_livre"
                          className="border-slate-300"
                        />
                        <FileText className="h-5 w-5 text-amber-600" />
                        <div>
                          <Label htmlFor="texto_livre" className="font-medium">
                            Texto Livre
                          </Label>
                          <p className="text-xs text-gray-500">
                            Descrição textual do termo de referência
                          </p>
                        </div>
                      </div>
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
                const isValidURL = termoValue.length > 0 && tipoTermo !== 'texto_livre' ? validarURL(termoValue) : null

                return (
                  <FormItem>
                    <FormLabel className="mb-2">
                      {tipoTermo === 'processo_rio' && 'URL do Processo.Rio *'}
                      {tipoTermo === 'google_drive' && 'URL do Google Drive *'}
                      {tipoTermo === 'texto_livre' && 'Descrição do Termo de Referência *'}
                    </FormLabel>
                    <FormControl>
                      {tipoTermo === 'texto_livre' ? (
                        <Textarea
                          placeholder="Descreva o termo de referência..."
                          rows={4}
                          {...field}
                        />
                      ) : (
                        <div className="relative">
                          <Input
                            type="url"
                            placeholder={
                              tipoTermo === 'processo_rio'
                                ? 'https://processo.rio/processo/...'
                                : 'https://drive.google.com/file/d/...'
                            }
                            {...field}
                                                         onChange={(e) => {
                               field.onChange(e)
                               if (e.target.value && (tipoTermo === 'processo_rio' || tipoTermo === 'google_drive')) {
                                 const isValid = validarURL(e.target.value)
                                 if (isValid) {
                                   toast.success('URL válida!')
                                 } else {
                                   toast.error('URL inválida. Verifique o formato.')
                                 }
                               }
                             }}
                            className={cn(
                              isValidURL === true && "border-green-500 bg-green-50 pr-10",
                              isValidURL === false && "border-red-500 bg-red-50 pr-10"
                            )}
                          />
                          {isValidURL !== null && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isValidURL ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
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
                const isValidPCA = pcaValue.length > 0 ? validarPCA(pcaValue) : null

                return (
                  <FormItem>
                    <FormLabel className="mb-2">Vinculação a PCA - Ano *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
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
                            isValidPCA === true && "border-green-500 bg-green-50 pr-10",
                            isValidPCA === false && "border-red-500 bg-red-50 pr-10"
                          )}
                        />
                        {isValidPCA !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
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

          {/* Container para Contrato Ativo */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="font-medium text-slate-700">
                      Contrato ativo
                    </FormLabel>
                    <p className="text-xs text-slate-600">
                      Marque esta opção para manter o contrato ativo no sistema
                    </p>
                  </div>
                </FormItem>
              )}
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
              <Zap className="h-4 w-4 mr-2" />
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
              aria-label={isSubmitting ? 'Processando dados do contrato...' : 'Avançar para próximo passo'}
              className={cn(
                'bg-slate-700 shadow-slate-700/20 hover:bg-slate-600 flex items-center gap-2 px-8 py-2.5 shadow-lg transition-all duration-200',
                isSubmitting && 'opacity-50 cursor-not-allowed'
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
