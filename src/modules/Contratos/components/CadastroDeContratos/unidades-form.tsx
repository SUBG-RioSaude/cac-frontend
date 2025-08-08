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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Building2 } from 'lucide-react'
import { useState } from 'react'

interface Unidade {
  id: string
  nome: string
  codigo: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  responsavel: string
  telefone: string
  email: string
  ativa: boolean
  valorAlocado: string
  percentualContrato: number
}

export interface DadosUnidades {
  unidades: Unidade[]
  observacoes: string
  distribuicaoAutomatica: boolean
}

interface UnidadesFormProps {
  onSubmit: (dados: DadosUnidades) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosUnidades>
  valorTotalContrato?: number
  onFinishRequest?: (dados: DadosUnidades) => void
}

export default function UnidadesForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  valorTotalContrato = 0,
  onFinishRequest,
}: UnidadesFormProps) {
  const [dadosUnidades, setDadosUnidades] = useState<DadosUnidades>({
    unidades: [],
    observacoes: '',
    distribuicaoAutomatica: false,
    ...dadosIniciais,
  })

  const adicionarUnidade = () => {
    const novaUnidade: Unidade = {
      id: Date.now().toString(),
      nome: '',
      codigo: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      responsavel: '',
      telefone: '',
      email: '',
      ativa: true,
      valorAlocado: '0',
      percentualContrato: 0,
    }
    setDadosUnidades((prev) => ({
      ...prev,
      unidades: [...prev.unidades, novaUnidade],
    }))
  }

  const removerUnidade = (id: string) => {
    setDadosUnidades((prev) => ({
      ...prev,
      unidades: prev.unidades.filter((unidade) => unidade.id !== id),
    }))
  }

  const atualizarUnidade = (
    id: string,
    campo: keyof Unidade,
    valor: string | number | boolean,
  ) => {
    setDadosUnidades((prev) => ({
      ...prev,
      unidades: prev.unidades.map((unidade) => {
        if (unidade.id === id) {
          const unidadeAtualizada = { ...unidade, [campo]: valor }

          // Calcular percentual quando valor é alterado
          if (campo === 'valorAlocado' && valorTotalContrato > 0) {
            const valorNum = parseFloat(valor as string) || 0
            unidadeAtualizada.percentualContrato =
              (valorNum / valorTotalContrato) * 100
          }

          // Calcular valor quando percentual é alterado
          if (campo === 'percentualContrato' && valorTotalContrato > 0) {
            const percentualNum = parseFloat(valor as string) || 0
            unidadeAtualizada.valorAlocado = (
              (percentualNum / 100) *
              valorTotalContrato
            ).toFixed(2)
          }

          return unidadeAtualizada
        }
        return unidade
      }),
    }))
  }

  const distribuirAutomaticamente = () => {
    if (dadosUnidades.unidades.length === 0) return

    const unidadesAtivas = dadosUnidades.unidades.filter((u) => u.ativa)
    if (unidadesAtivas.length === 0) return

    const valorPorUnidade = valorTotalContrato / unidadesAtivas.length
    const percentualPorUnidade = 100 / unidadesAtivas.length

    setDadosUnidades((prev) => ({
      ...prev,
      unidades: prev.unidades.map((unidade) => ({
        ...unidade,
        valorAlocado: unidade.ativa ? valorPorUnidade.toFixed(2) : '0',
        percentualContrato: unidade.ativa ? percentualPorUnidade : 0,
      })),
    }))
  }

  const calcularTotalAlocado = () => {
    return dadosUnidades.unidades.reduce((total, unidade) => {
      return total + (parseFloat(unidade.valorAlocado) || 0)
    }, 0)
  }

  const calcularTotalPercentual = () => {
    return dadosUnidades.unidades.reduce((total, unidade) => {
      return total + (unidade.percentualContrato || 0)
    }, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onFinishRequest) {
      onFinishRequest(dadosUnidades)
    } else {
      onSubmit(dadosUnidades)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Unidades Contempladas</h3>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={distribuirAutomaticamente}
            disabled={dadosUnidades.unidades.length === 0}
          >
            Distribuir Automaticamente
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={adicionarUnidade}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Unidade
          </Button>
        </div>
      </div>

      {valorTotalContrato > 0 && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Valor Total do Contrato:</span>
              <p className="text-blue-700">
                R${' '}
                {valorTotalContrato.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="font-medium">Total Alocado:</span>
              <p className="text-blue-700">
                R${' '}
                {calcularTotalAlocado().toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <span className="font-medium">Percentual Total:</span>
              <p className="text-blue-700">
                {calcularTotalPercentual().toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {dadosUnidades.unidades.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma unidade adicionada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece adicionando a primeira unidade que será contemplada no
            contrato.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dadosUnidades.unidades.map((unidade, index) => (
            <div key={unidade.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Unidade {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerUnidade(unidade.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nome da Unidade *</Label>
                  <Input
                    value={unidade.nome}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'nome', e.target.value)
                    }
                    placeholder="Ex: Unidade Centro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={unidade.codigo}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'codigo', e.target.value)
                    }
                    placeholder="Ex: UC-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={unidade.cep}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'cep', e.target.value)
                    }
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={unidade.endereco}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'endereco', e.target.value)
                    }
                    placeholder="Digite o endereço completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={unidade.cidade}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'cidade', e.target.value)
                    }
                    placeholder="Digite a cidade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={unidade.estado}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'estado', e.target.value)
                    }
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input
                    value={unidade.responsavel}
                    onChange={(e) =>
                      atualizarUnidade(
                        unidade.id,
                        'responsavel',
                        e.target.value,
                      )
                    }
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={unidade.telefone}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'telefone', e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={unidade.email}
                    onChange={(e) =>
                      atualizarUnidade(unidade.id, 'email', e.target.value)
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Alocado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={unidade.valorAlocado}
                    onChange={(e) =>
                      atualizarUnidade(
                        unidade.id,
                        'valorAlocado',
                        e.target.value,
                      )
                    }
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentual (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={unidade.percentualContrato}
                    onChange={(e) =>
                      atualizarUnidade(
                        unidade.id,
                        'percentualContrato',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`ativa-${unidade.id}`}
                  checked={unidade.ativa}
                  onCheckedChange={(checked) =>
                    atualizarUnidade(unidade.id, 'ativa', checked)
                  }
                />
                <Label htmlFor={`ativa-${unidade.id}`}>Unidade ativa</Label>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="space-y-4">
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="distribuicao-automatica"
            checked={dadosUnidades.distribuicaoAutomatica}
            onCheckedChange={(checked) =>
              setDadosUnidades((prev) => ({
                ...prev,
                distribuicaoAutomatica: !!checked,
              }))
            }
          />
          <Label htmlFor="distribuicao-automatica">
            Permitir redistribuição automática em futuras alterações
          </Label>
        </div>
      </div>

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
        <Button type="submit">Finalizar Cadastro</Button>
      </div>
    </form>
  )
}
