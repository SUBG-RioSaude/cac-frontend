import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { LotacaoSelect } from './LotacaoSelect'
import { ModalSucessoCadastro } from './ModalSucessoCadastro'
import { useCreateFuncionario } from '@/modules/Funcionarios'
import { useValidarCpfUnico, useValidarMatriculaUnica } from '@/modules/Funcionarios/hooks/use-validar-funcionario'
import { cn } from '@/lib/utils'
import { Check, X, Loader2, Plus } from 'lucide-react'
import type { FuncionarioCreateApi, FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'
import { validarFormatoCpf, validarCpfCompleto } from '@/modules/Funcionarios/utils/funcionario-utils'
import { limparMatricula } from '@/modules/Funcionarios/utils/matricula-utils'

const schema = z.object({
  nomeCompleto: z.string().min(3, 'Informe o nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF é obrigatório')
    .refine((cpf) => validarFormatoCpf(cpf), 'CPF inválido (formato)')
    .refine((cpf) => validarCpfCompleto(cpf), 'CPF inválido'),
  matricula: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z
      .string()
      .min(3, 'A Matrícula deve ter entre 3 e 20 caracteres alfanuméricos.')
      .max(20, 'A Matrícula deve ter entre 3 e 20 caracteres alfanuméricos.')
      .regex(/^[A-Za-z0-9]+$/, 'A Matrícula deve conter apenas letras e números, sem espaços ou caracteres especiais.'),
  ),
  cargo: z.string().min(2, 'Cargo é obrigatório'),
  funcao: z.string().min(2, 'Função é obrigatória'),
  situacao: z.string().min(1, 'Selecione a situação'),
  vinculo: z.string().min(1, 'Selecione o vínculo'),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  dataExoneracao: z.string().optional().or(z.literal('')),
  emailInstitucional: z.string().email('E-mail institucional inválido'),
  telefone: z.string().min(8, 'Telefone é obrigatório'),
  lotacaoId: z.string().min(1, 'Selecione a lotação'),
})

export type CadastroFuncionarioValues = z.infer<typeof schema>

const situacoes = [
  { value: '1', label: 'Ativo' },
  { value: '2', label: 'Inativo' },
  { value: '3', label: 'Afastado' },
  { value: '4', label: 'Licença' },
  { value: '5', label: 'Cedido' },
  { value: '6', label: 'Requisitado' },
]

const vinculos = [
  { value: '1', label: 'Efetivo' },
  { value: '2', label: 'Comissionado' },
  { value: '3', label: 'Terceirizado' },
  { value: '4', label: 'Estagiário' },
  { value: '5', label: 'Temporário' },
]

