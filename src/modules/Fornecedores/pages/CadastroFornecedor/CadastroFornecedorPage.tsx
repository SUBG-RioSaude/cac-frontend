import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X, Building2, MapPin, Phone, Save, UserPlus, Check, ArrowLeft, ShieldCheck } from 'lucide-react'
import { cn, cnpjUtils, ieUtils, imUtils } from '@/lib/utils'
import { toast } from 'sonner'

interface Contato {
  id: string
  nome: string
  tipo: 'Email' | 'Telefone' | 'Celular'
  valor: string
  ativo: boolean
}

interface NovoFornecedorData {
  cnpj: string
  razaoSocial: string
  estadoIE: string
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

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Funções de validação para contatos
const validarEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false

  const [localPart, domain] = email.split('@')
  if (!localPart || localPart.length < 2) return false
  if (!domain || domain.length < 4) return false
  if (!domain.includes('.')) return false
  if (domain.includes('..')) return false
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

// Função para aplicar máscara no CEP
const aplicarMascaraCEP = (valor: string) => {
  const apenasNumeros = valor.replace(/\D/g, '')
  if (apenasNumeros.length <= 5) {
    return apenasNumeros
  }
  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
}

// Função para validar formato do CEP
const validarFormatoCEP = (cep: string) => {
  const cepLimpo = cep.replace(/\D/g, '')
  return cepLimpo.length === 8
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

export default function CadastroFornecedorPage() {
  const navigate = useNavigate()
  
  // Estados para controle de loading e erros
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [cepBypassDisponivel, setCepBypassDisponivel] = useState(false)
  const [cepPreenchido, setCepPreenchido] = useState(false)
  const [cepValido, setCepValido] = useState(false)

  // Estados para validações em tempo real
  const [validacoes, setValidacoes] = useState({
    cnpj: null as boolean | null,
    inscricaoEstadual: null as boolean | null,
    inscricaoMunicipal: null as boolean | null,
    cep: null as boolean | null,
  })

  const [dados, setDados] = useState<NovoFornecedorData>({
    cnpj: '',
    razaoSocial: '',
    estadoIE: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    ativo: true,
    contatos: [{
      id: '1',
      nome: '',
      valor: '',
      tipo: 'Email',
      ativo: true,
    }],
  })

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
      const data = await response.json()

      if (data.erro) {
        setCepError('CEP não encontrado')
        setCepValido(false)
        setCepPreenchido(false)
        setCepBypassDisponivel(true)
        return
      }

      if (data.cep) {
        // Preenche os campos automaticamente
        setDados((prev) => ({
          ...prev,
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }))

        // Marca CEP como válido e habilita campos
        setCepValido(true)
        setCepPreenchido(true)
        
        toast.success('Endereço preenchido automaticamente!')
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
      description: 'Você pode preencher o endereço manualmente.'
    })
  }

  // Validação de CNPJ em tempo real
  useEffect(() => {
    if (dados.cnpj.length > 0) {
      const isValid = cnpjUtils.validar(dados.cnpj)
      setValidacoes(prev => ({ ...prev, cnpj: isValid }))
      
      if (dados.cnpj.length >= 18) {
        if (isValid) {
          toast.success('CNPJ válido!')
        } else {
          toast.error('CNPJ inválido. Verifique os números.')
        }
      }
    } else {
      setValidacoes(prev => ({ ...prev, cnpj: null }))
    }
  }, [dados.cnpj])

  // Validação de Inscrição Estadual em tempo real
  useEffect(() => {
    if (dados.inscricaoEstadual.length > 0 && dados.estadoIE) {
      const isValid = ieUtils.validar(dados.inscricaoEstadual, dados.estadoIE)
      setValidacoes(prev => ({ ...prev, inscricaoEstadual: isValid }))
      
      if (dados.inscricaoEstadual.length > 5) {
        if (isValid) {
          toast.success('Inscrição Estadual válida!')
        } else {
          toast.error('Inscrição Estadual inválida para o estado selecionado.')
        }
      }
    } else {
      setValidacoes(prev => ({ ...prev, inscricaoEstadual: null }))
    }
  }, [dados.inscricaoEstadual, dados.estadoIE])

  // Validação de Inscrição Municipal em tempo real
  useEffect(() => {
    if (dados.inscricaoMunicipal.length > 0 && dados.estadoIE) {
      const isValid = imUtils.validar(dados.inscricaoMunicipal, dados.estadoIE)
      setValidacoes(prev => ({ ...prev, inscricaoMunicipal: isValid }))
      
      if (dados.inscricaoMunicipal.length > 3) {
        if (isValid) {
          toast.success('Inscrição Municipal válida!')
        } else {
          toast.error('Inscrição Municipal inválida para o estado selecionado.')
        }
      }
    } else {
      setValidacoes(prev => ({ ...prev, inscricaoMunicipal: null }))
    }
  }, [dados.inscricaoMunicipal, dados.estadoIE])

