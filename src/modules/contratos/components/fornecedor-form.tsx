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
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus } from 'lucide-react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
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
import { cnpjUtils } from '@/lib/utils'

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
}: FornecedorFormProps) {
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
    console.log('📝 FornecedorForm handleFormSubmit chamado')
    console.log('📝 onAdvanceRequest existe?', !!onAdvanceRequest)

    // Limpa o CNPJ antes de enviar (remove a formatação)
    const dadosLimpos = {
      ...data,
      cnpj: cnpjUtils.limpar(data.cnpj),
    } as DadosFornecedor

    if (onAdvanceRequest) {
      console.log('📝 Chamando onAdvanceRequest')
      onAdvanceRequest(dadosLimpos)
    } else {
      console.log('📝 Chamando onSubmit')
      onSubmit(dadosLimpos)
    }
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
        className="space-y-6"
      >
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => {
                      const valorMascarado = cnpjUtils.aplicarMascara(
                        e.target.value,
                      )
                      field.onChange(valorMascarado)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                  <Input {...field} placeholder="Digite a inscrição estadual" />
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
                <Input {...field} placeholder="Digite a inscrição municipal" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endereço</h3>

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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="00000-000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

        <Separator />

        {/* Contatos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Contatos</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarContato}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Contato
            </Button>
          </div>

          {fields.map((contato, index) => (
            <div key={contato.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Contato</h4>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            form.watch(`contatos.${index}.tipo`) === 'Email'
                              ? 'email@exemplo.com'
                              : '(11) 99999-9999'
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

        {/* Fornecedor Ativo */}
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
              <FormLabel>Fornecedor ativo</FormLabel>
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="space-y-4 border-t pt-6">
          {/* Botão de preenchimento rápido para testes */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={preencherDadosTeste}
              className="text-sm"
            >
              ⚡ Preencher Dados de Teste
            </Button>
          </div>

          <div className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className={onCancel ? '' : 'ml-auto'}>
              Próximo
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
