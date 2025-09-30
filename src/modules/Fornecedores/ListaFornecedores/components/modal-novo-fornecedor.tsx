import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Building2,
  MapPin,
  Phone,
  Save,
  UserPlus,
  Check,
} from 'lucide-react'
import type React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCEP } from '@/hooks/use-cep'
import { cn, cnpjUtils, ieUtils, imUtils } from '@/lib/utils'


interface Contato {
  id: string
  nome: string
  tipo: 'Email' | 'Fixo' | 'Celular'
  valor: string
  ativo: boolean
}

interface NovoFornecedorData {
  // Documentação
  cnpj: string
  razaoSocial: string
  estadoIE: string
  inscricaoEstadual: string
  inscricaoMunicipal: string
  // Endereço
  cep: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  // Status
  ativo: boolean
  // Contatos
  contatos: Contato[]
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

const tiposContato = [
  { value: 'Email', label: 'E-mail', placeholder: 'exemplo@email.com' },
  { value: 'Fixo', label: 'Telefone Fixo', placeholder: '(11) 3333-4444' },
  { value: 'Celular', label: 'Celular', placeholder: '(11) 9 9999-8888' },
]

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

interface ModalNovoFornecedorProps {
  onSalvar: (dados: NovoFornecedorData) => void
  children: React.ReactNode
}

export const ModalNovoFornecedor = ({
  onSalvar,
  children,
}: ModalNovoFornecedorProps) => {
  const [open, setOpen] = useState(false)
  const [cepPreenchido, setCepPreenchido] = useState(false)

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
    contatos: [],
  })

  // Hook para busca de CEP
  const {
    buscarCEP,
    isLoading: isLoadingCEP,
    error: cepError,
  } = useCEP({
    onSuccess: (endereco) => {
      // Preenche os campos automaticamente
      setDados((prev) => ({
        ...prev,
        endereco: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        estado: endereco.uf,
      }))

      setCepPreenchido(true)
      toast.success('Endereço preenchido automaticamente!')
    },
    onError: (error) => {
      toast.error(error)
      // Habilita campos mesmo com erro para permitir edição manual
      setCepPreenchido(true)
    },
  })

  // Validações em tempo real
  const [validacoes, setValidacoes] = useState({
    cnpj: null as boolean | null,
    inscricaoEstadual: null as boolean | null,
    inscricaoMunicipal: null as boolean | null,
    cep: null as boolean | null,
  })

  // Validação de CNPJ
  useEffect(() => {
    if (dados.cnpj.length > 0) {
      const isValid = cnpjUtils.validar(dados.cnpj)
      setValidacoes((prev) => ({ ...prev, cnpj: isValid }))

      if (dados.cnpj.length >= 18) {
        if (isValid) {
          toast.success('CNPJ válido!')
        } else {
          toast.error('CNPJ inválido. Verifique os números.')
        }
      }
    } else {
      setValidacoes((prev) => ({ ...prev, cnpj: null }))
    }
  }, [dados.cnpj])

  // Validação de Inscrição Estadual
  useEffect(() => {
    if (dados.inscricaoEstadual.length > 0 && dados.estadoIE) {
      const isValid = ieUtils.validar(dados.inscricaoEstadual, dados.estadoIE)
      setValidacoes((prev) => ({ ...prev, inscricaoEstadual: isValid }))

      if (isValid) {
        toast.success('Inscrição Estadual válida!')
      } else {
        toast.error('Inscrição Estadual inválida para o estado selecionado.')
      }
    } else {
      setValidacoes((prev) => ({ ...prev, inscricaoEstadual: null }))
    }
  }, [dados.inscricaoEstadual, dados.estadoIE])

  // Validação de Inscrição Municipal
  useEffect(() => {
    if (dados.inscricaoMunicipal.length > 0 && dados.estadoIE) {
      const isValid = imUtils.validar(dados.inscricaoMunicipal, dados.estadoIE)
      setValidacoes((prev) => ({ ...prev, inscricaoMunicipal: isValid }))

      if (isValid) {
        toast.success('Inscrição Municipal válida!')
      } else {
        toast.error('Inscrição Municipal inválida para o estado selecionado.')
      }
    } else {
      setValidacoes((prev) => ({ ...prev, inscricaoMunicipal: null }))
    }
  }, [dados.inscricaoMunicipal, dados.estadoIE])

  // Validação de CEP
  useEffect(() => {
    if (dados.cep.length > 0) {
      const isValid = validarFormatoCEP(dados.cep)
      setValidacoes((prev) => ({ ...prev, cep: isValid }))
    } else {
      setValidacoes((prev) => ({ ...prev, cep: null }))
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
    // Validações obrigatórias
    if (!dados.cnpj || !cnpjUtils.validar(dados.cnpj)) {
      toast.error('CNPJ é obrigatório e deve ser válido')
      return false
    }

    if (!dados.razaoSocial.trim()) {
      toast.error('Razão Social é obrigatória')
      return false
    }

    if (!dados.cep || !validarFormatoCEP(dados.cep)) {
      toast.error('CEP é obrigatório e deve ter 8 dígitos')
      return false
    }

    if (!dados.endereco.trim()) {
      toast.error('Logradouro é obrigatório')
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
      toast.error('Adicione pelo menos um contato para o fornecedor.')
      return false
    }

    const contatosValidos = dados.contatos.filter(
      (contato) => contato.nome.trim() && contato.valor.trim(),
    )

    if (contatosValidos.length !== dados.contatos.length) {
      toast.error('Preencha todos os dados dos contatos adicionados.')
      return false
    }

    // Validação específica dos contatos
    for (const contato of dados.contatos) {
      if (contato.tipo === 'Email' && !validarEmail(contato.valor)) {
        toast.error(`E-mail inválido para o contato ${contato.nome}`)
        return false
      }

      if (
        contato.tipo === 'Fixo' &&
        !validarFormatoTelefoneFixo(contato.valor)
      ) {
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

  const handleSalvar = () => {
    if (!validarFormulario()) {
      return
    }

    // Limpa o CNPJ antes de enviar
    const dadosParaEnviar = {
      ...dados,
      cnpj: cnpjUtils.limpar(dados.cnpj),
    }

    onSalvar(dadosParaEnviar)
    setOpen(false)

    // Reset form
    setDados({
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
      contatos: [],
    })

    setCepPreenchido(false)
    setValidacoes({
      cnpj: null,
      inscricaoEstadual: null,
      inscricaoMunicipal: null,
      cep: null,
    })
  }

  const getPlaceholderPorTipo = (tipo: string) => {
    const tipoEncontrado = tiposContato.find((t) => t.value === tipo)
    return tipoEncontrado?.placeholder ?? ''
  }

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Abrir modal de novo fornecedor"
      >
        {children}
      </div>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        data-testid="modal-overlay"
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fechar modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          role="dialog"
          className="z-50 max-h-[90vh] w-full max-w-[1400px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Novo Fornecedor
                  </h2>
                  <p className="mt-1 text-gray-500">
                    Preencha as informações do fornecedor
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10 p-8">
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
                          const valorMascarado = cnpjUtils.aplicarMascara(
                            e.target.value,
                          )
                          setDados((prev) => ({
                            ...prev,
                            cnpj: valorMascarado,
                          }))
                        }}
                        className={cn(
                          validacoes.cnpj === true &&
                            'border-green-500 bg-green-50 pr-10',
                          validacoes.cnpj === false &&
                            'border-red-500 bg-red-50 pr-10',
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
                      placeholder="Digite a razão social"
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
                          inscricaoMunicipal: '',
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
                    <Label htmlFor="inscricaoEstadual">
                      Inscrição Estadual
                    </Label>
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
                          validacoes.inscricaoEstadual === true &&
                            'border-green-500 bg-green-50 pr-10',
                          validacoes.inscricaoEstadual === false &&
                            'border-red-500 bg-red-50 pr-10',
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
                    <Label htmlFor="inscricaoMunicipal">
                      Inscrição Municipal
                    </Label>
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
                          validacoes.inscricaoMunicipal === true &&
                            'border-green-500 bg-green-50 pr-10',
                          validacoes.inscricaoMunicipal === false &&
                            'border-red-500 bg-red-50 pr-10',
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
                          const valorMascarado = aplicarMascaraCEP(
                            e.target.value,
                          )
                          setDados((prev) => ({ ...prev, cep: valorMascarado }))

                          // Só busca CEP quando o formato estiver completo
                          if (
                            valorMascarado &&
                            validarFormatoCEP(valorMascarado)
                          ) {
                            void buscarCEP(valorMascarado)
                          }
                        }}
                        className={cn(
                          cepError && 'border-red-500 bg-red-50',
                          validacoes.cep === true &&
                            'border-green-500 bg-green-50',
                          validacoes.cep === false &&
                            'border-red-500 bg-red-50',
                        )}
                      />
                      {isLoadingCEP && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-600" />
                        </div>
                      )}
                    </div>
                    {cepError && (
                      <p className="text-sm text-red-600">{cepError}</p>
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
                      <SelectTrigger
                        className={cn(
                          'w-full',
                          !cepPreenchido &&
                            'cursor-not-allowed bg-slate-100 opacity-50',
                        )}
                      >
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
                        setDados((prev) => ({
                          ...prev,
                          cidade: e.target.value,
                        }))
                      }
                      className={cn(
                        !cepPreenchido &&
                          'cursor-not-allowed bg-slate-100 opacity-50',
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Label htmlFor="endereco">Logradouro *</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, Avenida, Travessa..."
                      value={dados.endereco}
                      disabled={!cepPreenchido}
                      onChange={(e) =>
                        setDados((prev) => ({
                          ...prev,
                          endereco: e.target.value,
                        }))
                      }
                      className={cn(
                        !cepPreenchido &&
                          'cursor-not-allowed bg-slate-100 opacity-50',
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
                        setDados((prev) => ({
                          ...prev,
                          numero: e.target.value,
                        }))
                      }
                      className={cn(
                        !cepPreenchido &&
                          'cursor-not-allowed bg-slate-100 opacity-50',
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
                        setDados((prev) => ({
                          ...prev,
                          bairro: e.target.value,
                        }))
                      }
                      className={cn(
                        !cepPreenchido &&
                          'cursor-not-allowed bg-slate-100 opacity-50',
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
                        setDados((prev) => ({
                          ...prev,
                          complemento: e.target.value,
                        }))
                      }
                      className={cn(
                        !cepPreenchido &&
                          'cursor-not-allowed bg-slate-100 opacity-50',
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
                          <Label htmlFor={`nome-contato-${contato.id}`}>
                            Nome do Contato *
                          </Label>
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
                          <Label htmlFor={`tipo-contato-${contato.id}`}>
                            Tipo *
                          </Label>
                          <Select
                            value={contato.tipo}
                            onValueChange={(value) =>
                              handleAtualizarContato(
                                contato.id,
                                'tipo',
                                value as 'Email' | 'Fixo' | 'Celular',
                              )
                            }
                          >
                            <SelectTrigger id={`tipo-contato-${contato.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposContato.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor={`valor-contato-${contato.id}`}>
                            {tiposContato.find((t) => t.value === contato.tipo)
                              ?.label ?? 'Valor'}{' '}
                            *
                          </Label>
                          <Input
                            id={`valor-contato-${contato.id}`}
                            placeholder={getPlaceholderPorTipo(contato.tipo)}
                            value={contato.valor}
                            type={contato.tipo === 'Email' ? 'email' : 'tel'}
                            onChange={(e) => {
                              let valorProcessado = e.target.value

                              // Aplica máscara baseada no tipo
                              if (contato.tipo === 'Fixo') {
                                valorProcessado = aplicarMascaraTelefoneFixo(
                                  e.target.value,
                                )
                              } else if (contato.tipo === 'Celular') {
                                valorProcessado = aplicarMascaraCelular(
                                  e.target.value,
                                )
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
                      setDados((prev) => ({
                        ...prev,
                        ativo: checked as boolean,
                      }))
                    }
                  />
                  <div className="space-y-1">
                    <Label className="font-medium text-slate-700">
                      Fornecedor ativo
                    </Label>
                    <p className="text-xs text-slate-600">
                      Marque esta opção para manter o fornecedor ativo no
                      sistema
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
                onClick={() => setOpen(false)}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvar} className="sm:w-auto">
                <Save className="mr-2 h-5 w-5" />
                Salvar Fornecedor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