  // Validação de CEP em tempo real
  useEffect(() => {
    if (dados.cep.length > 0) {
      const isValid = validarFormatoCEP(dados.cep)
      setValidacoes(prev => ({ ...prev, cep: isValid }))
    } else {
      setValidacoes(prev => ({ ...prev, cep: null }))
    }
  }, [dados.cep])

  const handleAdicionarContato = () => {
    if (dados.contatos.length < 3) {
      const novoContato: Contato = {
        id: `contato-${Date.now()}-${Math.random()}`,
        nome: '',
        tipo: 'Email',
        valor: '',
        ativo: true,
      }
      setDados((prev) => ({
        ...prev,
        contatos: [...prev.contatos, novoContato],
      }))
    }
  }

  const handleRemoverContato = (id: string) => {
    setDados((prev) => ({
      ...prev,
      contatos: prev.contatos.filter((contato) => contato.id !== id),
    }))
  }

  const handleAtualizarContato = (
    id: string,
    campo: keyof Contato,
    valor: string | boolean,
  ) => {
    setDados((prev) => ({
      ...prev,
      contatos: prev.contatos.map((contato) =>
        contato.id === id ? { ...contato, [campo]: valor } : contato,
      ),
    }))
  }

  const validarFormulario = (): boolean => {
    // Validação crítica: CEP deve ser válido para prosseguir
    if (!cepValido) {
      toast.error('CEP inválido ou não encontrado', {
        description: 'É necessário um CEP válido para prosseguir com o cadastro.',
      })
      return false
    }

    // Validações obrigatórias
    if (!dados.cnpj || !cnpjUtils.validar(dados.cnpj)) {
      toast.error('CNPJ é obrigatório e deve ser válido')
      return false
    }

    if (!dados.razaoSocial.trim() || dados.razaoSocial.length < 6) {
      toast.error('Razão Social deve ter pelo menos 6 caracteres')
      return false
    }

    if (!dados.cep || !validarFormatoCEP(dados.cep)) {
      toast.error('CEP é obrigatório e deve ter 8 dígitos')
      return false
    }

    if (!dados.endereco.trim() || dados.endereco.length < 5) {
      toast.error('Logradouro deve ter pelo menos 5 caracteres')
      return false
    }

    if (!dados.numero.trim()) {
      toast.error('Número é obrigatório')
      return false
    }

    if (!dados.bairro.trim()) {
      toast.error('Bairro é obrigatório')
      return false
    }

    if (!dados.cidade.trim()) {
      toast.error('Cidade é obrigatória')
      return false
    }

    if (!dados.estado.trim()) {
      toast.error('Estado é obrigatório')
      return false
    }

    // Validação de contatos
    if (dados.contatos.length === 0) {
      toast.error('Pelo menos um contato é obrigatório', {
        description: 'Adicione pelo menos um contato antes de continuar.',
      })
      return false
    }

    const contatosValidos = dados.contatos.filter(
      (contato) => contato.nome.trim() && contato.valor.trim() && contato.tipo,
    )

    if (contatosValidos.length !== dados.contatos.length) {
      toast.error('Contatos inválidos', {
        description: 'Verifique se todos os contatos estão preenchidos corretamente.',
      })
      return false
    }

    // Validação específica dos contatos
    for (const contato of dados.contatos) {
      if (contato.tipo === 'Email' && !validarEmail(contato.valor)) {
        toast.error(`E-mail inválido para o contato ${contato.nome}`)
        return false
      }
      
      if (contato.tipo === 'Telefone' && !validarFormatoTelefoneFixo(contato.valor)) {
        toast.error(`Telefone fixo inválido para o contato ${contato.nome}`)
        return false
      }
      
      if (contato.tipo === 'Celular' && !validarFormatoCelular(contato.valor)) {
        toast.error(`Celular inválido para o contato ${contato.nome}`)
        return false
      }
    }

    return true
  }

