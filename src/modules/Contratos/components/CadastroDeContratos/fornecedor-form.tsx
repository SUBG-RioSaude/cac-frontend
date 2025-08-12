import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, ArrowRight, BarChart3, Zap, MapPin, Users, Check, X, Settings } from 'lucide-react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { useEffect, useRef } from 'react'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cnpjUtils, ieUtils, imUtils, cn } from '@/lib/utils'
import { useCEP } from '@/hooks/use-cep'

interface Contato {
  id: string
  nome: string
  valor: string
  tipo: 'Telefone' | 'Celular' | 'Email'
  ativo: boolean
}

export interface DadosFornecedor {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  estadoIE?: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  ativo: boolean
  contatos: Contato[]
}

type DadosFornecedorSchema = z.infer<typeof fornecedorSchema>

interface FornecedorFormProps {
  onSubmit: (dados: DadosFornecedor) => void
  onCancel?: () => void
  dadosIniciais?: Partial<DadosFornecedor>
  onAdvanceRequest?: (dados: DadosFornecedor) => void
  onDataChange?: (dados: Partial<DadosFornecedor>) => void
}

const fornecedorSchema = z.object({
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(cnpjUtils.validar, 'CNPJ inválido'),
  razaoSocial: z.string().min(1, 'Razão Social é obrigatória'),
  nomeFantasia: z.string().optional().or(z.literal('')),
  estadoIE: z.string().optional().or(z.literal('')),
  inscricaoEstadual: z.string().optional().or(z.literal('')),
  inscricaoMunicipal: z.string().optional().or(z.literal('')),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z
    .string()
    .min(1, 'Estado é obrigatório')
    .max(2, 'Use apenas 2 caracteres'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  ativo: z.boolean(),
  contatos: z
    .array(
      z.object({
        id: z.string(),
        nome: z.string().optional().or(z.literal('')),
        valor: z.string().optional().or(z.literal('')),
        tipo: z.enum(['Telefone', 'Celular', 'Email']),
        ativo: z.boolean(),
      }),
    )
    .optional()
    .default([]),
})

export default function FornecedorForm({
  onSubmit,
  onCancel,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
}: FornecedorFormProps) {
  const { submitForm, isSubmitting } = useFormAsyncOperation()
  
  // Hook para busca de CEP
  const { buscarCEP, isLoading: isLoadingCEP, error: errorCEP, clearError } = useCEP({
    onSuccess: (enderecoData) => {
      // Preenche os campos automaticamente quando encontrar o endereço
      form.setValue('endereco', enderecoData.logradouro || '')
      form.setValue('bairro', enderecoData.bairro || '')
      form.setValue('cidade', enderecoData.localidade || '')
      form.setValue('estado', enderecoData.uf || '')
      
      // Foca no campo número após preencher
      setTimeout(() => {
        const numeroField = document.querySelector('input[name="numero"]') as HTMLInputElement
        numeroField?.focus()
      }, 100)
    },
  })
  const form = useForm<DadosFornecedorSchema>({
    resolver: zodResolver(fornecedorSchema) as Resolver<DadosFornecedorSchema>,
    defaultValues: {
      cnpj: dadosIniciais?.cnpj ? cnpjUtils.formatar(dadosIniciais.cnpj) : '',
      razaoSocial: dadosIniciais?.razaoSocial || '',
      nomeFantasia: dadosIniciais?.nomeFantasia || '',
      estadoIE: dadosIniciais?.estadoIE || '',
      inscricaoEstadual: dadosIniciais?.inscricaoEstadual || '',
      inscricaoMunicipal: dadosIniciais?.inscricaoMunicipal || '',
      endereco: dadosIniciais?.endereco || '',
      numero: dadosIniciais?.numero || '',
      complemento: dadosIniciais?.complemento || '',
      bairro: dadosIniciais?.bairro || '',
      cidade: dadosIniciais?.cidade || '',
      estado: dadosIniciais?.estado || '',
      cep: dadosIniciais?.cep || '',
      ativo: dadosIniciais?.ativo ?? true,
      contatos: dadosIniciais?.contatos || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contatos',
  })

  // Watch para mudanças em tempo real
  const watchedValues = form.watch()
  const previousDataRef = useRef<string>()
  
  // Estado para controlar se campos de endereço estão habilitados
  const cepValue = form.watch('cep') || ''
  const isCepValid = /^\d{5}-\d{3}$/.test(cepValue)
  const shouldEnableAddressFields = isCepValid && !isLoadingCEP

  useEffect(() => {
    if (onDataChange) {
      const dados = {
        cnpj: watchedValues.cnpj ? cnpjUtils.limpar(watchedValues.cnpj) : '',
        razaoSocial: watchedValues.razaoSocial || '',
        nomeFantasia: watchedValues.nomeFantasia || '',
        endereco: watchedValues.endereco || '',
        numero: watchedValues.numero || '',
        complemento: watchedValues.complemento || '',
        bairro: watchedValues.bairro || '',
        cidade: watchedValues.cidade || '',
        estado: watchedValues.estado || '',
        cep: watchedValues.cep || '',
        inscricaoEstadual: watchedValues.inscricaoEstadual || '',
        inscricaoMunicipal: watchedValues.inscricaoMunicipal || '',
        contatos: (watchedValues.contatos || []).map((contato) => ({
          ...contato,
          nome: contato.nome || '',
          valor: contato.valor || '',
        })),
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

  const adicionarContato = () => {
    append({
      id: Date.now().toString(),
      nome: '',
      valor: '',
      tipo: 'Telefone',
      ativo: false,
    })
  }

  const handleFormSubmit = (data: DadosFornecedorSchema) => {
    // Limpa o CNPJ antes de enviar (remove a formatação)
    const dadosLimpos = {
      ...data,
      cnpj: cnpjUtils.limpar(data.cnpj),
    } as DadosFornecedor

    const submitOperation = async () => {
      console.log('📝 FornecedorForm handleFormSubmit chamado')
      console.log('📝 onAdvanceRequest existe?', !!onAdvanceRequest)

      if (onAdvanceRequest) {
        console.log('📝 Chamando onAdvanceRequest')
        await onAdvanceRequest(dadosLimpos)
      } else {
        console.log('📝 Chamando onSubmit')
        await onSubmit?.(dadosLimpos)
      }
    }

    submitForm(data, submitOperation)
  }

  const preencherDadosTeste = () => {
    form.reset({
      cnpj: cnpjUtils.formatar('11222333000181'),
      razaoSocial: 'Empresa Teste LTDA',
      nomeFantasia: 'Teste Corp',
      estadoIE: 'RJ',
      inscricaoEstadual: '20040040',
      inscricaoMunicipal: '12345678',
      endereco: 'Rua das Flores, 123',
      numero: '123',
      complemento: 'Sala 456',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      ativo: true,
      contatos: [
        {
          id: '1',
          nome: 'João Silva',
          valor: '(11) 99999-9999',
          tipo: 'Celular',
          ativo: true,
        },
        {
          id: '2',
          nome: 'Contato Comercial',
          valor: 'contato@empresateste.com.br',
          tipo: 'Email',
          ativo: true,
        },
      ],
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        {/* Dados Básicos */}
        <div className="space-y-5">
          <div className="border-slate-200 flex items-center space-x-3 border-b pb-3">
            <div className="bg-slate-100 flex h-7 w-7 items-center justify-center rounded-md">
              <BarChart3 className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Informações Básicas
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => {
                const cnpjValue = field.value || ''
                const isValidCnpj =
                  cnpjValue.length > 0 ? cnpjUtils.validar(cnpjValue) : null

                return (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="00.000.000/0000-00"
                          aria-required="true"
                          aria-invalid={isValidCnpj === false ? 'true' : 'false'}
                          onChange={(e) => {
                            const valorMascarado = cnpjUtils.aplicarMascara(
                              e.target.value,
                            )
                            field.onChange(valorMascarado)
                          }}
                          className={cn(
                            isValidCnpj === true
                              ? 'border-green-500 bg-green-50 focus-visible:border-green-500 focus-visible:ring-green-500/20 pr-10'
                              : isValidCnpj === false
                                ? 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/20 pr-10'
                                : ''
                          )}
                        />
                        {isValidCnpj !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidCnpj ? (
                              <Check 
                                className="h-4 w-4 text-green-500" 
                                aria-hidden="true"
                              />
                            ) : (
                              <X 
                                className="h-4 w-4 text-red-500" 
                                aria-hidden="true"
                              />
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

            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite a razão social" />
                  </FormControl>
                  
                  {/* Espaço reservado para manter alinhamento */}
                  <div className="h-6 mt-1"></div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nomeFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome fantasia" />
                  </FormControl>
                  
                  {/* Espaço reservado para manter alinhamento com IE */}
                  <div className="h-6 mt-1"></div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Inscrição Estadual</FormLabel>
              <div className="flex gap-2">
                {/* Dropdown de Estados */}
                <FormField
                  control={form.control}
                  name="estadoIE"
                  render={({ field }) => (
                    <FormItem className="w-20 flex flex-col justify-end">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent side="top" align="start">
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo IE */}
                <FormField
                  control={form.control}
                  name="inscricaoEstadual"
                  render={({ field }) => {
                    const ieValue = field.value || ''
                    const estadoSelecionado = form.watch('estadoIE') || ''
                    const estadoConfig = estadoSelecionado ? ieUtils.estados[estadoSelecionado] : null
                    const isValidIe = ieValue.length > 0 && estadoSelecionado ? ieUtils.validar(ieValue, estadoSelecionado) : null

                    return (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder={estadoConfig ? `Ex: ${estadoConfig.mask.replace(/#/g, '1')}` : "Selecione o estado primeiro"}
                              disabled={!estadoSelecionado}
                              onChange={(e) => {
                                if (estadoSelecionado) {
                                  const valorMascarado = ieUtils.aplicarMascara(e.target.value, estadoSelecionado)
                                  field.onChange(valorMascarado)
                                } else {
                                  field.onChange(e.target.value)
                                }
                              }}
                              className={cn(
                                !estadoSelecionado && "opacity-50 cursor-not-allowed",
                                isValidIe === true && "border-green-500 bg-green-50 pr-10",
                                isValidIe === false && "border-red-500 bg-red-50 pr-10"
                              )}
                            />
                            {isValidIe !== null && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValidIe ? (
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

              {/* Informações do estado selecionado */}
              <div className="h-6 flex items-start">
                {form.watch('estadoIE') && ieUtils.estados[form.watch('estadoIE')] && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-700/10">
                      {form.watch('estadoIE')}
                    </span>
                    <span className="text-xs text-gray-600">
                      Formato: {ieUtils.estados[form.watch('estadoIE')].mask}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {ieUtils.estados[form.watch('estadoIE')].len} dígitos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="inscricaoMunicipal"
            render={({ field }) => {
              const imValue = field.value || ''
              const estadoSelecionado = form.watch('estadoIE') || ''
              const isValidIm = imValue.length > 0 && estadoSelecionado ? imUtils.validar(imValue, estadoSelecionado) : null

              // Obter informações específicas do estado
              const getEstadoInfo = (estado: string) => {
                switch (estado.toUpperCase()) {
                  case 'RJ':
                    return { nome: 'Rio de Janeiro', formato: '##.###.##-#', digitos: 8, validacao: 'específica' }
                  default:
                    return { nome: 'Genérico', formato: '5-15 dígitos', digitos: '5-15', validacao: 'genérica' }
                }
              }

              const estadoInfo = estadoSelecionado ? getEstadoInfo(estadoSelecionado) : null

              return (
                <FormItem>
                  <FormLabel>Inscrição Municipal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder={estadoInfo?.validacao === 'específica' ? `Ex: ${estadoInfo.formato.replace(/#/g, '1')}` : estadoSelecionado ? "Ex: 12345-67" : "Selecione o estado primeiro"}
                        disabled={!estadoSelecionado}
                        onChange={(e) => {
                          if (estadoSelecionado) {
                            const valorMascarado = imUtils.aplicarMascara(e.target.value, estadoSelecionado)
                            field.onChange(valorMascarado)
                          } else {
                            field.onChange(e.target.value)
                          }
                        }}
                        className={cn(
                          !estadoSelecionado && "opacity-50 cursor-not-allowed",
                          isValidIm === true && "border-green-500 bg-green-50 pr-10",
                          isValidIm === false && "border-red-500 bg-red-50 pr-10"
                        )}
                      />
                      {isValidIm !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isValidIm ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>

                  {/* Informações do estado/validação */}
                  <div className="h-6 flex items-start mt-1">
                    {estadoInfo && (
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          estadoInfo.validacao === 'específica' 
                            ? "bg-purple-50 text-purple-700 ring-purple-700/10"
                            : "bg-gray-50 text-gray-700 ring-gray-700/10"
                        )}>
                          {estadoSelecionado}
                        </span>
                        <span className="text-xs text-gray-600">
                          {estadoInfo.validacao === 'específica' ? `Validação ${estadoInfo.nome}` : 'Validação genérica'}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {estadoInfo.digitos} dígitos
                        </span>
                      </div>
                    )}
                  </div>

                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-5">
          <div className="border-slate-200 flex items-center space-x-3 border-b pb-3">
            <div className="bg-slate-100 flex h-7 w-7 items-center justify-center rounded-md">
              <MapPin className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
          </div>

          {/* CEP com busca automática */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => {
                const cepValue = field.value || ''
                const cepRegex = /^\d{5}-?\d{3}$/
                const isValidCep = cepValue.length > 0 ? cepRegex.test(cepValue) : null

                return (
                  <FormItem>
                    <FormLabel>CEP *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="00000-000"
                          aria-required="true"
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2')
                            field.onChange(valor)
                            
                            // Busca endereço quando CEP está completo
                            if (valor.length === 9) {
                              buscarCEP(valor)
                              clearError()
                            }
                          }}
                          className={cn(
                            isValidCep === true && !isLoadingCEP
                              ? 'border-green-500 bg-green-50 focus-visible:border-green-500 focus-visible:ring-green-500/20 pr-10'
                              : isValidCep === false && !isLoadingCEP
                                ? 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/20 pr-10'
                                : isLoadingCEP
                                  ? 'border-slate-400 bg-slate-50 pr-10'
                                  : ''
                          )}
                        />
                        {isLoadingCEP && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                          </div>
                        )}
                        {!isLoadingCEP && isValidCep !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidCep ? (
                              <Check 
                                className="h-4 w-4 text-green-500" 
                                aria-hidden="true"
                              />
                            ) : (
                              <X 
                                className="h-4 w-4 text-red-500" 
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {errorCEP && (
                      <p className="text-sm text-red-600">{errorCEP}</p>
                    )}
                    {isLoadingCEP && (
                      <p className="text-sm text-slate-600">Buscando endereço...</p>
                    )}
                    {!isCepValid && !isLoadingCEP && (
                      <p className="text-sm text-gray-500">Digite um CEP válido para habilitar os campos de endereço</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          {/* Endereço completo */}
          <div className={cn(
            "grid grid-cols-1 gap-4 md:grid-cols-4 transition-all duration-300",
            !shouldEnableAddressFields && "opacity-60"
          )}>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logradouro *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={shouldEnableAddressFields ? "Digite o endereço completo" : "Primeiro preencha o CEP"}
                        disabled={!shouldEnableAddressFields}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={shouldEnableAddressFields ? "123" : "Primeiro preencha o CEP"}
                      disabled={!shouldEnableAddressFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={shouldEnableAddressFields ? "Apto, Sala, etc." : "Primeiro preencha o CEP"}
                      disabled={!shouldEnableAddressFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={cn(
            "grid grid-cols-1 gap-4 md:grid-cols-3 transition-all duration-300",
            !shouldEnableAddressFields && "opacity-60"
          )}>
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={shouldEnableAddressFields ? "Digite o bairro" : "Primeiro preencha o CEP"}
                      disabled={!shouldEnableAddressFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={shouldEnableAddressFields ? "Digite a cidade" : "Primeiro preencha o CEP"}
                      disabled={!shouldEnableAddressFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={shouldEnableAddressFields ? "UF" : "Primeiro preencha o CEP"}
                      maxLength={2} 
                      disabled={!shouldEnableAddressFields}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contatos */}
        <div className="space-y-5">
          <div className="border-slate-200 flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 flex h-7 w-7 items-center justify-center rounded-md">
                <Users className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Contatos
              </h3>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={adicionarContato}
              className="flex items-center gap-2 bg-green-600 text-sm text-white shadow-sm transition-all duration-200 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 text-white" />
              Adicionar
            </Button>
          </div>

          {fields.map((contato, index) => (
            <div
              key={contato.id}
              className="group relative space-y-4 rounded-lg border border-gray-200 bg-gray-50/30 p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-100 text-slate-600 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-800">
                    Contato {index + 1}
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name={`contatos.${index}.nome`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Telefone Comercial"
                        />
                      </FormControl>
                      
                      {/* Espaço reservado para manter alinhamento com campo de valor */}
                      <div className="h-6 mt-1"></div>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contatos.${index}.tipo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Telefone">Telefone</SelectItem>
                          <SelectItem value="Celular">Celular</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Espaço reservado para manter alinhamento com campo de valor */}
                      <div className="h-6 mt-1"></div>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contatos.${index}.valor`}
                  render={({ field }) => {
                    const tipoContato = form.watch(`contatos.${index}.tipo`)
                    const valorContato = field.value || ''

                    let isValidValue = null
                    if (valorContato.length > 0) {
                      if (tipoContato === 'Email') {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        isValidValue = emailRegex.test(valorContato)
                      } else {
                        // Para telefone/celular, verifica se tem pelo menos 8 dígitos
                        const digitsOnly = valorContato.replace(/\D/g, '')
                        isValidValue = digitsOnly.length >= 8
                      }
                    }

                    return (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              tipoContato === 'Email'
                                ? 'email@exemplo.com'
                                : '(11) 99999-9999'
                            }
                            className={
                              isValidValue === true
                                ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                                : isValidValue === false
                                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                  : ''
                            }
                          />
                        </FormControl>
                        {isValidValue === true && (
                          <p className="flex items-center gap-1 text-sm text-green-600">
                            <span className="text-green-500">✓</span>
                            {tipoContato === 'Email'
                              ? 'Email válido'
                              : 'Telefone válido'}
                          </p>
                        )}
                        {isValidValue === false && (
                          <p className="flex items-center gap-1 text-sm text-red-600">
                            <span className="text-red-500">✗</span>
                            {tipoContato === 'Email'
                              ? 'Email inválido'
                              : 'Telefone deve ter pelo menos 8 dígitos'}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name={`contatos.${index}.ativo`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Contato ativo</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        {/* Status do Fornecedor */}
        <div className="space-y-4">
          <div className="border-slate-200 flex items-center space-x-3 border-b pb-3">
            <div className="bg-slate-100 flex h-7 w-7 items-center justify-center rounded-md">
              <Settings className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Status</h3>
          </div>

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
                    Fornecedor ativo
                  </FormLabel>
                  <p className="text-xs text-slate-600">
                    Marque esta opção para manter o fornecedor ativo no sistema
                  </p>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Processando dados...' : 'Avançar para próximo passo'}
              className={cn(
                'bg-slate-700 shadow-slate-700/20 hover:bg-slate-600 flex items-center gap-2 px-8 py-2.5 shadow-lg transition-all duration-200',
                onCancel ? '' : 'ml-auto',
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
