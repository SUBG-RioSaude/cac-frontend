import { zodResolver } from '@hookform/resolvers/zod'
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
  ShieldCheck,
} from 'lucide-react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ButtonLoadingSpinner } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn, cnpjUtils, ieUtils, imUtils } from '@/lib/utils'
import {
  useConsultarEmpresaPorCNPJ,
  useCadastrarEmpresa,
} from '@/modules/Empresas/hooks/use-empresas'
import type { EmpresaResponse } from '@/modules/Empresas/types/empresa'

interface Contato {
  id: string
  nome: string
  valor: string
  tipo: 'Email' | 'Telefone' | 'Celular'
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
  empresaId?: string
}

// Funções de validação para contatos
const validarEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false

  // Validações adicionais
  const [localPart, domain] = email.split('@')

  // Verifica se a parte local não está vazia e tem pelo menos 2 caracteres
  if (!localPart || localPart.length < 2) return false

  // Verifica se o domínio tem pelo menos 4 caracteres (ex: .com)
  if (!domain || domain.length < 4) return false

  // Verifica se o domínio tem pelo menos um ponto
  if (!domain.includes('.')) return false

  // Verifica se não há pontos consecutivos
  if (domain.includes('..')) return false

  // Verifica se não termina com ponto
  if (domain.endsWith('.')) return false

  return true
}

const validarFormatoTelefoneFixo = (telefone: string) => {
  const telefoneLimpo = telefone.replace(/\D/g, '')
  return telefoneLimpo.length === 10
}

const validarFormatoCelular = (celular: string) => {
  const celularLimpo = celular.replace(/\D/g, '')
  return celularLimpo.length === 11
}