  const handleSalvar = async () => {
    if (isSubmitting) return // Previne múltiplos submits

    if (!validarFormulario()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Limpa o CNPJ antes de enviar
      const dadosParaEnviar = {
        ...dados,
        cnpj: cnpjUtils.limpar(dados.cnpj),
      }

      console.log('Dados para salvar:', dadosParaEnviar)
      toast.success('Fornecedor cadastrado com sucesso!')
      
      // Redireciona para a lista de fornecedores
      navigate('/fornecedores')
    } catch (error) {
      toast.error('Erro ao processar formulário', {
        description: 'Tente novamente ou verifique os dados.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoltar = () => {
    navigate('/fornecedores')
  }

  const getPlaceholderPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'Email':
        return 'exemplo@email.com'
      case 'Telefone':
        return '(11) 3333-4444'
      case 'Celular':
        return '(11) 9 9999-8888'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br to-muted/20 p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-gray-200 bg-white rounded-lg px-8 py-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoltar}
              className="h-10 w-10 p-0"
              aria-label="Voltar para lista"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <UserPlus className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cadastrar Fornecedor</h1>
              <p className="text-gray-500 mt-1">Preencha as informações do novo fornecedor</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Documentação */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Building2 className="h-6 w-6" />
                Documentação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <div className="relative">
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={dados.cnpj}
                      onChange={(e) => {
                        const valorMascarado = cnpjUtils.aplicarMascara(e.target.value)
                        setDados((prev) => ({ ...prev, cnpj: valorMascarado }))
                      }}
                      className={cn(
                        validacoes.cnpj === true && 'border-green-500 bg-green-50 pr-10',
                        validacoes.cnpj === false && 'border-red-500 bg-red-50 pr-10',
                      )}
                    />
                    {validacoes.cnpj !== null && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        {validacoes.cnpj ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    placeholder="Digite a razão social (mín. 6 caracteres)"
                    value={dados.razaoSocial}
                    onChange={(e) =>
                      setDados((prev) => ({
                        ...prev,
                        razaoSocial: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-4">
                  <Label htmlFor="estadoIE">Estado (UF) *</Label>
                  <Select
                    value={dados.estadoIE}
                    onValueChange={(value) => {
                      setDados((prev) => ({ ...prev, estadoIE: value }))
                      // Limpa os campos de inscrição quando UF muda
                      setDados((prev) => ({ 
                        ...prev, 
                        inscricaoEstadual: '',
                        inscricaoMunicipal: ''
                      }))
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <div className="relative">
                    <Input
                      id="inscricaoEstadual"
                      placeholder={
                        dados.estadoIE
                          ? 'Ex: 12.345.67-8'
                          : 'Selecione UF primeiro'
                      }
                      value={dados.inscricaoEstadual}
                      disabled={!dados.estadoIE}
                      onChange={(e) => {
                        if (dados.estadoIE) {
                          const valorMascarado = ieUtils.aplicarMascara(
                            e.target.value,
                            dados.estadoIE,
                          )
                          setDados((prev) => ({
                            ...prev,
                            inscricaoEstadual: valorMascarado,
                          }))
                        }
                      }}
                      className={cn(
                        !dados.estadoIE && 'cursor-not-allowed opacity-50',
                        validacoes.inscricaoEstadual === true && 'border-green-500 bg-green-50 pr-10',
                        validacoes.inscricaoEstadual === false && 'border-red-500 bg-red-50 pr-10',
                      )}
                    />
                    {validacoes.inscricaoEstadual !== null && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        {validacoes.inscricaoEstadual ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                  <div className="relative">
                    <Input
                      id="inscricaoMunicipal"
                      placeholder={
                        dados.estadoIE
                          ? 'Ex: 12345-67'
                          : 'Selecione UF da IE primeiro'
                      }
                      value={dados.inscricaoMunicipal}
                      disabled={!dados.estadoIE}
                      onChange={(e) => {
                        if (dados.estadoIE) {
                          const valorMascarado = imUtils.aplicarMascara(
                            e.target.value,
                            dados.estadoIE,
                          )
                          setDados((prev) => ({
                            ...prev,
                            inscricaoMunicipal: valorMascarado,
                          }))
                        }
                      }}
                      className={cn(
                        !dados.estadoIE && 'cursor-not-allowed opacity-50',
                        validacoes.inscricaoMunicipal === true && 'border-green-500 bg-green-50 pr-10',
                        validacoes.inscricaoMunicipal === false && 'border-red-500 bg-red-50 pr-10',
                      )}
                    />
                    {validacoes.inscricaoMunicipal !== null && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        {validacoes.inscricaoMunicipal ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MapPin className="h-6 w-6" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-4">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={dados.cep}
                      onChange={(e) => {
                        const valorMascarado = aplicarMascaraCEP(e.target.value)
                        setDados((prev) => ({ ...prev, cep: valorMascarado }))
                        
                        // Só busca CEP quando o formato estiver completo
                        if (valorMascarado && validarFormatoCEP(valorMascarado)) {
                          buscarCEP(valorMascarado)
                        }
                      }}
                      className={cn(
                        cepError && 'border-red-500 bg-red-50',
                        cepValido && 'border-green-500 bg-green-50',
                        validacoes.cep === false && 'border-red-500 bg-red-50',
                      )}
                    />
                    {isLoadingCEP && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-600"></div>
                      </div>
                    )}
                    {!isLoadingCEP && cepValido && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
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
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="estado">Estado (UF) *</Label>
                  <Select
                    value={dados.estado}
                    onValueChange={(value) =>
                      setDados((prev) => ({ ...prev, estado: value }))
                    }
                    disabled={!cepPreenchido}
                  >
                    <SelectTrigger className={cn(
                      'w-full',
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    placeholder="Digite a cidade"
                    value={dados.cidade}
                    disabled={!cepPreenchido}
                    onChange={(e) =>
                      setDados((prev) => ({ ...prev, cidade: e.target.value }))
                    }
                    className={cn(
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label htmlFor="endereco">Logradouro *</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, Avenida, Travessa... (mín. 5 caracteres)"
                    value={dados.endereco}
                    disabled={!cepPreenchido}
                    onChange={(e) =>
                      setDados((prev) => ({ ...prev, endereco: e.target.value }))
                    }
                    className={cn(
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    placeholder="123"
                    value={dados.numero}
                    disabled={!cepPreenchido}
                    onChange={(e) =>
                      setDados((prev) => ({ ...prev, numero: e.target.value }))
                    }
                    className={cn(
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    placeholder="Digite o bairro"
                    value={dados.bairro}
                    disabled={!cepPreenchido}
                    onChange={(e) =>
                      setDados((prev) => ({ ...prev, bairro: e.target.value }))
                    }
                    className={cn(
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    placeholder="Apt, Sala, Bloco... (opcional)"
                    value={dados.complemento}
                    disabled={!cepPreenchido}
                    onChange={(e) =>
                      setDados((prev) => ({ ...prev, complemento: e.target.value }))
                    }
                    className={cn(
                      !cepPreenchido && 'cursor-not-allowed bg-slate-100 opacity-50'
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Phone className="h-6 w-6" />
                Contatos
                <span className="text-muted-foreground text-sm font-normal">
                  (máximo 3)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <AnimatePresence mode="wait">
                {dados.contatos.map((contato, index) => (
                  <motion.div
                    key={contato.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 rounded-lg border p-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Contato {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverContato(contato.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Remover contato"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                      <div className="space-y-4">
                        <Label htmlFor={`nome-contato-${contato.id}`}>Nome do Contato *</Label>
                        <Input
                          id={`nome-contato-${contato.id}`}
                          placeholder="Digite o nome"
                          value={contato.nome}
                          onChange={(e) =>
                            handleAtualizarContato(
                              contato.id,
                              'nome',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor={`tipo-contato-${contato.id}`}>Tipo *</Label>
                        <Select
                          value={contato.tipo}
                          onValueChange={(value) =>
                            handleAtualizarContato(
                              contato.id,
                              'tipo',
                              value as 'Email' | 'Telefone' | 'Celular',
                            )
                          }
                        >
                          <SelectTrigger id={`tipo-contato-${contato.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">E-mail</SelectItem>
                            <SelectItem value="Telefone">Telefone Fixo</SelectItem>
                            <SelectItem value="Celular">Celular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor={`valor-contato-${contato.id}`}>
                          {contato.tipo === 'Email'
                            ? 'E-mail'
                            : contato.tipo === 'Telefone'
                              ? 'Telefone Fixo'
                              : 'Celular'} *
                        </Label>
                        <Input
                          id={`valor-contato-${contato.id}`}
                          placeholder={getPlaceholderPorTipo(contato.tipo)}
                          value={contato.valor}
                          type={contato.tipo === 'Email' ? 'email' : 'tel'}
                          onChange={(e) => {
                            let valorProcessado = e.target.value

                            // Aplica máscara baseada no tipo
                            if (contato.tipo === 'Telefone') {
                              valorProcessado = aplicarMascaraTelefoneFixo(e.target.value)
                            } else if (contato.tipo === 'Celular') {
                              valorProcessado = aplicarMascaraCelular(e.target.value)
                            }

                            handleAtualizarContato(
                              contato.id,
                              'valor',
                              valorProcessado,
                            )
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                variant="outline"
                onClick={handleAdicionarContato}
                className="w-full border-dashed bg-transparent py-6"
                disabled={dados.contatos.length >= 3}
              >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Contato
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <Checkbox
                  checked={dados.ativo}
                  onCheckedChange={(checked) =>
                    setDados((prev) => ({ ...prev, ativo: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <Label className="font-medium text-slate-700">
                    Fornecedor ativo
                  </Label>
                  <p className="text-xs text-slate-600">
                    Marque esta opção para manter o fornecedor ativo no sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleVoltar}
              className="sm:w-auto"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvar} 
              className="sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Salvar Fornecedor
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}