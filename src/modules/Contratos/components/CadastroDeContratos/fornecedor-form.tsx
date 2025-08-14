import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useRef, useState } from 'react'
import { useFormAsyncOperation } from '@/hooks/use-async-operation'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import { cn, cnpjUtils, ieUtils, imUtils } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Trash2, 
  Check, 
  X,
  Zap 
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

interface Contato {
  id: string
  nome: string
  valor: string
  tipo: 'Email' | 'Fixo' | 'Celular'
  ativo: boolean
}

export interface DadosFornecedor {
  cnpj: string
  razaoSocial: string
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

const fornecedorSchema = z.object({
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(cnpjUtils.validar, 'CNPJ inválido'),
  razaoSocial: z.string().min(1, 'Razão Social é obrigatória'),
  estadoIE: z.string().optional().or(z.literal('')),
  inscricaoEstadual: z.string().optional().or(z.literal('')),
  inscricaoMunicipal: z.string().optional().or(z.literal('')),
  endereco: z.string().min(1, 'Logradouro é obrigatório'),
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
        nome: z.string(),
        valor: z.string(),
        tipo: z.enum(['Email', 'Fixo', 'Celular']),
        ativo: z.boolean(),
      }),
    )
    .max(3, 'Máximo de 3 contatos permitidos')
    .default([]),
})

