import {
  Trash2,
  Plus,
  Building2,
  CheckCircle,
  Edit3,
  ArrowRight,
} from 'lucide-react'
import type React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { currencyUtils, percentualUtils } from '@/lib/utils'
import type { UnidadeHospitalar } from '@/modules/Contratos/types/unidades'

import BuscaUnidadeInteligente from './busca-unidade-inteligente'

interface UnidadeContrato {
  id: string
  unidadeHospitalar: UnidadeHospitalar
  valorAlocado: string
  percentualContrato: number
  observacoes?: string
}

export interface DadosUnidades {
  unidades: UnidadeContrato[]
  observacoes: string
}

// Estrutura para envio para a API (nova estrutura)
export interface UnidadeVinculadaAPI {
  unidadeSaudeId: string
  valorAtribuido: number
  observacoes?: string
}

interface UnidadesFormMelhoradoProps {
  onSubmit: (dados: DadosUnidades) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosUnidades>
  valorTotalContrato?: number
  onFinishRequest?: (dados: DadosUnidades) => void
}

const UnidadesFormMelhorado = ({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  valorTotalContrato = 0,
  onFinishRequest,
}: UnidadesFormMelhoradoProps) => {
  const [dadosUnidades, setDadosUnidades] = useState<DadosUnidades>({
    unidades: [],
    observacoes: '',
    ...dadosIniciais,
  })

  // Sincronizar com dadosIniciais quando mudarem (para suporte ao debug)
  useEffect(() => {
    if (Object.keys(dadosIniciais).length > 0) {
      setDadosUnidades({
        unidades: [],
        observacoes: '',
        ...dadosIniciais,
      })
    }
  }, [dadosIniciais])

  const [unidadeSelecionada, setUnidadeSelecionada] =
    useState<UnidadeHospitalar | null>(null)
  const [valorAlocado, setValorAlocado] = useState('')
  const [percentualContrato, setPercentualContrato] = useState<number>(0)

  // Estados para controlar quais campos estão travados (por unidade)
  const [camposTravados, setCamposTravados] = useState<Record<string, {
      valor: boolean
      percentual: boolean
    }>>({})

  // Estado para controlar qual unidade está sendo editada
  const [unidadeEmEdicao, setUnidadeEmEdicao] = useState<string | null>(null)

  // Estado para erros de validação de percentual
  const [erroPercentual, setErroPercentual] = useState<string>('')

  // Função para obter o estado de travamento de uma unidade
  const getCamposTravados = (unidadeId: string) => {
    if (!unidadeId) {
      return { valor: false, percentual: false }
    }

    const estado = camposTravados[unidadeId] ?? {
      valor: false,
      percentual: false,
    }
    return estado
  }

  // Função para atualizar o estado de travamento de uma unidade
  const setCamposTravadosUnidade = (
    unidadeId: string,
    campo: 'valor' | 'percentual',
    travado: boolean,
  ) => {
    if (!unidadeId) {
      return
    }

    setCamposTravados((prev) => {
      const estadoAtual = prev[unidadeId] ?? { valor: false, percentual: false }
      const novoEstado = {
        ...prev,
        [unidadeId]: {
          ...estadoAtual,
          [campo]: travado,
        },
      }

      return novoEstado
    })
  }

  const handleUnidadeSelecionada = (unidade: UnidadeHospitalar) => {
    setUnidadeSelecionada(unidade)
    // Reset dos valores quando uma nova unidade é selecionada
    setValorAlocado('')
    setPercentualContrato(0)
    setErroPercentual('')
    // Limpar campos travados da unidade anterior
    setCamposTravadosUnidade(unidade.id, 'valor', false)
    setCamposTravadosUnidade(unidade.id, 'percentual', false)
  }

  const handleLimparSelecao = () => {
    setUnidadeSelecionada(null)
    setValorAlocado('')
    setPercentualContrato(0)
    setErroPercentual('')
    // Limpar campos travados da unidade selecionada
    if (unidadeSelecionada) {
      setCamposTravadosUnidade(unidadeSelecionada.id, 'valor', false)
      setCamposTravadosUnidade(unidadeSelecionada.id, 'percentual', false)
    }
  }

  const adicionarUnidade = () => {
    if (!unidadeSelecionada) return

    // Verifica se a unidade já foi adicionada
    const jaExiste = dadosUnidades.unidades.some(
      (u) => u.unidadeHospitalar.id === unidadeSelecionada.id,
    )

    if (jaExiste) {
      alert('Esta unidade já foi adicionada ao contrato.')
      return
    }

    // Aplicar lógica de cálculo antes de adicionar
    let valorFinal = valorAlocado
    let percentualFinal = percentualContrato

    // Se valor foi preenchido, calcular percentual
    if (valorAlocado && valorTotalContrato > 0) {
      const valorNum = currencyUtils.paraNumero(valorAlocado)
      if (valorNum > 0) {
        percentualFinal = (valorNum / valorTotalContrato) * 100
      }
    }
    // Se percentual foi preenchido, calcular valor
    else if (percentualContrato > 0 && valorTotalContrato > 0) {
      const novoValor = (percentualContrato / 100) * valorTotalContrato
      valorFinal = currencyUtils.formatar(novoValor)
    }

    const novaUnidade: UnidadeContrato = {
      id: Date.now().toString(),
      unidadeHospitalar: unidadeSelecionada,
      valorAlocado: valorFinal || currencyUtils.formatar(0),
      percentualContrato: percentualFinal || 0,
    }

    setDadosUnidades((prev) => ({
      ...prev,
      unidades: [...prev.unidades, novaUnidade],
    }))

    // Garantir que os campos da nova unidade fiquem travados após ser adicionada
    setTimeout(() => {
      setCamposTravadosUnidade(novaUnidade.id, 'valor', true)
      setCamposTravadosUnidade(novaUnidade.id, 'percentual', true)
    }, 50)

    // Limpa a seleção após adicionar
    handleLimparSelecao()
  }

  const removerUnidade = (id: string) => {
    setDadosUnidades((prev) => ({
      ...prev,
      unidades: prev.unidades.filter((unidade) => unidade.id !== id),
    }))
    // Limpar campos travados da unidade removida
    setCamposTravados((prev) => {
      const novoEstado = { ...prev }
      delete novoEstado[id]
      return novoEstado
    })
  }

  const iniciarEdicao = (id: string) => {
    setUnidadeEmEdicao(id)
    // Destravar campos para edição
    setCamposTravadosUnidade(id, 'valor', false)
    setCamposTravadosUnidade(id, 'percentual', false)
  }

  const cancelarEdicao = (id: string) => {
    setUnidadeEmEdicao(null)
    // Travar campos novamente
    setCamposTravadosUnidade(id, 'valor', true)
    setCamposTravadosUnidade(id, 'percentual', true)
  }

  const salvarEdicao = (id: string) => {
    setUnidadeEmEdicao(null)
    // Travar campos após salvar
    setCamposTravadosUnidade(id, 'valor', true)
    setCamposTravadosUnidade(id, 'percentual', true)
  }

  const atualizarUnidade = (
    id: string,
    campo: 'valorAlocado' | 'percentualContrato',
    valor: string | number,
  ) => {
    // Só permite atualização se a unidade estiver em modo de edição
    if (unidadeEmEdicao !== id) {
      return
    }

    setDadosUnidades((prev) => ({
      ...prev,
      unidades: prev.unidades.map((unidade) => {
        if (unidade.id === id) {
          const unidadeAtualizada = { ...unidade, [campo]: valor }

          // Calcular percentual quando valor é alterado (apenas se em edição)
          if (campo === 'valorAlocado' && valorTotalContrato > 0) {
            const valorNum = currencyUtils.paraNumero(valor as string)
            if (valorNum > 0) {
              unidadeAtualizada.percentualContrato =
                (valorNum / valorTotalContrato) * 100
            }
          }

          // Calcular valor quando percentual é alterado (apenas se em edição)
          if (campo === 'percentualContrato' && valorTotalContrato > 0) {
            const percentualNum = Number.parseFloat(valor as string) || 0
            if (percentualNum > 0) {
              const novoValor = (percentualNum / 100) * valorTotalContrato
              unidadeAtualizada.valorAlocado = currencyUtils.formatar(novoValor)
            }
          }

          return unidadeAtualizada
        }
        return unidade
      }),
    }))
  }

  const calcularTotalAlocado = () => {
    return dadosUnidades.unidades.reduce((total, unidade) => {
      return total + currencyUtils.paraNumero(unidade.valorAlocado)
    }, 0)
  }

  const calcularTotalPercentual = () => {
    return dadosUnidades.unidades.reduce((total, unidade) => {
      return total + (unidade.percentualContrato || 0)
    }, 0)
  }

  // Validações para finalizar cadastro
  const validarPercentualTotal = () => {
    const totalPercentual = calcularTotalPercentual()
    return Math.abs(totalPercentual - 100) < 0.01 // Tolerância de 0.01%
  }

  const validarValorTotal = () => {
    const totalAlocado = calcularTotalAlocado()
    return Math.abs(totalAlocado - valorTotalContrato) < 0.01 // Tolerância de R$ 0.01
  }

  const podeFinalizarCadastro = () => {
    return (
      dadosUnidades.unidades.length > 0 &&
      validarPercentualTotal() &&
      validarValorTotal()
    )
  }

  const handleValorAlocadoChange = (valor: string) => {
    const valorMascarado = currencyUtils.aplicarMascara(valor)
    setValorAlocado(valorMascarado)

    // Se o valor foi preenchido e temos valor total, calcular percentual
    if (valorMascarado && valorTotalContrato > 0 && unidadeSelecionada?.id) {
      const valorNum = currencyUtils.paraNumero(valorMascarado)

      if (valorNum > 0) {
        const novoPercentual = (valorNum / valorTotalContrato) * 100
        setPercentualContrato(novoPercentual)

        // Travar campo de percentual
        setCamposTravadosUnidade(unidadeSelecionada.id, 'valor', false)
        setCamposTravadosUnidade(unidadeSelecionada.id, 'percentual', true)
      }
    } else if (
      (!valorMascarado || valorMascarado === 'R$ 0,00') &&
      unidadeSelecionada?.id
    ) {
      // Se o valor foi limpo, destravar campo de percentual
      setCamposTravadosUnidade(unidadeSelecionada.id, 'percentual', false)
      setPercentualContrato(0)
    }
  }

  const handlePercentualChange = (percentual: number) => {
    // Validar percentual
    const erroValidacao = percentualUtils.validarComMensagem(percentual)
    setErroPercentual(erroValidacao)

    setPercentualContrato(percentual)

    // Se o percentual foi preenchido e temos valor total, calcular valor
    if (percentual > 0 && valorTotalContrato > 0 && unidadeSelecionada?.id) {
      const novoValor = (percentual / 100) * valorTotalContrato
      setValorAlocado(currencyUtils.formatar(novoValor))

      // Travar campo de valor
      setCamposTravadosUnidade(unidadeSelecionada.id, 'valor', true)
      setCamposTravadosUnidade(unidadeSelecionada.id, 'percentual', false)
    } else if (percentual === 0 && unidadeSelecionada?.id) {
      // Se o percentual foi limpo, destravar campo de valor
      setCamposTravadosUnidade(unidadeSelecionada.id, 'valor', false)
      setValorAlocado('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onFinishRequest) {
      onFinishRequest(dadosUnidades)
    } else {
      onSubmit(dadosUnidades)
    }
  }

  const podeAdicionarUnidade =
    unidadeSelecionada &&
    (valorAlocado || percentualContrato > 0) &&
    !erroPercentual

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Unidades Contempladas</h3>
        </div>
      </div>

      {/* Resumo financeiro */}
      {valorTotalContrato > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
            <div className="text-center">
              <span className="font-medium text-slate-700">
                Valor Total do Contrato
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {currencyUtils.formatar(valorTotalContrato)}
              </p>
            </div>
            <div className="text-center">
              <span className="font-medium text-slate-700">Total Alocado</span>
              <p
                className={`mt-1 text-lg font-semibold ${validarValorTotal() ? 'text-green-600' : 'text-red-600'}`}
              >
                {currencyUtils.formatar(calcularTotalAlocado())}
              </p>
              {!validarValorTotal() && (
                <p className="mt-1 text-xs text-red-500">
                  Diferença:{' '}
                  {currencyUtils.formatar(
                    Math.abs(calcularTotalAlocado() - valorTotalContrato),
                  )}
                </p>
              )}
            </div>
            <div className="text-center">
              <span className="font-medium text-slate-700">
                Percentual Total
              </span>
              <p
                className={`mt-1 text-lg font-semibold ${validarPercentualTotal() ? 'text-green-600' : 'text-red-600'}`}
              >
                {percentualUtils.formatar(calcularTotalPercentual())}%
              </p>
              {!validarPercentualTotal() && (
                <p className="mt-1 text-xs text-red-500">
                  Faltam:{' '}
                  {percentualUtils.formatar(100 - calcularTotalPercentual())}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seção de busca e adição de unidade */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h4 className="mb-4 flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Adicionar Nova Unidade
        </h4>

        {/* Indicador de status dos campos */}
        {(getCamposTravados(unidadeSelecionada?.id ?? '').valor ||
          getCamposTravados(unidadeSelecionada?.id ?? '').percentual) && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span className="font-medium">
                {getCamposTravados(unidadeSelecionada?.id ?? '').valor
                  ? 'Campo de valor travado - use o percentual para alterar'
                  : 'Campo de percentual travado - use o valor para alterar'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Busca inteligente */}
          <BuscaUnidadeInteligente
            onUnidadeSelecionada={handleUnidadeSelecionada}
            unidadeSelecionada={unidadeSelecionada}
            onLimpar={handleLimparSelecao}
          />

          {/* Campos de valor e percentual */}
          {unidadeSelecionada && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valor-alocado">Valor Alocado *</Label>
                <Input
                  id="valor-alocado"
                  value={valorAlocado}
                  onChange={(e) => handleValorAlocadoChange(e.target.value)}
                  placeholder="R$ 0,00"
                  required
                  disabled={getCamposTravados(unidadeSelecionada.id).valor}
                  className={
                    getCamposTravados(unidadeSelecionada.id).valor
                      ? 'cursor-not-allowed bg-gray-100'
                      : ''
                  }
                />
                {getCamposTravados(unidadeSelecionada.id).valor && (
                  <p className="text-xs text-blue-600">
                    🔒 Campo travado - use o campo de percentual para alterar
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentual-contrato">
                  Percentual do Contrato (%)
                </Label>
                <Input
                  id="percentual-contrato"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentualUtils.formatar(percentualContrato)}
                  onChange={(e) => {
                    const valor = percentualUtils.normalizarEntrada(
                      e.target.value,
                    )
                    handlePercentualChange(percentualUtils.paraNumero(valor))
                  }}
                  placeholder="0,00"
                  disabled={getCamposTravados(unidadeSelecionada.id).percentual}
                  className={`${getCamposTravados(unidadeSelecionada.id).percentual ? 'cursor-not-allowed bg-gray-100' : ''} ${erroPercentual ? 'border-red-500' : ''}`}
                />
                {erroPercentual &&
                  !getCamposTravados(unidadeSelecionada.id).percentual && (
                    <p className="text-xs text-red-600">{erroPercentual}</p>
                  )}
                {getCamposTravados(unidadeSelecionada.id).percentual && (
                  <p className="text-xs text-blue-600">
                    🔒 Campo travado - use o campo de valor para alterar
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botão adicionar */}
          {unidadeSelecionada && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={adicionarUnidade}
                disabled={!podeAdicionarUnidade}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Unidade
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lista de unidades adicionadas */}
      {dadosUnidades.unidades.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma unidade adicionada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Use a busca acima para encontrar e adicionar unidades ao contrato.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Unidades Adicionadas ({dadosUnidades.unidades.length})
          </h4>

          {dadosUnidades.unidades.map((unidade) => (
            <div
              key={unidade.id}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shadow-sm">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-slate-900">
                      {unidade.unidadeHospitalar.nome}
                    </h5>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                        {unidade.unidadeHospitalar.sigla}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-700/10 ring-inset">
                        UG: {unidade.unidadeHospitalar.ug}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset">
                        {unidade.unidadeHospitalar.cidade}/
                        {unidade.unidadeHospitalar.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {unidade.unidadeHospitalar.endereco}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => iniciarEdicao(unidade.id)}
                    className="text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    disabled={unidadeEmEdicao === unidade.id}
                    aria-label="Editar unidade"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerUnidade(unidade.id)}
                    className="text-red-600 hover:bg-red-100 hover:text-red-700"
                    aria-label="Remover unidade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`valor-alocado-${unidade.id}`}>
                    Valor Alocado
                  </Label>
                  <Input
                    id={`valor-alocado-${unidade.id}`}
                    value={unidade.valorAlocado}
                    onChange={(e) => {
                      const valorMascarado = currencyUtils.aplicarMascara(
                        e.target.value,
                      )
                      atualizarUnidade(
                        unidade.id,
                        'valorAlocado',
                        valorMascarado,
                      )
                    }}
                    placeholder="R$ 0,00"
                    disabled={
                      getCamposTravados(unidade.id).valor &&
                      unidadeEmEdicao !== unidade.id
                    }
                    className={
                      getCamposTravados(unidade.id).valor &&
                      unidadeEmEdicao !== unidade.id
                        ? 'cursor-not-allowed bg-gray-100'
                        : ''
                    }
                  />
                  {getCamposTravados(unidade.id).valor &&
                    unidadeEmEdicao !== unidade.id && (
                      <p className="text-xs text-blue-600">
                        🔒 Campo travado - clique em editar para alterar
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`percentual-${unidade.id}`}>
                    Percentual (%)
                  </Label>
                  <Input
                    id={`percentual-${unidade.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={percentualUtils.formatar(unidade.percentualContrato)}
                    onChange={(e) => {
                      const valor = percentualUtils.normalizarEntrada(
                        e.target.value,
                      )
                      atualizarUnidade(
                        unidade.id,
                        'percentualContrato',
                        percentualUtils.paraNumero(valor),
                      )
                    }}
                    placeholder="0,00"
                    disabled={
                      getCamposTravados(unidade.id).percentual &&
                      unidadeEmEdicao !== unidade.id
                    }
                    className={
                      getCamposTravados(unidade.id).percentual &&
                      unidadeEmEdicao !== unidade.id
                        ? 'cursor-not-allowed bg-gray-100'
                        : ''
                    }
                  />
                  {getCamposTravados(unidade.id).percentual &&
                    unidadeEmEdicao !== unidade.id && (
                      <p className="text-xs text-blue-600">
                        🔒 Campo travado - clique em editar para alterar
                      </p>
                    )}
                </div>
              </div>

              {/* Botões de edição quando em modo de edição */}
              {unidadeEmEdicao === unidade.id && (
                <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => salvarEdicao(unidade.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cancelarEdicao(unidade.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Input
          id="observacoes"
          value={dadosUnidades.observacoes}
          onChange={(e) =>
            setDadosUnidades((prev) => ({
              ...prev,
              observacoes: e.target.value,
            }))
          }
          placeholder="Observações sobre a distribuição das unidades..."
        />
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between border-t pt-6">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          {onPrevious && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
          )}
        </div>
        <Button
          type="submit"
          disabled={!podeFinalizarCadastro()}
          className="bg-slate-700 hover:bg-slate-800 disabled:cursor-not-allowed"
        >
          {!podeFinalizarCadastro() ? (
            <div className="flex items-center gap-2">
              <span>⚠️ Validações não atendidas</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}

export default UnidadesFormMelhorado
