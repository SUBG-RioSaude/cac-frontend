import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X, Loader2, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SISTEMA_FRONTEND_ID } from '@/config/sistemas'
import { authService } from '@/lib/auth/auth-service'
import { createServiceLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useCreateFuncionario } from '@/modules/Funcionarios'
import { deletarFuncionario } from '@/modules/Funcionarios/services/funcionarios-service'
import type {
  FuncionarioCreateApi,
  FuncionarioApi,
} from '@/modules/Funcionarios/types/funcionario-api'
import {
  validarFormatoCpf,
  validarCpfCompleto,
} from '@/modules/Funcionarios/utils/funcionario-utils'
import { limparMatricula } from '@/modules/Funcionarios/utils/matricula-utils'

import {
  useValidarCpfUnico,
  useValidarMatriculaUnica,
} from '../hooks/use-validar-funcionario'

import { LotacaoSelect } from './lotacao-select'
import { ModalSucessoCadastro } from './modal-sucesso-cadastro'

const logger = createServiceLogger('cadastro-funcionario-form')

// Helper para retry com 3 tentativas
const retryAsync = async <T,>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> => {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info({ attempt, maxRetries }, `Tentativa ${attempt} de ${maxRetries}`)
      const result = await fn()
      if (attempt > 1) {
        logger.info(
          { attempt, maxRetries },
          `Sucesso na tentativa ${attempt}`,
        )
      }
      return result
    } catch (error) {
      lastError = error
      logger.warn(
        {
          attempt,
          maxRetries,
          error: error instanceof Error ? error.message : String(error),
        },
        `Falha na tentativa ${attempt}`,
      )
      
      if (attempt < maxRetries) {
        logger.info({ delayMs }, `Aguardando ${delayMs}ms antes da próxima tentativa`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
  
  logger.error(
    { maxRetries, error: lastError },
    `Todas as ${maxRetries} tentativas falharam`,
  )
  throw lastError
}

interface CadastroFuncionarioFormProps {
  // Modo padrão: standalone
  onSuccess?: (funcionario: FuncionarioApi) => void
  // Modo wizard: com funcionário encontrado ou CPF pré-preenchido
  funcionarioEncontrado?: FuncionarioApi | null
  cpfPrefilled?: string | null
  onUsuarioCriado?: (
    funcionarioId: string,
    usuarioId: string,
    permissoesExistentes?: {
      sistemaId: string
      sistemaNome: string
      permissoes: {
        id: number
        nome: string
      }[]
    }[]
  ) => void
}

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

const aplicarMascaraTelefone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // Celular com 9 dígitos: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

const schema = z.object({
  nomeCompleto: z.string().min(3, 'Informe o nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF é obrigatório')
    .refine((cpf) => validarFormatoCpf(cpf), 'CPF inválido (formato)')
    .refine((cpf) => validarCpfCompleto(cpf), 'CPF inválido'),
  matricula: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(3, 'A Matrícula deve ter entre 3 e 20 caracteres alfanuméricos.')
        .max(20, 'A Matrícula deve ter entre 3 e 20 caracteres alfanuméricos.')
        .regex(
          /^[A-Za-z0-9]+$/,
          'A Matrícula deve conter apenas letras e números, sem espaços ou caracteres especiais.',
        ),
    ),
  cargo: z.string().min(2, 'Cargo é obrigatório'),
  funcao: z.string().min(2, 'Função é obrigatória'),
  situacao: z.string().min(1, 'Selecione a situação'),
  vinculo: z.string().min(1, 'Selecione o vínculo'),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
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

export const CadastroFuncionarioForm = ({
  onSuccess,
  funcionarioEncontrado = null,
  cpfPrefilled = null,
  onUsuarioCriado,
}: CadastroFuncionarioFormProps = {}) => {
  const navigate = useNavigate()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdFuncionario, setCreatedFuncionario] =
    useState<FuncionarioApi | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Modo wizard: funcionário já encontrado (apenas criar usuário)
  const isModoFuncionarioEncontrado = !!funcionarioEncontrado
  // Modo wizard: cadastro manual (criar funcionário + usuário)
  const isModoWizard = !!onUsuarioCriado

  const form = useForm<CadastroFuncionarioValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCompleto: '',
      cpf: cpfPrefilled ? aplicarMascaraCpf(cpfPrefilled) : '',
      matricula: '',
      cargo: '',
      funcao: '',
      situacao: '1', // HARDCODED
      vinculo: '1', // HARDCODED
      dataAdmissao: '',
      emailInstitucional: '',
      telefone: '',
      lotacaoId: '',
    },
    mode: 'onBlur',
  })

  // Preencher formulário quando funcionário é encontrado
  useEffect(() => {
    if (funcionarioEncontrado) {
      logger.info(
        {
          action: 'preencher-formulario',
          funcionarioId: funcionarioEncontrado.id,
        },
        'Preenchendo formulário com dados do funcionário encontrado',
      )

      form.reset({
        nomeCompleto: funcionarioEncontrado.nomeCompleto,
        cpf: aplicarMascaraCpf(funcionarioEncontrado.cpf),
        matricula: funcionarioEncontrado.matricula,
        cargo: funcionarioEncontrado.cargo,
        funcao: funcionarioEncontrado.funcao,
        situacao: funcionarioEncontrado.situacao.toString(),
        vinculo: funcionarioEncontrado.vinculo.toString(),
        dataAdmissao: funcionarioEncontrado.dataAdmissao.split('T')[0], // ISO date apenas
        emailInstitucional: funcionarioEncontrado.emailInstitucional ?? '',
        telefone: funcionarioEncontrado.telefone
          ? aplicarMascaraTelefone(funcionarioEncontrado.telefone)
          : '',
        lotacaoId: funcionarioEncontrado.lotacaoId,
      })
    }
  }, [funcionarioEncontrado, form])

  const createMutation = useCreateFuncionario()

  // Remote validations (onBlur) - desabilitadas se:
  // 1. Funcionário já foi encontrado (isModoFuncionarioEncontrado)
  // 2. CPF pré-preenchido do wizard (cpfPrefilled) - já foi validado no passo 1
  const desabilitarValidacaoRemota = isModoFuncionarioEncontrado || !!cpfPrefilled
  
  // Usa useWatch para observar campos de forma otimizada
  const cpfValue = useWatch({
    control: form.control,
    name: 'cpf',
    disabled: desabilitarValidacaoRemota, // Não observa se validação está desabilitada
  })
  
  const matriculaValue = useWatch({
    control: form.control,
    name: 'matricula',
    disabled: desabilitarValidacaoRemota, // Não observa se validação está desabilitada
  })
  
  // Chama hooks com parâmetro disabled para bloquear completamente as queries
  const validCpf = useValidarCpfUnico(
    cpfValue || '',
    desabilitarValidacaoRemota
  )
  const validMatricula = useValidarMatriculaUnica(
    matriculaValue || '',
    desabilitarValidacaoRemota
  )

  const onSubmit = async (values: CadastroFuncionarioValues) => {
    setIsCreatingUser(true)

    try {
      // CASO 1: Funcionário JÁ ENCONTRADO - apenas criar usuário
      if (isModoFuncionarioEncontrado && funcionarioEncontrado) {
        logger.info(
          {
            action: 'criar-usuario',
            funcionarioId: funcionarioEncontrado.id,
            mode: 'funcionario-encontrado',
          },
          'Criando usuário para funcionário encontrado',
        )

        const registerResponse = await authService.registerUsuario({
          email: values.emailInstitucional,
          nomeCompleto: values.nomeCompleto,
          cpf: values.cpf.replace(/\D/g, ''),
          senhaExpiraEm: new Date().toISOString().split('T')[0], // Data atual
        })

        // Tratar caso de erro 400 "E-mail já cadastrado" - buscar usuário por CPF
        if (registerResponse.dados.emailJaCadastrado) {
          logger.info(
            {
              action: 'criar-usuario',
              status: 'email-ja-cadastrado',
              cpf: values.cpf.replace(/\D/g, ''),
            },
            'E-mail já cadastrado, buscando usuário por CPF',
          )

          // Buscar usuário por CPF
          const cpfLimpo = values.cpf.replace(/\D/g, '')
          const verificacaoResponse =
            await authService.verificarUsuarioPorCpf(cpfLimpo)

          if (
            !verificacaoResponse.sucesso ||
            !verificacaoResponse.dados.existe ||
            !verificacaoResponse.dados.usuario
          ) {
            toast.error('Erro ao buscar usuário existente', {
              description: 'Não foi possível verificar o usuário pelo CPF',
            })
            return
          }

          const usuarioExistente = verificacaoResponse.dados.usuario
          const permissoesExistentes =
            verificacaoResponse.dados.permissoes ?? []

          // Verificar se usuário já tem permissão no sistema atual
          const permissaoNoSistema = permissoesExistentes.find(
            (p) => p.sistemaId === SISTEMA_FRONTEND_ID,
          )

          logger.info(
            {
              action: 'criar-usuario',
              status: 'usuario-encontrado',
              usuarioId: usuarioExistente.id,
              funcionarioId: funcionarioEncontrado.id,
              temPermissao: !!permissaoNoSistema,
              sistemaId: SISTEMA_FRONTEND_ID,
            },
            'Usuário encontrado por CPF',
          )

          if (permissaoNoSistema && permissaoNoSistema.permissoes.length > 0) {
            toast.info('Usuário já possui permissão neste sistema', {
              description: `Permissões: ${permissaoNoSistema.permissoes.map((p) => p.nome).join(', ')}`,
            })
          } else {
            toast.info('Usuário já cadastrado', {
              description: 'Será necessário atribuir permissão ao sistema',
            })
          }

          // Redirecionar para Step 2 (atribuir permissão)
          if (onUsuarioCriado) {
            onUsuarioCriado(
              funcionarioEncontrado.id,
              usuarioExistente.id,
              permissoesExistentes,
            )
          }

          return
        }

        // Tratar caso de usuário já existente (409 Conflict - API v1.1)
        if (registerResponse.dados.existe && registerResponse.dados.usuario) {
          logger.info(
            {
              action: 'criar-usuario',
              status: 'usuario-ja-existe',
              usuarioId: registerResponse.dados.usuario.id,
              funcionarioId: funcionarioEncontrado.id,
            },
            'Usuário já existe, usando ID existente',
          )

          toast.info('Usuário já cadastrado', {
            description: 'Usando usuário existente para atribuir permissões',
          })

          if (onUsuarioCriado) {
            onUsuarioCriado(
              funcionarioEncontrado.id,
              registerResponse.dados.usuario.id,
              registerResponse.dados.permissoes,
            )
          }

          return
        }

        // Usuário criado com sucesso
        if (!registerResponse.sucesso) {
          throw new Error(registerResponse.mensagem || 'Erro ao criar usuário')
        }

        logger.info(
          {
            action: 'criar-usuario',
            status: 'success',
            usuarioId: registerResponse.dados.usuarioId,
            funcionarioId: funcionarioEncontrado.id,
          },
          'Usuário criado com sucesso',
        )

        toast.success('Usuário criado com sucesso!')

        if (onUsuarioCriado && registerResponse.dados.usuarioId) {
          onUsuarioCriado(funcionarioEncontrado.id, registerResponse.dados.usuarioId)
        }

        return
      }

      // CASO 2: CADASTRO MANUAL - criar funcionário + usuário (com rollback)
      const payload: FuncionarioCreateApi = {
        ...values,
        cpf: values.cpf.replace(/\D/g, ''),
        telefone: values.telefone.replace(/\D/g, ''),
        matricula: limparMatricula(values.matricula),
        situacao: 1, // HARDCODED
        vinculo: 1, // HARDCODED
        dataAdmissao: new Date(values.dataAdmissao).toISOString(),
      }

      logger.info(
        {
          action: 'criar-funcionario',
          mode: 'cadastro-manual',
        },
        'Criando funcionário com retry (até 3 tentativas)',
      )

      // Passo 1: Criar funcionário com retry de 3 tentativas
      const funcionarioCriado = await retryAsync(
        () => createMutation.mutateAsync(payload),
        3, // 3 tentativas
        1500, // 1.5 segundos entre tentativas
      )

      logger.info(
        {
          action: 'criar-funcionario',
          status: 'success',
          funcionarioId: funcionarioCriado.id,
        },
        'Funcionário criado com sucesso',
      )

      // Passo 2: Criar usuário (se falhar, deletar funcionário)
      try {
        logger.info(
          {
            action: 'criar-usuario',
            funcionarioId: funcionarioCriado.id,
          },
          'Criando usuário para funcionário cadastrado',
        )

        const registerResponse = await authService.registerUsuario({
          email: values.emailInstitucional,
          nomeCompleto: values.nomeCompleto,
          cpf: values.cpf.replace(/\D/g, ''),
          senhaExpiraEm: new Date().toISOString().split('T')[0], // Data atual
        })

        // Tratar caso de erro 400 "E-mail já cadastrado" - buscar usuário por CPF
        if (registerResponse.dados.emailJaCadastrado) {
          logger.info(
            {
              action: 'criar-usuario',
              status: 'email-ja-cadastrado',
              cpf: values.cpf.replace(/\D/g, ''),
              funcionarioId: funcionarioCriado.id,
            },
            'E-mail já cadastrado, buscando usuário por CPF',
          )

          // Buscar usuário por CPF
          const cpfLimpo = values.cpf.replace(/\D/g, '')
          const verificacaoResponse =
            await authService.verificarUsuarioPorCpf(cpfLimpo)

          if (
            !verificacaoResponse.sucesso ||
            !verificacaoResponse.dados.existe ||
            !verificacaoResponse.dados.usuario
          ) {
            toast.error('Erro ao buscar usuário existente', {
              description: 'Não foi possível verificar o usuário pelo CPF',
            })
            // Rollback: deletar funcionário criado
            await deletarFuncionario(funcionarioCriado.id)
            return
          }

          const usuarioExistente = verificacaoResponse.dados.usuario
          const permissoesExistentes =
            verificacaoResponse.dados.permissoes ?? []

          // Verificar se usuário já tem permissão no sistema atual
          const permissaoNoSistema = permissoesExistentes.find(
            (p) => p.sistemaId === SISTEMA_FRONTEND_ID,
          )

          logger.info(
            {
              action: 'criar-usuario',
              status: 'usuario-encontrado',
              usuarioId: usuarioExistente.id,
              funcionarioId: funcionarioCriado.id,
              temPermissao: !!permissaoNoSistema,
              sistemaId: SISTEMA_FRONTEND_ID,
            },
            'Usuário encontrado por CPF',
          )

          if (permissaoNoSistema && permissaoNoSistema.permissoes.length > 0) {
            toast.info('Usuário já possui permissão neste sistema', {
              description: `Permissões: ${permissaoNoSistema.permissoes.map((p) => p.nome).join(', ')}`,
            })
          } else {
            toast.info('Usuário já cadastrado', {
              description: 'Será necessário atribuir permissão ao sistema',
            })
          }

          // Redirecionar para Step 2 (atribuir permissão)
          if (onUsuarioCriado) {
            onUsuarioCriado(
              funcionarioCriado.id,
              usuarioExistente.id,
              permissoesExistentes,
            )
          } else if (onSuccess) {
            onSuccess(funcionarioCriado)
          } else {
            setCreatedFuncionario(funcionarioCriado)
            setShowSuccessModal(true)
            form.reset()
          }

          return
        }

        // Tratar caso de usuário já existente (409 Conflict - API v1.1)
        if (registerResponse.dados.existe && registerResponse.dados.usuario) {
          logger.warn(
            {
              action: 'criar-usuario',
              status: 'usuario-ja-existe',
              usuarioId: registerResponse.dados.usuario.id,
              funcionarioId: funcionarioCriado.id,
            },
            'Usuário já existe, usando ID existente',
          )

          toast.info('Usuário já cadastrado', {
            description: 'Usando usuário existente para atribuir permissões',
          })

          if (onUsuarioCriado) {
            onUsuarioCriado(
              funcionarioCriado.id,
              registerResponse.dados.usuario.id,
              registerResponse.dados.permissoes,
            )
          } else if (onSuccess) {
            onSuccess(funcionarioCriado)
          } else {
            setCreatedFuncionario(funcionarioCriado)
            setShowSuccessModal(true)
            form.reset()
          }

          return
        }

        // Usuário criado com sucesso
        if (!registerResponse.sucesso) {
          throw new Error(registerResponse.mensagem || 'Erro ao criar usuário')
        }

        logger.info(
          {
            action: 'criar-usuario',
            status: 'success',
            usuarioId: registerResponse.dados.usuarioId,
            funcionarioId: funcionarioCriado.id,
          },
          'Usuário criado com sucesso',
        )

        toast.success('Funcionário e usuário criados com sucesso!')

        // Modo wizard: callback com IDs
        if (onUsuarioCriado && registerResponse.dados.usuarioId) {
          onUsuarioCriado(funcionarioCriado.id, registerResponse.dados.usuarioId)
        } else if (onSuccess) {
          // Modo legado
          onSuccess(funcionarioCriado)
        } else {
          // Modo standalone: modal + reset + navegação
          setCreatedFuncionario(funcionarioCriado)
          setShowSuccessModal(true)
          form.reset()
        }
      } catch (erroUsuario) {
        // ROLLBACK: Deletar funcionário se criar usuário falhou
        logger.error(
          {
            action: 'criar-usuario',
            status: 'failed-rollback-initiated',
            funcionarioId: funcionarioCriado.id,
            erro: erroUsuario instanceof Error ? erroUsuario.message : String(erroUsuario),
          },
          'Erro ao criar usuário, iniciando rollback do funcionário',
        )

        toast.error('Erro ao criar usuário', {
          description: 'Desfazendo cadastro do funcionário...',
        })

        try {
          await deletarFuncionario(funcionarioCriado.id)

          logger.info(
            {
              action: 'rollback',
              status: 'success',
              funcionarioId: funcionarioCriado.id,
            },
            'Rollback concluído: funcionário deletado',
          )

          toast.error('Cadastro desfeito', {
            description: 'Não foi possível criar o usuário. Por favor, tente novamente.',
          })
        } catch (erroRollback) {
          logger.error(
            {
              action: 'rollback',
              status: 'failed',
              funcionarioId: funcionarioCriado.id,
              erro: erroRollback instanceof Error ? erroRollback.message : String(erroRollback),
            },
            'CRÍTICO: Falha no rollback - funcionário pode estar órfão',
          )

          toast.error('Erro crítico', {
            description: `Funcionário criado mas usuário falhou. ID: ${funcionarioCriado.id}`,
            duration: 10000,
          })
        }

        throw erroUsuario
      }
    } catch (erro) {
      logger.error(
        {
          action: 'onSubmit',
          status: 'error',
          erro: erro instanceof Error ? erro.message : String(erro),
        },
        'Erro no cadastro',
      )
      // Toast já foi mostrado nos blocos específicos
    } finally {
      setIsCreatingUser(false)
    }
  }

  const isBusyChecking =
    validCpf.isWaiting ||
    validCpf.isChecking ||
    validMatricula.isWaiting ||
    validMatricula.isChecking
  const hasDuplicates =
    validCpf.isAvailable === false || validMatricula.isAvailable === false
  const isSubmitting =
    isCreatingUser ||
    createMutation.isPending ||
    form.formState.isSubmitting ||
    isBusyChecking ||
    hasDuplicates

  const handleModalConfirm = () => {
    setShowSuccessModal(false)
    setCreatedFuncionario(null)
    void navigate('/')
  }

  // Helpers de máscara/normalização durante digitação
  const normalizeMatriculaTyping = (value: string) =>
    value
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 20)

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(form.getValues())
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nomeCompleto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome completo"
                    disabled={isModoFuncionarioEncontrado || isSubmitting}
                    {...field}
                  />
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
                  <Input
                    type="email"
                    placeholder="nome@org.gov.br"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
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
                  {desabilitarValidacaoRemota ? (
                    // Modo wizard: campo simples sem validação remota
                    <Input
                      placeholder="Somente números"
                      inputMode="numeric"
                      disabled={isModoFuncionarioEncontrado || isSubmitting || !!cpfPrefilled}
                      readOnly={!!cpfPrefilled}
                      {...field}
                      onChange={(e) => {
                        const masked = aplicarMascaraCpf(e.target.value)
                        field.onChange(masked)
                      }}
                    />
                  ) : (
                    // Modo standalone: campo com validação remota completa
                    <div className="relative">
                      <Input
                        placeholder="Somente números"
                        inputMode="numeric"
                        disabled={isModoFuncionarioEncontrado || isSubmitting}
                        {...field}
                        className={cn(
                          !desabilitarValidacaoRemota &&
                            validCpf.isAvailable === true &&
                            'border-green-500 bg-green-50 pr-10',
                          !desabilitarValidacaoRemota &&
                            validCpf.isAvailable === false &&
                            'border-red-500 bg-red-50 pr-10',
                          !desabilitarValidacaoRemota &&
                            (validCpf.isWaiting || validCpf.isChecking) &&
                            'pr-10',
                        )}
                        onBlur={(e) => {
                          field.onBlur()
                          if (desabilitarValidacaoRemota) return
                          const raw = e.target.value
                          if (!raw || !validarCpfCompleto(raw)) return
                          if (validCpf.isAvailable === false) {
                            form.setError('cpf', {
                              type: 'remote',
                              message: 'CPF já cadastrado.',
                            })
                          } else if (validCpf.isAvailable === true) {
                            form.clearErrors('cpf')
                          }
                        }}
                        onChange={(e) => {
                          const masked = aplicarMascaraCpf(e.target.value)
                          field.onChange(masked)
                        }}
                      />
                      {(validCpf.isWaiting || validCpf.isChecking) && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      )}
                      {validCpf.isAvailable === true &&
                        !validCpf.isChecking &&
                        !validCpf.isWaiting && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      {validCpf.isAvailable === false &&
                        !validCpf.isChecking &&
                        !validCpf.isWaiting && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                    </div>
                  )}
                </FormControl>
                <div className="min-h-[20px]">
                  {!desabilitarValidacaoRemota && (validCpf.isWaiting || validCpf.isChecking) ? (
                    <FormDescription>Verificando CPF...</FormDescription>
                  ) : !desabilitarValidacaoRemota && validCpf.isAvailable === false ? (
                    <p className="text-destructive text-sm font-medium">
                      CPF já cadastrado
                    </p>
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
                  {desabilitarValidacaoRemota ? (
                    // Modo wizard: campo simples sem validação remota
                    <Input
                      placeholder="Informe a matrícula"
                      disabled={isModoFuncionarioEncontrado || isSubmitting}
                      {...field}
                      onChange={(e) => {
                        const cleaned = normalizeMatriculaTyping(e.target.value)
                        field.onChange(cleaned)
                      }}
                    />
                  ) : (
                    // Modo standalone: campo com validação remota completa
                    <div className="relative">
                      <Input
                        placeholder="Informe a matrícula"
                        disabled={isModoFuncionarioEncontrado || isSubmitting}
                        {...field}
                        className={cn(
                          !desabilitarValidacaoRemota &&
                            validMatricula.isAvailable === true &&
                            'border-green-500 bg-green-50 pr-10',
                          !desabilitarValidacaoRemota &&
                            validMatricula.isAvailable === false &&
                            'border-red-500 bg-red-50 pr-10',
                          !desabilitarValidacaoRemota &&
                            (validMatricula.isWaiting ||
                              validMatricula.isChecking) &&
                            'pr-10',
                        )}
                        onBlur={(e) => {
                          field.onBlur()
                          if (desabilitarValidacaoRemota) return
                          const value = e.target.value.trim()
                          if (!value || !/^[A-Za-z0-9]{3,20}$/.test(value)) return
                          if (validMatricula.isAvailable === false) {
                            form.setError('matricula', {
                              type: 'remote',
                              message: 'Matrícula já cadastrada.',
                            })
                          } else if (validMatricula.isAvailable === true) {
                            form.clearErrors('matricula')
                          }
                        }}
                        onChange={(e) => {
                          const cleaned = normalizeMatriculaTyping(e.target.value)
                          field.onChange(cleaned)
                        }}
                      />
                      {(validMatricula.isWaiting ||
                        validMatricula.isChecking) && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>
                      )}
                      {validMatricula.isAvailable === true &&
                        !validMatricula.isChecking &&
                        !validMatricula.isWaiting && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      {validMatricula.isAvailable === false &&
                        !validMatricula.isChecking &&
                        !validMatricula.isWaiting && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                    </div>
                  )}
                </FormControl>
                <div className="min-h-[20px]">
                  {!desabilitarValidacaoRemota && (validMatricula.isWaiting || validMatricula.isChecking) ? (
                    <FormDescription>Verificando matrícula...</FormDescription>
                  ) : !desabilitarValidacaoRemota && validMatricula.isAvailable === false ? (
                    <p className="text-destructive text-sm font-medium">
                      Matrícula já cadastrada
                    </p>
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
                  <Input
                    placeholder="Ex.: Analista"
                    disabled={isModoFuncionarioEncontrado || isSubmitting}
                    {...field}
                  />
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
                  <Input
                    placeholder="Ex.: Fiscal"
                    disabled={isModoFuncionarioEncontrado || isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Situação e Vínculo: escondidos no modo wizard (hardcoded como 1) */}
          {!isModoWizard && (
            <>
              <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    <FormControl>
                      <select
                        className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        disabled={isModoFuncionarioEncontrado || isSubmitting}
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
                        className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        disabled={isModoFuncionarioEncontrado || isSubmitting}
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
            </>
          )}

          <FormField
            control={form.control}
            name="dataAdmissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de admissão</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={isModoFuncionarioEncontrado || isSubmitting}
                    {...field}
                  />
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
                  <Input
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => {
                      const masked = aplicarMascaraTelefone(e.target.value)
                      field.onChange(masked)
                    }}
                  />
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
                  <LotacaoSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isModoFuncionarioEncontrado || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            className="bg-green-600"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Salvando...'
              : isModoFuncionarioEncontrado
                ? 'Criar usuário'
                : 'Cadastrar funcionário'}
            <Plus className="h-6 w-6 fill-white text-gray-600" />
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
