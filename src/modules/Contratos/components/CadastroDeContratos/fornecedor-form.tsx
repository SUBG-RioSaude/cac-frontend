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
import { Trash2, Plus, ArrowRight, BarChart3, Zap, MapPin, Users } from 'lucide-react'
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
import { cnpjUtils, cn } from '@/lib/utils'

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
  inscricaoEstadual: string
  inscricaoMunicipal: string
  endereco: string
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
  inscricaoEstadual: z.string().optional().or(z.literal('')),
  inscricaoMunicipal: z.string().optional().or(z.literal('')),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
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
  const { submitForm, isSubmitting, error } = useFormAsyncOperation()
  const form = useForm<DadosFornecedorSchema>({
    resolver: zodResolver(fornecedorSchema) as Resolver<DadosFornecedorSchema>,
    defaultValues: {
      cnpj: dadosIniciais?.cnpj ? cnpjUtils.formatar(dadosIniciais.cnpj) : '',
      razaoSocial: dadosIniciais?.razaoSocial || '',
      nomeFantasia: dadosIniciais?.nomeFantasia || '',
      inscricaoEstadual: dadosIniciais?.inscricaoEstadual || '',
      inscricaoMunicipal: dadosIniciais?.inscricaoMunicipal || '',
      endereco: dadosIniciais?.endereco || '',
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

  useEffect(() => {
    if (onDataChange) {
      const dados = {
        cnpj: watchedValues.cnpj ? cnpjUtils.limpar(watchedValues.cnpj) : '',
        razaoSocial: watchedValues.razaoSocial || '',
        nomeFantasia: watchedValues.nomeFantasia || '',
        endereco: watchedValues.endereco || '',
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
      inscricaoEstadual: '123456789',
      inscricaoMunicipal: '987654321',
      endereco: 'Rua das Flores, 123',
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
          <div className="border-sidebar-primary/20 flex items-center space-x-3 border-b pb-3">
            <div className="bg-sidebar-primary/10 flex h-7 w-7 items-center justify-center rounded-md">
              <BarChart3 className="h-4 w-4 text-sidebar-primary" aria-hidden="true" />
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
                      <Input
                        {...field}
                        placeholder="00.000.000/0000-00"
                        aria-required="true"
                        aria-invalid={isValidCnpj === false ? 'true' : 'false'}
                        aria-describedby={
                          isValidCnpj !== null 
                            ? `cnpj-feedback-${isValidCnpj ? 'success' : 'error'}` 
                            : undefined
                        }
                        onChange={(e) => {
                          const valorMascarado = cnpjUtils.aplicarMascara(
                            e.target.value,
                          )
                          field.onChange(valorMascarado)
                        }}
                        className={
                          isValidCnpj === true
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                            : isValidCnpj === false
                              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
                              : ''
                        }
                      />
                    </FormControl>
                    {isValidCnpj === true && (
                      <p 
                        id="cnpj-feedback-success"
                        className="flex items-center gap-1 text-sm text-green-600"
                        role="status"
                        aria-live="polite"
                      >
                        <span className="text-green-500" aria-hidden="true">✓</span>
                        CNPJ válido
                      </p>
                    )}
                    {isValidCnpj === false && (
                      <p 
                        id="cnpj-feedback-error"
                        className="flex items-center gap-1 text-sm text-red-600"
                        role="alert"
                        aria-live="assertive"
                      >
                        <span className="text-red-500" aria-hidden="true">✗</span>
                        CNPJ inválido
                      </p>
                    )}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inscricaoEstadual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição Estadual</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite a inscrição estadual"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="inscricaoMunicipal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inscrição Municipal</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite a inscrição municipal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-5">
          <div className="border-sidebar-primary/20 flex items-center space-x-3 border-b pb-3">
            <div className="bg-sidebar-primary/15 flex h-7 w-7 items-center justify-center rounded-md">
              <MapPin className="h-4 w-4 text-sidebar-primary" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o endereço completo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => {
                const cepValue = field.value || ''
                const cepRegex = /^\d{5}-?\d{3}$/
                const isValidCep =
                  cepValue.length > 0 ? cepRegex.test(cepValue) : null

                return (
                  <FormItem>
                    <FormLabel>CEP *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="00000-000"
                        className={
                          isValidCep === true
                            ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500'
                            : isValidCep === false
                              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
                              : ''
                        }
                      />
                    </FormControl>
                    {isValidCep === true && (
                      <p className="flex items-center gap-1 text-sm text-green-600">
                        <span className="text-green-500">✓</span>
                        CEP válido
                      </p>
                    )}
                    {isValidCep === false && (
                      <p className="flex items-center gap-1 text-sm text-red-600">
                        <span className="text-red-500">✗</span>
                        CEP inválido (formato: 00000-000)
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o bairro" />
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
                    <Input {...field} placeholder="Digite a cidade" />
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
                    <Input {...field} placeholder="UF" maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contatos */}
        <div className="space-y-5">
          <div className="border-sidebar-primary/20 flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-sidebar-primary/20 flex h-7 w-7 items-center justify-center rounded-md">
                <Users className="h-4 w-4 text-sidebar-primary" aria-hidden="true" />
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
                  <div className="bg-sidebar-primary/15 text-sidebar-primary flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
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
          <div className="border-sidebar-primary/20 flex items-center space-x-3 border-b pb-3">
            <div className="bg-sidebar-primary/25 flex h-7 w-7 items-center justify-center rounded-md">
              <span className="text-sidebar-primary text-sm font-semibold">
                ⚙️
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Status</h3>
          </div>

          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-medium text-green-800">
                    Fornecedor ativo
                  </FormLabel>
                  <p className="text-xs text-green-600">
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
                'bg-sidebar-primary shadow-sidebar-primary/20 hover:bg-sidebar-primary/90 flex items-center gap-2 px-8 py-2.5 shadow-lg transition-all duration-200',
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