export function CadastroFuncionarioForm() {
  const navigate = useNavigate()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdFuncionario, setCreatedFuncionario] = useState<FuncionarioApi | null>(null)

  const form = useForm<CadastroFuncionarioValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCompleto: '',
      cpf: '',
      matricula: '',
      cargo: '',
      funcao: '',
      situacao: '1',
      vinculo: '1',
      dataAdmissao: '',
      dataExoneracao: '',
      emailInstitucional: '',
      telefone: '',
      lotacaoId: '',
    },
    mode: 'onBlur',
  })

  const createMutation = useCreateFuncionario()

  // Remote validations (onBlur)
  const matriculaValue = form.watch('matricula')
  const cpfValue = form.watch('cpf')
  const validCpf = useValidarCpfUnico(cpfValue)
  const validMatricula = useValidarMatriculaUnica(matriculaValue)

  const onSubmit = async (values: CadastroFuncionarioValues) => {
    const payload: FuncionarioCreateApi = {
      ...values,
      cpf: values.cpf.replace(/\D/g, ''),
      matricula: limparMatricula(values.matricula),
      situacao: Number(values.situacao),
      vinculo: Number(values.vinculo),
      dataAdmissao: new Date(values.dataAdmissao).toISOString(),
      dataExoneracao: values.dataExoneracao ? new Date(values.dataExoneracao).toISOString() : null,
    }
    
    try {
      const funcionarioCriado = await createMutation.mutateAsync(payload)
      setCreatedFuncionario(funcionarioCriado)
      setShowSuccessModal(true)
      form.reset()
    } catch (error) {
      // Error handling é feito pelo hook useCreateFuncionario
      console.error('Erro no onSubmit:', error)
    }
  }

  const isBusyChecking = validCpf.isWaiting || validCpf.isChecking || validMatricula.isWaiting || validMatricula.isChecking
  const hasDuplicates = validCpf.isAvailable === false || validMatricula.isAvailable === false
  const isSubmitting = createMutation.isPending || form.formState.isSubmitting || isBusyChecking || hasDuplicates

  const handleModalConfirm = () => {
    setShowSuccessModal(false)
    setCreatedFuncionario(null)
    navigate('/')
  }

  // Helpers de máscara/normalização durante digitação
  const maskCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    const parts = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 9),
      digits.slice(9, 11),
    ]
    if (digits.length <= 3) return parts[0]
    if (digits.length <= 6) return `${parts[0]}.${parts[1]}`
    if (digits.length <= 9) return `${parts[0]}.${parts[1]}.${parts[2]}`
    return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`
  }
  const normalizeMatriculaTyping = (value: string) => value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 20)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nomeCompleto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailInstitucional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail institucional</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nome@org.gov.br" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Somente números"
                      inputMode="numeric"
                      {...field}
                      className={cn(
                      (validCpf.isAvailable === true) && 'border-green-500 bg-green-50 pr-10',
                      (validCpf.isAvailable === false) && 'border-red-500 bg-red-50 pr-10',
                      (validCpf.isWaiting || validCpf.isChecking) && 'pr-10'
                    )}
                    onBlur={(e) => {
                      field.onBlur()
                      const raw = e.target.value
                      if (!raw || !validarCpfCompleto(raw)) return
                      if (validCpf.isAvailable === false) {
                        form.setError('cpf', { type: 'remote', message: 'CPF já cadastrado.' })
                      } else if (validCpf.isAvailable === true) {
                        form.clearErrors('cpf')
                      }
                    }}
                    onChange={(e) => {
                      const masked = maskCpf(e.target.value)
                      field.onChange(masked)
                    }}
                    />
                    {(validCpf.isWaiting || validCpf.isChecking) && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    )}
                    {validCpf.isAvailable === true && !validCpf.isChecking && !validCpf.isWaiting && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {validCpf.isAvailable === false && !validCpf.isChecking && !validCpf.isWaiting && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  {validCpf.isWaiting || validCpf.isChecking ? (
                    <FormDescription>Verificando CPF...</FormDescription>
                  ) : validCpf.isAvailable === false ? (
                    <p className="text-sm font-medium text-destructive">CPF já cadastrado</p>
                  ) : (
                    <FormMessage />
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="matricula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Informe a matrícula"
                      {...field}
                      className={cn(
                      (validMatricula.isAvailable === true) && 'border-green-500 bg-green-50 pr-10',
                      (validMatricula.isAvailable === false) && 'border-red-500 bg-red-50 pr-10',
                      (validMatricula.isWaiting || validMatricula.isChecking) && 'pr-10'
                    )}
                    onBlur={(e) => {
                      field.onBlur()
                      const value = e.target.value.trim()
                      if (!value || !/^[A-Za-z0-9]{3,20}$/.test(value)) return
                      if (validMatricula.isAvailable === false) {
                        form.setError('matricula', { type: 'remote', message: 'Matrícula já cadastrada.' })
                      } else if (validMatricula.isAvailable === true) {
                        form.clearErrors('matricula')
                      }
                    }}
                    onChange={(e) => {
                      const cleaned = normalizeMatriculaTyping(e.target.value)
                      field.onChange(cleaned)
                    }}
                    />
                    {(validMatricula.isWaiting || validMatricula.isChecking) && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    )}
                    {validMatricula.isAvailable === true && !validMatricula.isChecking && !validMatricula.isWaiting && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {validMatricula.isAvailable === false && !validMatricula.isChecking && !validMatricula.isWaiting && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <div className="min-h-[20px]">
                  {validMatricula.isWaiting || validMatricula.isChecking ? (
                    <FormDescription>Verificando matrícula...</FormDescription>
                  ) : validMatricula.isAvailable === false ? (
                    <p className="text-sm font-medium text-destructive">Matrícula já cadastrada</p>
                  ) : (
                    <FormMessage />
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: Analista" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="funcao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: Fiscal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="situacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação</FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  >
                    {situacoes.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vinculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vínculo</FormLabel>
                <FormControl>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  >
                    {vinculos.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataAdmissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de admissão</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataExoneracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de exoneração (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 0000-0000" inputMode="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lotacaoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lotação</FormLabel>
                <FormControl>
                  <LotacaoSelect value={field.value} onChange={field.onChange} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button className='bg-green-600' type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar funcionário'}
          <Plus className="h-6 w-6 text-gray-600 fill-white" />
          </Button>
        </div>
      </form>

      {/* Modal de sucesso */}
      {showSuccessModal && createdFuncionario && (
        <ModalSucessoCadastro
          isOpen={showSuccessModal}
          funcionario={{
            nomeCompleto: createdFuncionario.nomeCompleto,
            matricula: createdFuncionario.matricula,
          }}
          onConfirm={handleModalConfirm}
        />
      )}
    </Form>
  )
}
