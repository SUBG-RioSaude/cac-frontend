/**
 * ==========================================
 * COMPONENTE: FILTRO-HISTORICO
 * ==========================================
 * Filtros colapsáveis para histórico de relatórios
 */

import { useState } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { FiltrosHistorico, TipoRelatorio } from '../../types/historico'
import { CONFIGURACAO_TIPOS_RELATORIO } from '../../config/relatorios-config'

// ========== TIPOS ==========

interface FiltroHistoricoProps {
  filtros: FiltrosHistorico
  onFiltrosChange: (filtros: FiltrosHistorico) => void
  totalResultados?: number
}

type OrdenacaoOpcao =
  | 'data-desc'
  | 'data-asc'
  | 'nome-asc'
  | 'nome-desc'
  | 'tamanho-desc'
  | 'tamanho-asc'

// ========== COMPONENTE ==========

export const FiltroHistorico = ({
  filtros,
  onFiltrosChange,
  totalResultados = 0,
}: FiltroHistoricoProps) => {
  const [expandido, setExpandido] = useState(false)

  // ========== HANDLERS ==========

  const handleTermoPesquisaChange = (termo: string) => {
    onFiltrosChange({
      ...filtros,
      termoPesquisa: termo || undefined,
    })
  }

  const handleTipoToggle = (tipo: TipoRelatorio) => {
    const tiposAtuais = filtros.tipo || []
    const jaExiste = tiposAtuais.includes(tipo)

    const novosTipos = jaExiste
      ? tiposAtuais.filter((t) => t !== tipo)
      : [...tiposAtuais, tipo]

    onFiltrosChange({
      ...filtros,
      tipo: novosTipos.length > 0 ? novosTipos : undefined,
    })
  }

  const handleDataInicialChange = (data: string) => {
    onFiltrosChange({
      ...filtros,
      dataInicial: data || undefined,
    })
  }

  const handleDataFinalChange = (data: string) => {
    onFiltrosChange({
      ...filtros,
      dataFinal: data || undefined,
    })
  }

  const handleOrdenacaoChange = (ordenacao: OrdenacaoOpcao) => {
    onFiltrosChange({
      ...filtros,
      ordenacao: ordenacao as any,
    })
  }

  const handleLimparFiltros = () => {
    onFiltrosChange({})
  }

  const temFiltrosAtivos =
    !!filtros.termoPesquisa ||
    (filtros.tipo && filtros.tipo.length > 0) ||
    !!filtros.dataInicial ||
    !!filtros.dataFinal

  // ========== TIPOS DISPONÍVEIS ==========

  const tiposDisponiveis: { value: TipoRelatorio; label: string }[] = [
    { value: 'execucao', label: CONFIGURACAO_TIPOS_RELATORIO.execucao.nome },
    { value: 'desempenho', label: CONFIGURACAO_TIPOS_RELATORIO.desempenho.nome },
    {
      value: 'formalizacao',
      label: CONFIGURACAO_TIPOS_RELATORIO.formalizacao.nome,
    },
    {
      value: 'prorrogacao',
      label: CONFIGURACAO_TIPOS_RELATORIO.prorrogacao.nome,
    },
    {
      value: 'encerramento',
      label: CONFIGURACAO_TIPOS_RELATORIO.encerramento.nome,
    },
  ]

  // ========== RENDER ==========

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Cabeçalho e busca */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-muted-foreground h-5 w-5" />
                <h3 className="font-semibold">Filtros</h3>
                {temFiltrosAtivos && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                    Ativos
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {totalResultados > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandido(!expandido)}
                >
                  {expandido ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Barra de busca sempre visível */}
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nome do arquivo ou número do contrato..."
                value={filtros.termoPesquisa || ''}
                onChange={(e) => handleTermoPesquisaChange(e.target.value)}
                className="pl-9"
              />
              {filtros.termoPesquisa && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
                  onClick={() => handleTermoPesquisaChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filtros avançados (colapsável) */}
          {expandido && (
            <>
              <Separator />

              <div className="space-y-4">
                {/* Tipo de Relatório */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Relatório</Label>
                  <div className="space-y-2">
                    {tiposDisponiveis.map((tipo) => (
                      <div key={tipo.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tipo-${tipo.value}`}
                          checked={filtros.tipo?.includes(tipo.value) || false}
                          onCheckedChange={() => handleTipoToggle(tipo.value)}
                        />
                        <Label
                          htmlFor={`tipo-${tipo.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tipo.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Período */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Período de Geração</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="data-inicial" className="text-xs text-muted-foreground">
                        Data Inicial
                      </Label>
                      <Input
                        id="data-inicial"
                        type="date"
                        value={filtros.dataInicial || ''}
                        onChange={(e) => handleDataInicialChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="data-final" className="text-xs text-muted-foreground">
                        Data Final
                      </Label>
                      <Input
                        id="data-final"
                        type="date"
                        value={filtros.dataFinal || ''}
                        onChange={(e) => handleDataFinalChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ordenação */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ordenar Por</Label>
                  <Select
                    value={filtros.ordenacao || 'data-desc'}
                    onValueChange={(value) => handleOrdenacaoChange(value as OrdenacaoOpcao)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a ordenação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data-desc">Mais recentes primeiro</SelectItem>
                      <SelectItem value="data-asc">Mais antigos primeiro</SelectItem>
                      <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
                      <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
                      <SelectItem value="tamanho-desc">Maior tamanho</SelectItem>
                      <SelectItem value="tamanho-asc">Menor tamanho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botão limpar filtros */}
                {temFiltrosAtivos && (
                  <>
                    <Separator />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLimparFiltros}
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Limpar Filtros
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
