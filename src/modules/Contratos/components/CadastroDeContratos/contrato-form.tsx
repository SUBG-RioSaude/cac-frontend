import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, ExternalLink, FileText, Zap, Clock,  FolderOpen } from 'lucide-react'
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
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import { cn, currencyUtils } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
  numeroContrato: z.string().min(1, 'Número do contrato é obrigatório'),
  processoSei: z.string().min(1, 'Processo SEI é obrigatório'),
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
  unidadeDemandante: z.string().min(1, 'Unidade demandante é obrigatória'),
  unidadeGestora: z.string().min(1, 'Unidade gestora é obrigatória'),
  contratacao: z.enum(['Centralizada', 'Descentralizada']),
  vigenciaInicial: z.string().min(1, 'Data de vigência inicial é obrigatória'),
  vigenciaFinal: z.string().min(1, 'Data de vigência final é obrigatória'),
  prazoInicialMeses: z
    .number()
    .min(1, 'Prazo deve ser pelo menos 1 mês')
    .max(60, 'Prazo máximo de 60 meses'),
  valorGlobal: z.string().min(1, 'Valor global é obrigatório').refine(currencyUtils.validar, 'Valor deve ser maior que zero'),
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  tipoTermoReferencia: z.enum(['processo_rio', 'google_drive', 'texto_livre']),
  termoReferencia: z.string().min(1, 'Termo de referência é obrigatório'),
  vinculacaoPCA: z.string().min(1, 'Vinculação a PCA é obrigatória'),
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

export default function ContratoForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
}: ContratoFormProps) {
  const { submitForm, isSubmitting, error } = useFormAsyncOperation()
  const [tipoTermo, setTipoTermo] = useState<
    'processo_rio' | 'google_drive' | 'texto_livre'
  >('processo_rio')

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
        unidadeGestora: watchedValues.unidadeGestora || '',
        contratacao: watchedValues.contratacao || 'Centralizada',
        vigenciaInicial: watchedValues.vigenciaInicial || '',
        vigenciaFinal: watchedValues.vigenciaFinal || '',
        prazoInicialMeses: watchedValues.prazoInicialMeses || 0,
        valorGlobal: watchedValues.valorGlobal || '',
        formaPagamento: watchedValues.formaPagamento || '',
        tipoTermoReferencia:
          watchedValues.tipoTermoReferencia || 'processo_rio',
        termoReferencia: watchedValues.termoReferencia || '',
        vinculacaoPCA: watchedValues.vinculacaoPCA || '',
        ativo: watchedValues.ativo || false,
      }
      
      // Só chama onDataChange se os dados realmente mudaram
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

  const calcularVigenciaFinal = (
    vigenciaInicial: string,
    prazoMeses: number,
  ) => {
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

  const preencherDadosTeste = () => {
    form.reset({
      numeroContrato: '2024/001',
      processoSei: '23283.000123/2024-45',
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
      valorGlobal: currencyUtils.formatar(1500000),
      formaPagamento:
        'Mensal, mediante apresentação de nota fiscal e relatório de atividades',
      tipoTermoReferencia: 'processo_rio',
      termoReferencia: 'https://processo.rio/processo/12345',
      vinculacaoPCA: '2024',
      ativo: true,
    })

    if(!error) {
      return <div>Erro ao carregar dados do contrato</div>
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="numeroContrato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: CONT-2024-001" 
                    aria-required="true"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="processoSei"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Processo SEI / Processo.rio *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: 12345678901234567890" 
                    aria-required="true"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoriaObjeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria do Objeto do Contrato *</FormLabel>
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
                  <SelectItem value="informatica">Informática</SelectItem>
                  <SelectItem value="manutencao_corretiva_preventiva_equipamentos_medicos">
                    Manutenção corretiva e preventiva equipamentos médicos
                  </SelectItem>
                  <SelectItem value="manutencao_corretiva_preventiva_predial">
                    Manutenção corretiva e preventiva predial
                  </SelectItem>
                  <SelectItem value="obra">Obra</SelectItem>
                  <SelectItem value="permanente">Permanente</SelectItem>
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

        <FormField
          control={form.control}
          name="descricaoObjeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Objeto *</FormLabel>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tipoContratacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contratação *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
          <FormField
            control={form.control}
            name="tipoContrato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contrato *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Prestacao_Servico">
                      Prestação de Serviço
                    </SelectItem>
                    <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                    <SelectItem value="Manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="unidadeDemandante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade Demandante *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Secretaria de Administração"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unidadeGestora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade Gestora *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Departamento de Compras" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contratacao"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Contratação *</FormLabel>
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

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">Prazos e Valores</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="vigenciaInicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vigência Inicial *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleVigenciaInicialChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prazoInicialMeses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo Inicial (meses) *</FormLabel>
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
            <FormField
              control={form.control}
              name="vigenciaFinal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vigência Final</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      readOnly
                      className="bg-gray-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="valorGlobal"
              render={({ field }) => {
                const valorValue = field.value || ''
                const isValidValor = valorValue.length > 0 ? currencyUtils.validar(valorValue) : null

                return (
                  <FormItem>
                    <FormLabel>Valor Global *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        {...field}
                        onChange={(e) => {
                          const valorMascarado = currencyUtils.aplicarMascara(e.target.value)
                          field.onChange(valorMascarado)
                        }}
                        className={
                          isValidValor === true
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                            : isValidValor === false
                              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
                              : ''
                        }
                      />
                    </FormControl>
                    {isValidValor === true && (
                      <p className="flex items-center gap-1 text-sm text-green-600">
                        <span className="text-green-500">✓</span>
                        Valor válido
                      </p>
                    )}
                    {isValidValor === false && (
                      <p className="flex items-center gap-1 text-sm text-red-600">
                        <span className="text-red-500">✗</span>
                        Valor deve ser maior que zero
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="formaPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: À vista, Parcelado, etc."
                      {...field}
                    />
                  </FormControl>
                  
                  {/* Espaço reservado para manter alinhamento com campo de valor */}
                  <div className="h-6 mt-1"></div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">
              Documentos e Informações Adicionais
            </h3>
          </div>

          {/* Tipo de Termo de Referência */}
          <FormField
            control={form.control}
            name="tipoTermoReferencia"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Termo de Referência *</FormLabel>
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

          {/* Campo dinâmico baseado no tipo selecionado */}
          <FormField
            control={form.control}
            name="termoReferencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tipoTermo === 'processo_rio' && 'URL do Processo.Rio *'}
                  {tipoTermo === 'google_drive' && 'URL do Google Drive *'}
                  {tipoTermo === 'texto_livre' &&
                    'Descrição do Termo de Referência *'}
                </FormLabel>
                <FormControl>
                  {tipoTermo === 'texto_livre' ? (
                    <Textarea
                      placeholder="Descreva o termo de referência..."
                      rows={4}
                      {...field}
                    />
                  ) : (
                    <Input
                      type="url"
                      placeholder={
                        tipoTermo === 'processo_rio'
                          ? 'https://processo.rio/processo/...'
                          : 'https://drive.google.com/file/d/...'
                      }
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vinculacaoPCA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vinculação a PCA - Ano *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Contrato ativo</FormLabel>
                </div>
              </FormItem>
            )}
          />
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
