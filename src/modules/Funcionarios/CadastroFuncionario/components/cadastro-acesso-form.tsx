import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRegisterMutation } from '@/lib/auth/auth-queries'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

import { PermissoesSelect } from './permissoes-select'

const aplicarMascaraCpf = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const partes = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11),
  ]

  if (digits.length <= 3) {
    return partes[0]
  }
  if (digits.length <= 6) {
    return `${partes[0]}.${partes[1]}`
  }
  if (digits.length <= 9) {
    return `${partes[0]}.${partes[1]}.${partes[2]}`
  }
  return `${partes[0]}.${partes[1]}.${partes[2]}-${partes[3]}`
}

const cadastroAcessoSchema = z.object({
  email: z.string().email('Email inválido'),
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF é obrigatório'),
  senhaExpiraEm: z
    .string()
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate > today
    }, 'Data de expiração deve ser futura'),
  permissoes: z
    .array(z.number())
    .min(1, 'Selecione pelo menos uma permissão'),
})

type CadastroAcessoFormData = z.infer<typeof cadastroAcessoSchema>

interface CadastroAcessoFormProps {
  funcionario: FuncionarioApi
  onSuccess: (usuarioId: string) => void
  onVoltar?: () => void
}

export const CadastroAcessoForm = ({
  funcionario,
  onSuccess,
  onVoltar,
}: CadastroAcessoFormProps) => {
  const registerMutation = useRegisterMutation()

  // Data padrão: 90 dias a partir de hoje
  const defaultExpiryDate = new Date()
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 90)
  const [defaultDateString] = defaultExpiryDate.toISOString().split('T')

  const form = useForm<CadastroAcessoFormData>({
    resolver: zodResolver(cadastroAcessoSchema),
    defaultValues: {
      email: funcionario.emailInstitucional ?? '',
      nomeCompleto: funcionario.nomeCompleto,
      cpf: aplicarMascaraCpf(funcionario.cpf),
      senhaExpiraEm: defaultDateString,
      permissoes: [],
    },
  })

  const onSubmit = async (data: CadastroAcessoFormData) => {
    try {
      const response = await registerMutation.mutateAsync({
        email: data.email,
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ''), // Remove máscara antes de enviar
        senhaExpiraEm: data.senhaExpiraEm,
      })

      if (response.sucesso && response.dados.usuarioId) {
        toast.success('Acesso criado com sucesso!', {
          description: `Senha provisória enviada para ${data.email}`,
        })
        onSuccess(response.dados.usuarioId)
      }
    } catch (error) {
      toast.error('Erro ao criar acesso', {
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-6"
      >
        {/* Informações do Funcionário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Funcionário</CardTitle>
            <CardDescription>
              Informações obtidas da base de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted" />
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
                    <Input {...field} disabled className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Institucional</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="usuario@dominio.com" />
                  </FormControl>
                  <FormDescription>
                    A senha provisória será enviada para este email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Configurações de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Acesso</CardTitle>
            <CardDescription>
              Defina quando a senha provisória expirará
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="senhaExpiraEm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Expira Em</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormDescription>
                    Após esta data, o usuário precisará redefinir a senha
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seleção de Permissões */}
        <FormField
          control={form.control}
          name="permissoes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PermissoesSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.permissoes?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de Ação */}
        <div className="flex justify-between">
          {onVoltar && (
            <Button type="button" variant="outline" onClick={onVoltar}>
              Voltar
            </Button>
          )}
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="ml-auto"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Criando Acesso...
              </>
            ) : (
              'Criar Acesso ao Sistema'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
