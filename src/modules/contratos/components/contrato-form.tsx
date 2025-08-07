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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

export interface DadosContrato {
  numeroContrato: string
  tipoContrato: 'Compra' | 'Prestacao_Servico' | 'Fornecimento' | 'Manutencao'
  objeto: string
  descricao: string
  valorTotal: string
  dataInicio: string
  dataFim: string
  vigencia: number
  renovacaoAutomatica: boolean
  observacoes: string
  ativo: boolean
}

interface ContratoFormProps {
  onSubmit: (dados: DadosContrato) => void
  onCancel?: () => void
  onPrevious?: () => void
  dadosIniciais?: Partial<DadosContrato>
  onAdvanceRequest?: (dados: DadosContrato) => void
}

export default function ContratoForm({
  onSubmit,
  onCancel,
  onPrevious,
  dadosIniciais = {},
  onAdvanceRequest,
}: ContratoFormProps) {
  const [dadosContrato, setDadosContrato] = useState<DadosContrato>({
    numeroContrato: '',
    tipoContrato: 'Compra',
    objeto: '',
    descricao: '',
    valorTotal: '',
    dataInicio: '',
    dataFim: '',
    vigencia: 12,
    renovacaoAutomatica: false,
    observacoes: '',
    ativo: true,
    ...dadosIniciais,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onAdvanceRequest) {
      onAdvanceRequest(dadosContrato)
    } else {
      onSubmit(dadosContrato)
    }
  }

  const calcularDataFim = (dataInicio: string, vigenciaMeses: number) => {
    if (!dataInicio) return ''

    const data = new Date(dataInicio)
    data.setMonth(data.getMonth() + vigenciaMeses)
    return data.toISOString().split('T')[0]
  }

  const handleDataInicioChange = (value: string) => {
    setDadosContrato((prev) => ({
      ...prev,
      dataInicio: value,
      dataFim: calcularDataFim(value, prev.vigencia),
    }))
  }

  const handleVigenciaChange = (value: number) => {
    setDadosContrato((prev) => ({
      ...prev,
      vigencia: value,
      dataFim: calcularDataFim(prev.dataInicio, value),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numeroContrato">Número do Contrato *</Label>
          <Input
            id="numeroContrato"
            value={dadosContrato.numeroContrato}
            onChange={(e) =>
              setDadosContrato((prev) => ({
                ...prev,
                numeroContrato: e.target.value,
              }))
            }
            placeholder="Ex: CONT-2024-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoContrato">Tipo de Contrato *</Label>
          <Select
            value={dadosContrato.tipoContrato}
            onValueChange={(value) =>
              setDadosContrato((prev) => ({
                ...prev,
                tipoContrato: value as DadosContrato['tipoContrato'],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Compra">Compra</SelectItem>
              <SelectItem value="Prestacao_Servico">
                Prestação de Serviço
              </SelectItem>
              <SelectItem value="Fornecimento">Fornecimento</SelectItem>
              <SelectItem value="Manutencao">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objeto">Objeto do Contrato *</Label>
        <Input
          id="objeto"
          value={dadosContrato.objeto}
          onChange={(e) =>
            setDadosContrato((prev) => ({
              ...prev,
              objeto: e.target.value,
            }))
          }
          placeholder="Ex: Fornecimento de materiais de escritório"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={dadosContrato.descricao}
          onChange={(e) =>
            setDadosContrato((prev) => ({
              ...prev,
              descricao: e.target.value,
            }))
          }
          placeholder="Descrição detalhada do contrato..."
          rows={4}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Valores e Prazos</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              value={dadosContrato.valorTotal}
              onChange={(e) =>
                setDadosContrato((prev) => ({
                  ...prev,
                  valorTotal: e.target.value,
                }))
              }
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vigencia">Vigência (meses) *</Label>
            <Input
              id="vigencia"
              type="number"
              min="1"
              max="60"
              value={dadosContrato.vigencia}
              onChange={(e) =>
                handleVigenciaChange(parseInt(e.target.value) || 12)
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dadosContrato.dataInicio}
              onChange={(e) => handleDataInicioChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data de Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={dadosContrato.dataFim}
              onChange={(e) =>
                setDadosContrato((prev) => ({
                  ...prev,
                  dataFim: e.target.value,
                }))
              }
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="renovacao-automatica"
            checked={dadosContrato.renovacaoAutomatica}
            onCheckedChange={(checked) =>
              setDadosContrato((prev) => ({
                ...prev,
                renovacaoAutomatica: !!checked,
              }))
            }
          />
          <Label htmlFor="renovacao-automatica">Renovação automática</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={dadosContrato.observacoes}
            onChange={(e) =>
              setDadosContrato((prev) => ({
                ...prev,
                observacoes: e.target.value,
              }))
            }
            placeholder="Observações adicionais sobre o contrato..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="contrato-ativo"
            checked={dadosContrato.ativo}
            onCheckedChange={(checked) =>
              setDadosContrato((prev) => ({ ...prev, ativo: !!checked }))
            }
          />
          <Label htmlFor="contrato-ativo">Contrato ativo</Label>
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
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  )
}
