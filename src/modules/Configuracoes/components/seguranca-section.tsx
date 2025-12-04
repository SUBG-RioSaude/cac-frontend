import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authService } from '@/lib/auth/auth-service'
import { useAuthStore } from '@/lib/auth/auth-store'
import { cookieUtils } from '@/lib/auth/cookie-utils'
import type {
  AlterarSenhaRequest,
  AlterarSenhaResponse,
} from '@/types/auth'

const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'A senha deve conter letras maiúsculas, minúsculas e números',
      ),
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>

export const SegurancaSection = () => {
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { usuario } = useAuthStore()

  const form = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  })

  const handleAlterarSenha = async (data: AlterarSenhaFormData) => {
    if (!usuario?.email) {
      toast.error('Erro ao alterar senha', {
        description: 'Usuário não autenticado',
      })
      return
    }

    setIsLoading(true)

    try {
      // Buscar o token dos cookies (fonte primária)
      let token = cookieUtils.getCookie('token')

      // Fallback: buscar do store Zustand se não estiver nos cookies
      if (!token) {
        const { getToken } = useAuthStore.getState()
        token = getToken()
      }

      if (!token) {
        toast.error('Erro ao alterar senha', {
          description: 'Token de autenticação não encontrado',
        })
        return
      }

      // Chamar o novo endpoint de alterar senha
      const payload: AlterarSenhaRequest = {
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
        confirmarNovaSenha: data.confirmarSenha,
      }

       
      const resultado = await authService.alterarSenha(payload, token)
       
      const response: AlterarSenhaResponse = resultado

       
      if (response.sucesso) {
        toast.success('Senha alterada com sucesso!', {
          description: 'Sua senha foi atualizada',
        })
        form.reset()
      } else {
         
        const mensagem: string = (response.mensagem ?? 'Tente novamente mais tarde')
        toast.error('Erro ao alterar senha', {
          description: mensagem,
        })
      }
    } catch (erro) {
      toast.error('Erro ao alterar senha', {
        description:
          erro instanceof Error ? erro.message : 'Erro desconhecido',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5" />
          Segurança
        </CardTitle>
        <CardDescription>
          Altere sua senha para manter sua conta segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Dica de segurança:</strong> Use uma senha forte com pelo
            menos 8 caracteres, incluindo letras maiúsculas, minúsculas e
            números.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit(handleAlterarSenha)(e)
            }}
            className="space-y-4"
          >
            {/* Senha Atual */}
            <FormField
              control={form.control}
              name="senhaAtual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showSenhaAtual ? 'text' : 'password'}
                        placeholder="Digite sua senha atual"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSenhaAtual ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nova Senha */}
            <FormField
              control={form.control}
              name="novaSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNovaSenha ? 'text' : 'password'}
                        placeholder="Digite sua nova senha"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNovaSenha ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmar Senha */}
            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmarSenha ? 'text' : 'password'}
                        placeholder="Confirme sua nova senha"
                        {...field}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmarSenha(!showConfirmarSenha)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmarSenha ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