interface FornecedorFormProps {
  onSubmit: (dados: DadosFornecedor) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosFornecedor>
  onAdvanceRequest?: (dados: DadosFornecedor) => void
  onDataChange?: (dados: Partial<DadosFornecedor>) => void
}

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function FornecedorForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
}: FornecedorFormProps) {
  const { submitForm, isSubmitting } = useFormAsyncOperation()
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  // Hook para busca de CEP
  const buscarCEP = async (cep: string) => {
    if (!cep || cep.length < 8) return

    setIsLoadingCEP(true)
    setCepError(null)

    try {
      const cepLimpo = cep.replace(/\D/g, '')
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        setCepError('CEP não encontrado')
        toast.error('CEP não encontrado. Verifique e tente novamente.')
        return
      }

      if (data.cep) {
        // Preenche os campos automaticamente
        form.setValue('endereco', data.logradouro || '')
        form.setValue('bairro', data.bairro || '')
        form.setValue('cidade', data.localidade || '')
        form.setValue('estado', data.uf || '')
        
        toast.success('Endereço preenchido automaticamente!')
        
        // Foca no campo número após preencher
        setTimeout(() => {
          const numeroField = document.querySelector('input[name="numero"]') as HTMLInputElement
          numeroField?.focus()
        }, 100)
      }
    } catch {
      setCepError('Erro ao buscar CEP')
      toast.error('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setIsLoadingCEP(false)
    }
  }

  const form = useForm({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      cnpj: dadosIniciais?.cnpj ? cnpjUtils.formatar(dadosIniciais.cnpj) : '',
      razaoSocial: dadosIniciais?.razaoSocial || '',
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
  const previousDataRef = useRef<string | null>(null)

  useEffect(() => {
    if (onDataChange) {
      const dados: Partial<DadosFornecedor> = {
        cnpj: watchedValues.cnpj || '',
        razaoSocial: watchedValues.razaoSocial || '',
        estadoIE: watchedValues.estadoIE || '',
        inscricaoEstadual: watchedValues.inscricaoEstadual || '',
        inscricaoMunicipal: watchedValues.inscricaoMunicipal || '',
        endereco: watchedValues.endereco || '',
        numero: watchedValues.numero || '',
        complemento: watchedValues.complemento || '',
        bairro: watchedValues.bairro || '',
        cidade: watchedValues.cidade || '',
        estado: watchedValues.estado || '',
        cep: watchedValues.cep || '',
        ativo: watchedValues.ativo || false,
        contatos: (watchedValues.contatos || []).map(contato => ({
          id: contato.id,
          nome: contato.nome || '',
          valor: contato.valor || '',
          tipo: contato.tipo,
          ativo: contato.ativo,
        })),
      }
      
      // Só chama onDataChange se os dados realmente mudaram
      const currentDataString = JSON.stringify(dados)
      if (previousDataRef.current !== currentDataString) {
        previousDataRef.current = currentDataString
        onDataChange(dados)
      }
    }
  }, [watchedValues, onDataChange])

  const handleFormSubmit = (dados: z.infer<typeof fornecedorSchema>) => {
    const dadosFornecedor = dados as DadosFornecedor
    
    // Validações adicionais com toast
    if (!dadosFornecedor.contatos || dadosFornecedor.contatos.length === 0) {
      toast.error('Adicione pelo menos um contato para o fornecedor.')
      return
    }

    const contatosValidos = dadosFornecedor.contatos.filter(contato => 
      contato.nome && contato.valor && contato.tipo
    )

    if (contatosValidos.length !== dadosFornecedor.contatos.length) {
      toast.error('Preencha todos os dados dos contatos adicionados.')
      return
    }
    
    const submitOperation = async () => {
      if (onAdvanceRequest) {
        await onAdvanceRequest(dadosFornecedor)
      } else {
        await onSubmit?.(dadosFornecedor)
      }
    }

    submitForm(dados, submitOperation)
  }

  const adicionarContato = () => {
    if (fields.length < 3) {
      append({
        id: Date.now().toString(),
        nome: '',
        valor: '',
        tipo: 'Email' as const,
        ativo: true,
      })
    }
  }

  const preencherDadosTeste = () => {
    form.reset({
      cnpj: cnpjUtils.formatar('11222333000181'),
      razaoSocial: 'Empresa de Limpeza Exemplo LTDA',
      estadoIE: 'RJ',
      inscricaoEstadual: '12.345.67-8',
      inscricaoMunicipal: '12.345.678-9',
      endereco: 'Rua das Flores, 123',
      numero: '123',
      complemento: 'Sala 101',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20040-020',
      ativo: true,
      contatos: [
        {
          id: '1',
          nome: 'João Silva',
          valor: 'joao@empresa.com',
          tipo: 'Email' as const,
          ativo: true,
        },
        {
          id: '2',
          nome: 'Maria Santos',
          valor: '(21) 99999-8888',
          tipo: 'Celular' as const,
          ativo: true,
        },
      ],
    })
  }

  const getPlaceholderPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'Email':
        return 'exemplo@email.com'
      case 'Fixo':
        return '(11) 3333-4444'
      case 'Celular':
        return '(11) 99999-8888'
      default:
        return ''
    }
  }

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
              <Building2 className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Informações Básicas</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => {
                const cnpjValue = field.value || ''
                const isValidCnpj = cnpjValue.length > 0 ? cnpjUtils.validar(cnpjValue) : null

                return (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="00.000.000/0000-00"
                          onChange={(e) => {
                            const valorMascarado = cnpjUtils.aplicarMascara(e.target.value)
                            field.onChange(valorMascarado)
                            
                            // Validação com toast
                            if (valorMascarado.length >= 18) {
                              const isValid = cnpjUtils.validar(valorMascarado)
                              if (isValid) {
                                toast.success('CNPJ válido!')
                              } else {
                                toast.error('CNPJ inválido. Verifique os números.')
                              }
                            }
                          }}
                          className={cn(
                            isValidCnpj === true && "border-green-500 bg-green-50 pr-10",
                            isValidCnpj === false && "border-red-500 bg-red-50 pr-10"
                          )}
                        />
                        {isValidCnpj !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidCnpj ? (
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

            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="inscricaoEstadual"
              render={({ field }) => {
                const estadoSelecionado = form.watch('estadoIE')
                const ieValue = field.value || ''
                const isValidIe = ieValue.length > 0 && estadoSelecionado ? ieUtils.validar(ieValue, estadoSelecionado) : null

                return (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <div className="flex gap-2">
                      {/* Dropdown de Estados */}
                      <FormField
                        control={form.control}
                        name="estadoIE"
                        render={({ field: estadoField }) => (
                          <FormItem className="w-20 flex flex-col justify-end">
                            <Select 
                              onValueChange={(value) => {
                                estadoField.onChange(value)
                                // Limpa os campos de inscrição quando UF muda
                                form.setValue('inscricaoEstadual', '')
                                form.setValue('inscricaoMunicipal', '')
                              }} 
                              value={estadoField.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="UF" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent side="top" align="start">
                                {estadosBrasileiros.map((estado) => (
                                  <SelectItem key={estado} value={estado}>
                                    {estado}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      {/* Campo da IE */}
                      <div className="flex-1 relative">
                        <Input
                          {...field}
                          placeholder={estadoSelecionado ? "Ex: 12.345.67-8" : "Selecione UF primeiro"}
                          disabled={!estadoSelecionado}
                          onChange={(e) => {
                            if (estadoSelecionado) {
                              const valorMascarado = ieUtils.aplicarMascara(e.target.value, estadoSelecionado)
                              field.onChange(valorMascarado)
                              
                              // Validação com toast
                              if (e.target.value.length > 0) {
                                const isValid = ieUtils.validar(e.target.value, estadoSelecionado)
                                if (isValid) {
                                  toast.success('Inscrição Estadual válida!')
                                } else {
                                  toast.error('Inscrição Estadual inválida para o estado selecionado.')
                                }
                              }
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
                    </div>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="inscricaoMunicipal"
              render={({ field }) => {
                const estadoSelecionado = form.watch('estadoIE')
                const imValue = field.value || ''
                const isValidIm = imValue.length > 0 && estadoSelecionado ? imUtils.validar(imValue, estadoSelecionado) : null

                return (
                  <FormItem>
                    <FormLabel>Inscrição Municipal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder={estadoSelecionado ? "Ex: 12345-67" : "Selecione UF da IE primeiro"}
                          disabled={!estadoSelecionado}
                          onChange={(e) => {
                            if (estadoSelecionado) {
                              const valorMascarado = imUtils.aplicarMascara(e.target.value, estadoSelecionado)
                              field.onChange(valorMascarado)
                              
                              // Validação com toast
                              if (e.target.value.length > 0) {
                                const isValid = imUtils.validar(e.target.value, estadoSelecionado)
                                if (isValid) {
                                  toast.success('Inscrição Municipal válida!')
                                } else {
                                  toast.error('Inscrição Municipal inválida para o estado selecionado.')
                                }
                              }
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
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Endereço */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
              <MapPin className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="00000-000" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          if (e.target.value.length >= 8) {
                            buscarCEP(e.target.value)
                          }
                        }}
                        className={cn(
                          cepError && "border-red-500 bg-red-50"
                        )}
                      />
                      {isLoadingCEP && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {cepError && (
                    <p className="text-sm text-red-600">{cepError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isLoadingCEP ? "Carregando..." : "Rua, Avenida, Travessa..."} 
                      {...field}
                      disabled={isLoadingCEP}
                      className={cn(
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
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
                      placeholder={isLoadingCEP ? "Carregando..." : "Digite a cidade"} 
                      {...field}
                      disabled={isLoadingCEP}
                      className={cn(
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={isLoadingCEP ? "Carregando..." : "Digite o bairro"} 
                      {...field}
                      disabled={isLoadingCEP}
                      className={cn(
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoadingCEP}
                  >
                    <FormControl>
                      <SelectTrigger className={cn(
                        'h-9 w-full',
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}>
                        <SelectValue placeholder={isLoadingCEP ? "Carregando..." : "Estado"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123" 
                      {...field}
                      disabled={isLoadingCEP}
                      className={cn(
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Apt, Sala, Bloco... (opcional)" 
                      {...field}
                      disabled={isLoadingCEP}
                      className={cn(
                        isLoadingCEP && "opacity-50 cursor-not-allowed bg-slate-100"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
        </div>

        <Separator />

        {/* Contatos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-3 flex-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                <Phone className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Contatos</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarContato}
              disabled={fields.length >= 3}
              className="ml-4 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Contato
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="py-8 text-center">
              <Phone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum contato adicionado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Adicione até 3 contatos para o fornecedor.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Contato {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`contatos.${index}.nome`}
                      render={({ field: nomeField }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...nomeField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`contatos.${index}.tipo`}
                      render={({ field: tipoField }) => (
                        <FormItem>
                          <FormLabel>Tipo do Contato</FormLabel>
                          <Select onValueChange={tipoField.onChange} value={tipoField.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Email">E-mail</SelectItem>
                              <SelectItem value="Fixo">Telefone Fixo</SelectItem>
                              <SelectItem value="Celular">Celular</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`contatos.${index}.valor`}
                      render={({ field: valorField }) => {
                        const tipoContato = form.watch(`contatos.${index}.tipo`)
                        return (
                          <FormItem>
                            <FormLabel>
                              {tipoContato === 'Email' ? 'E-mail' : 
                               tipoContato === 'Fixo' ? 'Telefone Fixo' : 
                               tipoContato === 'Celular' ? 'Celular' : 'Valor'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={getPlaceholderPorTipo(tipoContato)}
                                type={tipoContato === 'Email' ? 'email' : 'tel'}
                                {...valorField} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {fields.length >= 3 && (
            <p className="text-sm text-gray-500 text-center">
              Limite máximo de 3 contatos atingido.
            </p>
          )}
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
              aria-label={isSubmitting ? 'Processando dados do fornecedor...' : 'Avançar para próximo passo'}
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