interface ViaCepResponse {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

const fornecedorSchema = z.object({
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(cnpjUtils.validar, 'CNPJ inválido'),
  razaoSocial: z
    .string()
    .min(6, 'Razão Social deve ter pelo menos 6 caracteres')
    .max(100, 'Razão Social deve ter no máximo 100 caracteres'),
  estadoIE: z.string().optional().or(z.literal('')),
  inscricaoEstadual: z.string().optional().or(z.literal('')),
  inscricaoMunicipal: z.string().optional().or(z.literal('')),
  endereco: z
    .string()
    .min(5, 'Logradouro deve ter pelo menos 5 caracteres')
    .max(100, 'Logradouro deve ter no máximo 100 caracteres'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z
    .string()
    .min(1, 'Estado é obrigatório')
    .max(2, 'Use apenas 2 caracteres'),
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine((cep) => {
      const cepLimpo = cep.replace(/\D/g, '')
      return cepLimpo.length === 8
    }, 'CEP deve ter 8 dígitos no formato 12345-678'),
  ativo: z.boolean(),
  contatos: z
    .array(
      z
        .object({
          id: z.string(),
          nome: z.string().min(1, 'Nome do contato é obrigatório'),
          valor: z.string().min(1, 'Valor do contato é obrigatório'),
          tipo: z.enum(['Email', 'Telefone', 'Celular']),
          ativo: z.boolean(),
        })
        .refine((contato: { tipo: string; valor: string }) => {
          if (contato.tipo === 'Email') {
            return validarEmail(contato.valor)
          } else if (contato.tipo === 'Telefone') {
            return validarFormatoTelefoneFixo(contato.valor)
          } else if (contato.tipo === 'Celular') {
            return validarFormatoCelular(contato.valor)
          }
          return true
        }, 'Valor inválido para o tipo de contato selecionado'),
    )
    .min(1, 'Pelo menos um contato é obrigatório')
    .max(3, 'Máximo de 3 contatos permitidos')
    .default([]),
  empresaId: z.string().optional(),
})

interface FornecedorFormProps {
  onSubmit: (dados: DadosFornecedor) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosFornecedor>
  onAdvanceRequest?: (dados: DadosFornecedor) => void
  onDataChange?: (dados: Partial<DadosFornecedor>) => void
  onEmpresaCadastrada?: (dados: { cnpj: string; razaoSocial: string }) => void
}

const estadosBrasileiros = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

const buildDefaultContatos = (contatos?: Contato[]) =>
  contatos && contatos.length > 0
    ? contatos
    : [
        {
          id: '1',
          nome: '',
          valor: '',
          tipo: 'Email' as const,
          ativo: true,
        },
      ]

const buildFormDefaultValues = (dados: Partial<DadosFornecedor>) => ({
  cnpj: dados.cnpj ? cnpjUtils.formatar(dados.cnpj) : '',
  razaoSocial: dados.razaoSocial ?? '',
  estadoIE: dados.estadoIE ?? '',
  inscricaoEstadual: dados.inscricaoEstadual ?? '',
  inscricaoMunicipal: dados.inscricaoMunicipal ?? '',
  endereco: dados.endereco ?? '',
  numero: dados.numero ?? '',
  complemento: dados.complemento ?? '',
  bairro: dados.bairro ?? '',
  cidade: dados.cidade ?? '',
  estado: dados.estado ?? '',
  cep: dados.cep ?? '',
  ativo: dados.ativo ?? true,
  contatos: buildDefaultContatos(dados.contatos),
  empresaId: dados.empresaId ?? '',
})

const FornecedorForm = ({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
  onDataChange,
  onEmpresaCadastrada,
}: FornecedorFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [cepBypassDisponivel, setCepBypassDisponivel] = useState(false)
  const [cepPreenchido, setCepPreenchido] = useState(false)
  const [cepValido, setCepValido] = useState(false)
  const [cnpjParaConsultar, setCnpjParaConsultar] = useState<string>('')
  const [empresaEncontrada, setEmpresaEncontrada] =
    useState<Partial<EmpresaResponse> | null>(null)
  const [toastJaMostrado, setToastJaMostrado] = useState(false)

  const defaultValues = useMemo(
    () => buildFormDefaultValues(dadosIniciais),
    [dadosIniciais],
  )

  // Definir form e hooks relacionados ANTES das funções que os utilizam
  const form = useForm({
    resolver: zodResolver(fornecedorSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contatos',
  })

  // Watch para o estado selecionado para tornar os campos reativos
  const estadoSelecionado = useWatch({
    control: form.control,
    name: 'estadoIE',
  })

  // Watch apenas para os tipos de contatos para reatividade
  const watchedContatosRaw = useWatch({
    control: form.control,
    name: 'contatos',
  }) as Contato[] | undefined

  // Memoiza os tipos para evitar re-renders desnecessários
  const tiposContatosMemo = useMemo(() => {
    const watchedContatos = watchedContatosRaw ?? []
    return watchedContatos.map((contato) => contato.tipo)
  }, [watchedContatosRaw])

  // Hook para consultar empresa por CNPJ
  const { isLoading: isConsultandoCNPJ, refetch: refetchConsultaCNPJ } =
    useConsultarEmpresaPorCNPJ(cnpjParaConsultar, {
      enabled: false, // Só executa quando chamarmos refetch
      onSuccess: (data) => {
        // Valida se os dados essenciais existem
        if (!data.cnpj || !data.razaoSocial) {
          toast.error('Erro ao carregar dados da empresa', {
            description: 'Dados incompletos recebidos da API.',
          })
          return
        }

        // Evita processar a mesma empresa múltiplas vezes
        if (empresaEncontrada?.id === data.id) {
          return
        }

        // Empresa encontrada - preenche o formulário automaticamente
        setEmpresaEncontrada(data)

        // Preenche todos os campos do formulário de uma vez
        const contatosMapeados = data.contatos.map((contato, index) => ({
            id: (index + 1).toString(),
            nome: contato.nome,
            valor: contato.valor,
            tipo: contato.tipo,
            ativo: true,
          }))

        form.reset({
          cnpj: cnpjUtils.formatar(data.cnpj),
          razaoSocial: data.razaoSocial,
          estadoIE: data.estado,
          inscricaoEstadual: data.inscricaoEstadual ?? '',
          inscricaoMunicipal: data.inscricaoMunicipal ?? '',
          endereco: data.endereco,
          numero: 'S/N', // Número não vem da API, usa "S/N" como padrão
          complemento: '', // Complemento não vem da API
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          ativo: data.ativo,
          contatos: contatosMapeados, // Preenche contatos diretamente no reset
          empresaId: data.id, // Adiciona o ID da empresa para uso posterior
        })

        // Habilita campos de endereço e marca CEP como válido (empresa existente)
        setCepPreenchido(true)
        setCepValido(true)

        // Só mostra o toast se ainda não foi mostrado para esta empresa
        if (!toastJaMostrado) {
          setToastJaMostrado(true)
          toast.success('Empresa já cadastrada!', {
            description:
              'Formulário preenchido automaticamente com os dados existentes.',
            icon: <Check className="h-4 w-4" />,
          })
        }
      },
      onError: (error) => {
        // Empresa não encontrada - limpa estado
        setEmpresaEncontrada(null)

        // Só mostra mensagem se for erro específico de "empresa não encontrada"
        // e ainda não foi mostrado para evitar spam
        if (
          error instanceof Error &&
          error.message === 'Empresa não encontrada' &&
          !toastJaMostrado
        ) {
          setToastJaMostrado(true)
          toast.info('Empresa não cadastrada', {
            description: 'Continue preenchendo o formulário para cadastrar.',
          })
        }
      },
    })

  // Effect para executar consulta quando cnpjParaConsultar mudar
  useEffect(() => {
    // Só executa a consulta se o CNPJ estiver completo e válido
    if (
      cnpjParaConsultar &&
      cnpjParaConsultar.length === 14 &&
      cnpjUtils.validar(cnpjParaConsultar)
    ) {
      void refetchConsultaCNPJ()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnpjParaConsultar]) // Removido refetchConsultaCNPJ das dependências para evitar loops

  // Função para validar formato do CEP
  const validarFormatoCEP = (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    return cepLimpo.length === 8
  }

  // Hook para cadastrar empresa
  const { mutateAsync: cadastrarEmpresaAsync, resetMutation } =
    useCadastrarEmpresa()

  // Hook para busca de CEP
  const buscarCEP = async (cep: string) => {
    if (!cep || !validarFormatoCEP(cep)) {
      setCepValido(false)
      setCepPreenchido(false)
      return
    }

    setIsLoadingCEP(true)
    setCepError(null)
    setCepValido(false)
    setCepBypassDisponivel(false)

    try {
      const cepLimpo = cep.replace(/\D/g, '')
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = (await response.json()) as ViaCepResponse

      if (data.erro) {
        setCepError('CEP não encontrado')
        setCepValido(false)
        setCepPreenchido(false)
        setCepBypassDisponivel(true)
        return
      }

      if (data.cep) {
        // Preenche os campos automaticamente
        form.setValue('endereco', data.logradouro ?? '')
        form.setValue('bairro', data.bairro ?? '')
        form.setValue('cidade', data.localidade ?? '')
        form.setValue('estado', data.uf ?? '')

        // Marca CEP como válido e habilita campos
        setCepValido(true)
        setCepPreenchido(true)

        // Foca no campo número após preencher
        setTimeout(() => {
          const numeroField = document.querySelector<HTMLInputElement>(
            'input[name="numero"]',
          )
          numeroField?.focus()
        }, 100)
      }
    } catch {
      setCepError('Erro ao buscar CEP - ViaCEP não está respondendo')
      setCepValido(false)
      setCepPreenchido(false)
      setCepBypassDisponivel(true)
    } finally {
      setIsLoadingCEP(false)
    }
  }

  // Função para fazer bypass do ViaCEP
  const bypassViaCEP = () => {
    setCepError(null)
    setCepBypassDisponivel(false)
    setCepPreenchido(true)
    setCepValido(true)

    toast.success('CEP liberado para preenchimento manual', {
      description: 'Você pode preencher o endereço manualmente.',
    })

    // Foca no campo de endereço para o usuário preencher manualmente
    setTimeout(() => {
      const enderecoField = document.querySelector<HTMLInputElement>(
        'input[name="endereco"]',
      )
      enderecoField?.focus()
    }, 100)
  }

  // Função para consultar empresa por CNPJ
  const consultarEmpresaCNPJ = (cnpj: string) => {
    // Garante que o CNPJ está limpo (sem máscara)
    const cnpjLimpo = cnpjUtils.limpar(cnpj)

    // Só consulta se o CNPJ estiver completo e válido
    if (
      !cnpjLimpo ||
      cnpjLimpo.length !== 14 ||
      !cnpjUtils.validar(cnpjLimpo)
    ) {
      // Limpa o estado se o CNPJ não for válido
      setEmpresaEncontrada(null)
      setToastJaMostrado(false)
      setCnpjParaConsultar('')
      return
    }

    // Reset do estado de toast quando CNPJ muda
    setToastJaMostrado(false)
    setEmpresaEncontrada(null)

    // Atualiza o estado - o useEffect vai executar a consulta
    setCnpjParaConsultar(cnpjLimpo)
  }

  // Resetar formulário quando dadosIniciais mudarem (para suporte ao debug)
  useEffect(() => {
    if (Object.keys(dadosIniciais).length > 0) {
      form.reset(buildFormDefaultValues(dadosIniciais))
    }
  }, [dadosIniciais, form])

  // Restaurar estados do CEP quando dadosIniciais.cep existe (corrige problema ao voltar de outros steps)
  useEffect(() => {
    const cepInicial = dadosIniciais.cep
    if (!cepInicial) {
      return
    }

    const cepLimpo = cepInicial.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      return
    }

    setCepValido(true)
    setCepPreenchido(true)
    setCepError(null)

    if (!empresaEncontrada && dadosIniciais.empresaId) {
      setEmpresaEncontrada({
        id: dadosIniciais.empresaId,
        cnpj: dadosIniciais.cnpj ?? '',
        razaoSocial: dadosIniciais.razaoSocial ?? '',
      })
    }
  }, [dadosIniciais, empresaEncontrada])

  // Função para notificar mudanças de dados sem watch
  const handleDataChange = useCallback(
    (dados: Partial<DadosFornecedor>) => {
      if (onDataChange) {
        onDataChange(dados)
      }
    },
    [onDataChange],
  )

  // Função para notificar mudanças chamada nos onChange dos campos
  const notificarMudancas = useCallback(() => {
    if (!onDataChange) return

    const formValues = form.getValues() as z.infer<typeof fornecedorSchema>
    const empresaIdAtual = formValues.empresaId ?? empresaEncontrada?.id

    const dados: Partial<DadosFornecedor> = {
      cnpj: formValues.cnpj ?? '',
      razaoSocial: formValues.razaoSocial ?? '',
      estadoIE: formValues.estadoIE ?? '',
      inscricaoEstadual: formValues.inscricaoEstadual ?? '',
      inscricaoMunicipal: formValues.inscricaoMunicipal ?? '',
      endereco: formValues.endereco ?? '',
      numero: formValues.numero ?? '',
      complemento: formValues.complemento ?? '',
      bairro: formValues.bairro ?? '',
      cidade: formValues.cidade ?? '',
      estado: formValues.estado ?? '',
      cep: formValues.cep ?? '',
      ativo: formValues.ativo ?? false,
      empresaId: empresaIdAtual,
      contatos: (formValues.contatos ?? []).map((contato) => ({
        id: contato.id,
        nome: contato.nome ?? '',
        valor: contato.valor ?? '',
        tipo: contato.tipo,
        ativo: contato.ativo,
      })),
    }

    handleDataChange(dados)
  }, [form, handleDataChange, onDataChange, empresaEncontrada?.id])

  const handleFormSubmit = async (dados: z.infer<typeof fornecedorSchema>) => {
    if (isSubmitting) return // Previne múltiplos submits

    // Validação crítica: CEP deve ser válido para prosseguir
    if (!cepValido) {
      toast.error('CEP inválido ou não encontrado', {
        description:
          'É necessário um CEP válido para prosseguir com o cadastro.',
      })
      return
    }

    const dadosFornecedor = {
      ...dados,
      cnpj: cnpjUtils.limpar(dados.cnpj), // Limpa o CNPJ antes de enviar
    } as DadosFornecedor

    // Validações adicionais com feedback ao usuário
    if (!dadosFornecedor.contatos || dadosFornecedor.contatos.length === 0) {
      toast.error('Pelo menos um contato é obrigatório', {
        description: 'Adicione pelo menos um contato antes de continuar.',
      })
      return
    }

    const contatosValidos = dadosFornecedor.contatos.filter(
      (contato) => contato.nome && contato.valor && contato.tipo,
    )

    if (contatosValidos.length !== dadosFornecedor.contatos.length) {
      toast.error('Contatos inválidos', {
        description:
          'Verifique se todos os contatos estão preenchidos corretamente.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Se não é uma empresa existente, cadastra no sistema
      if (!empresaEncontrada) {
        const empresaRequest = {
          cnpj: dadosFornecedor.cnpj,
          razaoSocial: dadosFornecedor.razaoSocial,
          inscricaoEstadual: dadosFornecedor.inscricaoEstadual ?? '',
          inscricaoMunicipal: dadosFornecedor.inscricaoMunicipal ?? '',
          endereco: dadosFornecedor.endereco,
          bairro: dadosFornecedor.bairro,
          cidade: dadosFornecedor.cidade,
          estado: dadosFornecedor.estado,
          cep: dadosFornecedor.cep,
          usuarioCadastroId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Valor fixo conforme especificação
          contatos: dadosFornecedor.contatos.map((contato) => ({
            nome: contato.nome,
            valor: contato.valor,
            tipo: contato.tipo,
          })),
        }

        const empresaCriada = await cadastrarEmpresaAsync(empresaRequest)

        // Validação robusta da empresa criada
        if (!empresaCriada) {
          toast.error('Erro no cadastro da empresa', {
            description: 'Resposta vazia do servidor',
          })
          return
        }

        if (!empresaCriada.id) {
          toast.error('Erro no cadastro da empresa', {
            description: 'ID da empresa não foi retornado',
          })
          return
        }

        const valoresAtuais = form.getValues()
        form.setValue('empresaId', empresaCriada.id)

        // Definir empresa encontrada para consistência da UI
        setEmpresaEncontrada({
          id: empresaCriada.id,
          cnpj: empresaCriada.cnpj,
          razaoSocial: empresaCriada.razaoSocial,
        } as EmpresaResponse)

        // Atualizar os dados com o ID da empresa
        const dadosAtualizados = {
          ...valoresAtuais,
          empresaId: empresaCriada.id,
          cnpj: empresaCriada.cnpj,
          razaoSocial: empresaCriada.razaoSocial,
        }

        // Propagar mudança IMEDIATAMENTE
        if (onDataChange) {
          onDataChange(dadosAtualizados)
        }

        // Força notificação das mudanças
        setTimeout(() => {
          notificarMudancas()
        }, 100)

        // Notificar componente pai que uma empresa foi cadastrada
        if (onEmpresaCadastrada) {
          onEmpresaCadastrada({
            cnpj: dadosFornecedor.cnpj,
            razaoSocial: dadosFornecedor.razaoSocial,
          })
        }

        toast.success('Empresa cadastrada com sucesso!', {
          description: 'Nova empresa foi cadastrada no sistema.',
          icon: <Check className="h-4 w-4" />,
        })
      }

      // Avança para o próximo step
      const empresaIdFinal =
        form.getValues('empresaId') ?? empresaEncontrada?.id

      if (onAdvanceRequest) {
        // Incluir o empresaId nos dados se disponível
        const dadosCompletos = {
          ...dadosFornecedor,
          empresaId: empresaIdFinal,
        }
        await onAdvanceRequest(dadosCompletos)
      } else {
        // Incluir o empresaId nos dados se disponível
        const dadosCompletos = {
          ...dadosFornecedor,
          empresaId: empresaIdFinal,
        }
        onSubmit(dadosCompletos)
      }
    } catch {
      toast.error('Erro ao processar formulário', {
        description: 'Tente novamente ou verifique os dados.',
      })

      // Reset da mutation para permitir nova tentativa
      resetMutation()
    } finally {
      setIsSubmitting(false)
    }
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

  const getPlaceholderPorTipo = (tipo: Contato['tipo']) => {
    switch (tipo) {
      case 'Email':
        return 'exemplo@email.com'
      case 'Telefone':
        return '(11) 3333-4444'
      case 'Celular':
      default:
        return '(11) 9 9999-8888'
    }
  }

  const getLabelPorTipo = (tipo: Contato['tipo']) => {
    switch (tipo) {
      case 'Email':
        return 'E-mail'
      case 'Telefone':
        return 'Telefone Fixo'
      case 'Celular':
      default:
        return 'Celular'
    }
  }

  // Função para aplicar máscara no CEP
  const aplicarMascaraCEP = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
  }


  // Função para aplicar máscara no telefone fixo
  const aplicarMascaraTelefoneFixo = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`
    } else if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    } else if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6, 10)}`
    }
  }

  // Função para aplicar máscara no celular
  const aplicarMascaraCelular = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`
    } else if (apenasNumeros.length <= 3) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 3)} ${apenasNumeros.slice(3)}`
    } else if (apenasNumeros.length <= 11) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 3)} ${apenasNumeros.slice(3, 7)}-${apenasNumeros.slice(7)}`
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 3)} ${apenasNumeros.slice(3, 7)}-${apenasNumeros.slice(7, 11)}`
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                <Building2
                  className="h-4 w-4 text-slate-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Informações Básicas
              </h3>
            </div>
            {empresaEncontrada && (
              <div className="flex items-center space-x-2 rounded-md bg-green-50 px-3 py-1.5 text-sm text-green-700">
                <Check className="h-4 w-4" />
                <span>Empresa já cadastrada</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para CNPJ */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => {
                  const cnpjValue = field.value || ''
                  const isValidCnpj =
                    cnpjValue.length > 0 ? cnpjUtils.validar(cnpjValue) : null

                  return (
                    <FormItem>
                      <FormLabel htmlFor="cnpj" className="mb-2">
                        CNPJ *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="cnpj"
                            {...field}
                            placeholder="00.000.000/0000-00"
                            disabled={!!empresaEncontrada}
                            onChange={(e) => {
                              const valorMascarado = cnpjUtils.aplicarMascara(
                                e.target.value,
                              )
                              field.onChange(valorMascarado)

                              // Só consulta se o CNPJ estiver completo (18 caracteres com máscara)
                              if (valorMascarado.length === 18) {
                                // Valida e consulta com CNPJ limpo (sem máscara)
                                const cnpjLimpo =
                                  cnpjUtils.limpar(valorMascarado)
                                const isValid = cnpjUtils.validar(cnpjLimpo)

                                if (isValid) {
                                  consultarEmpresaCNPJ(valorMascarado)
                                }
                              } else {
                                // Se o CNPJ não estiver completo, limpa o estado
                                setEmpresaEncontrada(null)
                                setToastJaMostrado(false)
                                setCnpjParaConsultar('')
                              }

                              // Notifica mudanças
                              setTimeout(() => notificarMudancas(), 0)
                            }}
                            className={cn(
                              'w-full',
                              isValidCnpj === true &&
                                'border-green-500 bg-green-50 pr-10',
                              isValidCnpj === false &&
                                'border-red-500 bg-red-50 pr-10',
                              !!empresaEncontrada &&
                                'cursor-not-allowed bg-slate-100 opacity-50',
                            )}
                          />
                          {isConsultandoCNPJ && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-600" />
                            </div>
                          )}
                          {isValidCnpj !== null && !isConsultandoCNPJ && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
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
            </div>

            {/* Container para Razão Social */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="razaoSocial" className="mb-2">
                      Razão Social *
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="razaoSocial"
                        placeholder="Digite a razão social"
                        className={cn(
                          'w-full',
                          !!empresaEncontrada &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                        disabled={!!empresaEncontrada}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Container para Inscrição Estadual */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="inscricaoEstadual"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="inscricaoEstadual" className="mb-2">
                        Inscrição Estadual
                      </FormLabel>
                      <div className="flex gap-2">
                        {/* Dropdown de Estados */}
                        <FormField
                          control={form.control}
                          name="estadoIE"
                          render={({ field: estadoField }) => (
                            <FormItem className="flex w-20 flex-col justify-end">
                              <Select
                                onValueChange={(value) => {
                                  estadoField.onChange(value)
                                  // Limpa os campos de inscrição quando UF muda
                                  form.setValue('inscricaoEstadual', '')
                                  form.setValue('inscricaoMunicipal', '')
                                  // Notifica mudanças
                                  setTimeout(() => notificarMudancas(), 0)
                                }}
                                value={estadoField.value}
                                disabled={!!empresaEncontrada}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    id="estadoIE"
                                    className={cn(
                                      'w-full',
                                      !!empresaEncontrada &&
                                        'cursor-not-allowed bg-slate-100 opacity-50',
                                    )}
                                  >
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
                        <div className="relative flex-1">
                          <Input
                            id="inscricaoEstadual"
                            {...field}
                            placeholder={
                              estadoSelecionado
                                ? 'Ex: 12.345.67-8'
                                : 'Selecione UF primeiro'
                            }
                            disabled={!estadoSelecionado || !!empresaEncontrada}
                            onChange={(e) => {
                              if (estadoSelecionado) {
                                const valorMascarado = ieUtils.aplicarMascara(
                                  e.target.value,
                                  estadoSelecionado,
                                )
                                field.onChange(valorMascarado)
                                // Notifica mudanças
                                setTimeout(() => notificarMudancas(), 0)
                              } else {
                                field.onChange(e.target.value)
                              }
                            }}
                            className={cn(
                              (!estadoSelecionado || !!empresaEncontrada) &&
                                'cursor-not-allowed bg-slate-100 opacity-50',
                            )}
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            {/* Container para Inscrição Municipal */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="inscricaoMunicipal"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel htmlFor="inscricaoMunicipal" className="mb-2">
                        Inscrição Municipal
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="inscricaoMunicipal"
                            {...field}
                            placeholder={
                              estadoSelecionado
                                ? 'Ex: 12345-67'
                                : 'Selecione UF da IE primeiro'
                            }
                            disabled={!estadoSelecionado || !!empresaEncontrada}
                            onChange={(e) => {
                              if (estadoSelecionado) {
                                const valorMascarado = imUtils.aplicarMascara(
                                  e.target.value,
                                  estadoSelecionado,
                                )
                                field.onChange(valorMascarado)
                                // Notifica mudanças
                                setTimeout(() => notificarMudancas(), 0)
                              } else {
                                field.onChange(e.target.value)
                              }
                            }}
                            className={cn(
                              (!estadoSelecionado || !!empresaEncontrada) &&
                                'cursor-not-allowed bg-slate-100 opacity-50',
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
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
            {/* Container para CEP */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">CEP *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="12345-678"
                          {...field}
                          disabled={!!empresaEncontrada}
                          onChange={(e) => {
                            const valorMascarado = aplicarMascaraCEP(
                              e.target.value,
                            )
                            field.onChange(valorMascarado)

                            // Só busca CEP quando o formato estiver completo
                            if (valorMascarado) {
                              void buscarCEP(valorMascarado)
                            }
                          }}
                          className={cn(
                            cepError && 'border-red-500 bg-red-50',
                            cepValido && 'border-green-500 bg-green-50',
                            !!empresaEncontrada &&
                              'cursor-not-allowed bg-slate-100 opacity-50',
                          )}
                        />
                        {isLoadingCEP && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-600" />
                          </div>
                        )}
                        {!isLoadingCEP && cepValido && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    {cepError && (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600">{cepError}</p>
                        {cepBypassDisponivel && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={bypassViaCEP}
                            className="flex items-center gap-2 text-xs"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Continuar sem validar CEP
                          </Button>
                        )}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Logradouro */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Logradouro *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Avenida, Travessa..."
                        {...field}
                        disabled={!cepPreenchido || !!empresaEncontrada}
                        className={cn(
                          (!cepPreenchido || !!empresaEncontrada) &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Cidade */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Cidade *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rio de Janeiro"
                        {...field}
                        disabled={!cepPreenchido || !!empresaEncontrada}
                        className={cn(
                          (!cepPreenchido || !!empresaEncontrada) &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Container para Bairro */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Bairro *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ramos"
                        {...field}
                        disabled={!cepPreenchido || !!empresaEncontrada}
                        className={cn(
                          (!cepPreenchido || !!empresaEncontrada) &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Container para UF */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">UF *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!cepPreenchido || !!empresaEncontrada}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              'h-9 w-full',
                              (!cepPreenchido || !!empresaEncontrada) &&
                                'cursor-not-allowed bg-slate-100 opacity-50',
                            )}
                          >
                            <SelectValue placeholder="Estado" />
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
              </div>

              {/* Container para Número */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Número *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          {...field}
                          disabled={!cepPreenchido || !!empresaEncontrada}
                          className={cn(
                            (!cepPreenchido || !!empresaEncontrada) &&
                              'cursor-not-allowed bg-slate-100 opacity-50',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Container para Complemento */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apt, Sala, Bloco... (opcional)"
                        {...field}
                        disabled={!cepPreenchido || !!empresaEncontrada}
                        className={cn(
                          (!cepPreenchido || !!empresaEncontrada) &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Contatos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-3 border-b border-slate-200 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                <Phone className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Contatos
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarContato}
              disabled={fields.length >= 3 || !!empresaEncontrada}
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
                      disabled={!!empresaEncontrada}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Container para Nome do Contato */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`contatos.${index}.nome`}
                        render={({ field: nomeField }) => (
                          <FormItem>
                            <FormLabel className="mb-2">
                              Nome do Contato
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite o nome"
                                {...nomeField}
                                disabled={!!empresaEncontrada}
                                className={cn(
                                  !!empresaEncontrada &&
                                    'cursor-not-allowed bg-slate-100 opacity-50',
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Container para Tipo do Contato */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`contatos.${index}.tipo`}
                        render={({ field: tipoField }) => (
                          <FormItem>
                            <FormLabel className="mb-2">
                              Tipo do Contato
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                tipoField.onChange(value)
                                // Limpa o valor do contato quando o tipo muda
                                form.setValue(`contatos.${index}.valor`, '')
                              }}
                              value={tipoField.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'w-full',
                                    !!empresaEncontrada &&
                                      'cursor-not-allowed bg-slate-100 opacity-50',
                                  )}
                                  disabled={!!empresaEncontrada}
                                >
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Email">E-mail</SelectItem>
                                <SelectItem value="Telefone">
                                  Telefone Fixo
                                </SelectItem>
                                <SelectItem value="Celular">Celular</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Container para Valor do Contato */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`contatos.${index}.valor`}
                        render={({ field: valorField }) => {
                          // Usa o tipo memoizado para evitar re-renders
                          const tipoContato =
                            tiposContatosMemo[index] ?? 'Email'

                          return (
                            <FormItem>
                              <FormLabel className="mb-2">
                                {getLabelPorTipo(tipoContato)}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder={getPlaceholderPorTipo(
                                      tipoContato,
                                    )}
                                    type={
                                      tipoContato === 'Email' ? 'email' : 'tel'
                                    }
                                    value={valorField.value ?? ''}
                                    disabled={!!empresaEncontrada}
                                    className={cn(
                                      !!empresaEncontrada &&
                                        'cursor-not-allowed bg-slate-100 opacity-50',
                                    )}
                                    onChange={(e) => {
                                      let valorProcessado = e.target.value

                                      // Aplica máscara baseada no tipo
                                      if (tipoContato === 'Telefone') {
                                        valorProcessado =
                                          aplicarMascaraTelefoneFixo(
                                            e.target.value,
                                          )
                                      } else if (tipoContato === 'Celular') {
                                        valorProcessado = aplicarMascaraCelular(
                                          e.target.value,
                                        )
                                      }

                                      valorField.onChange(valorProcessado)

                                      // Validação em tempo real (opcional, não bloqueia)
                                      if (valorProcessado.length > 0) {
                                        if (tipoContato === 'Email') {
                                          validarEmail(valorProcessado)
                                        } else if (tipoContato === 'Telefone') {
                                          validarFormatoTelefoneFixo(
                                            valorProcessado,
                                          )
                                        } else if (tipoContato === 'Celular') {
                                          validarFormatoCelular(valorProcessado)
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {fields.length >= 3 && (
            <p className="text-center text-sm text-gray-500">
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
                  disabled={!!empresaEncontrada}
                  className={cn(
                    !!empresaEncontrada && 'cursor-not-allowed opacity-50',
                  )}
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
              aria-label={
                isSubmitting
                  ? 'Processando dados do fornecedor...'
                  : 'Avançar para próximo passo'
              }
              className={cn(
                'flex items-center gap-2 bg-slate-700 px-8 py-2.5 shadow-lg shadow-slate-700/20 transition-all duration-200 hover:bg-slate-600',
                isSubmitting && 'cursor-not-allowed opacity-50',
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

export default FornecedorForm
