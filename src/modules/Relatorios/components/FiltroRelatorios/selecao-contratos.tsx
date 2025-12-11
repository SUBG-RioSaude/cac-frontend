import { useState, useMemo } from 'react'
import { Search, X, CheckCircle2, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { currencyUtils, dateUtils } from '@/lib/utils'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import { ContratoStatusBadge } from '@/components/ui/status-badge'
import { determinarStatusVigencia } from '../../lib/calculos/indicadores-contrato'

interface SelecaoContratosProps {
  contratos: Contrato[]
  contratosSelecionados: string[]
  onSelecionarContratos: (ids: string[]) => void
  maxContratos?: number
  carregando?: boolean
  desabilitado?: boolean
}

/**
 * Componente de seleção múltipla de contratos
 * Permite busca e seleção de contratos para o relatório
 */
export const SelecaoContratos = ({
  contratos,
  contratosSelecionados,
  onSelecionarContratos,
  maxContratos = 50,
  carregando = false,
  desabilitado = false,
}: SelecaoContratosProps) => {
  const [termoBusca, setTermoBusca] = useState('')

  // Filtrar contratos por termo de busca
  const contratosFiltrados = useMemo(() => {
    if (!termoBusca.trim()) return contratos

    const termo = termoBusca.toLowerCase()
    return contratos.filter(
      (contrato) =>
        contrato.numeroContrato?.toLowerCase().includes(termo) ||
        contrato.objeto?.toLowerCase().includes(termo) ||
        contrato.contratada?.razaoSocial?.toLowerCase().includes(termo) ||
        contrato.contratada?.cnpj?.includes(termo),
    )
  }, [contratos, termoBusca])

  const handleToggleContrato = (contratoId: string) => {
    if (desabilitado) return

    const jaEstaSelecionado = contratosSelecionados.includes(contratoId)

    if (jaEstaSelecionado) {
      // Remover seleção
      onSelecionarContratos(contratosSelecionados.filter((id) => id !== contratoId))
    } else {
      // Adicionar seleção (se não exceder o limite)
      if (contratosSelecionados.length < maxContratos) {
        onSelecionarContratos([...contratosSelecionados, contratoId])
      }
    }
  }

  const handleSelecionarTodos = () => {
    if (desabilitado) return

    const todosIds = contratosFiltrados.slice(0, maxContratos).map((c) => c.id)
    onSelecionarContratos(todosIds)
  }

  const handleLimparSelecao = () => {
    if (desabilitado) return
    onSelecionarContratos([])
  }

  const limiteAtingido = contratosSelecionados.length >= maxContratos

  return (
    <div className="space-y-4">
      {/* Cabeçalho e busca */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Selecione os Contratos</h3>
            <p className="text-muted-foreground text-sm">
              Escolha até {maxContratos} contratos para incluir no relatório
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={limiteAtingido ? 'destructive' : 'secondary'}>
              {contratosSelecionados.length} / {maxContratos}
            </Badge>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por número, objeto, contratada ou CNPJ..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-9"
            disabled={desabilitado}
          />
          {termoBusca && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
              onClick={() => setTermoBusca('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Ações em massa */}
        {contratos.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelecionarTodos}
              disabled={desabilitado || limiteAtingido}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Selecionar todos ({Math.min(contratosFiltrados.length, maxContratos)})
            </Button>
            {contratosSelecionados.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLimparSelecao}
                disabled={desabilitado}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar seleção
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Alerta de limite */}
      {limiteAtingido && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Limite máximo de {maxContratos} contratos atingido. Remova alguns para adicionar
            outros.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de contratos */}
      {carregando ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Carregando contratos...</p>
        </div>
      ) : contratosFiltrados.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">Nenhum contrato encontrado</p>
            {termoBusca && (
              <p className="text-muted-foreground mt-1 text-sm">
                Tente ajustar os termos de busca
              </p>
            )}
          </div>
        </div>
      ) : (
        <ScrollArea className="h-96 rounded-lg border">
          <div className="divide-y">
            {contratosFiltrados.map((contrato) => {
              const selecionado = contratosSelecionados.includes(contrato.id)
              // Calcula status sem usar hook dentro do loop
              const status = determinarStatusVigencia(contrato.vigenciaFinal)

              return (
                <div
                  key={contrato.id}
                  className={cn(
                    'flex items-start gap-3 p-4 transition-colors hover:bg-muted/50',
                    selecionado && 'bg-muted/30',
                    desabilitado && 'opacity-50',
                  )}
                >
                  <Checkbox
                    checked={selecionado}
                    onCheckedChange={() => handleToggleContrato(contrato.id)}
                    disabled={desabilitado || (!selecionado && limiteAtingido)}
                    className="mt-1"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleToggleContrato(contrato.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleToggleContrato(contrato.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{contrato.numeroContrato}</p>
                          <ContratoStatusBadge status={status} size="sm" />
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2">
                          {contrato.objeto || contrato.descricaoObjeto}
                        </p>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span>{contrato.contratada?.razaoSocial}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>
                            {currencyUtils.formatar(contrato.valorGlobal || contrato.valorGlobalOriginal || 0)}
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>
                            Vigência:{' '}
                            {dateUtils.formatarDataUTC(contrato.vigenciaInicial || '')} -{' '}
                            {dateUtils.formatarDataUTC(contrato.vigenciaFinal || '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Resumo */}
      {contratosSelecionados.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">
            <span className="font-medium">{contratosSelecionados.length}</span>{' '}
            {contratosSelecionados.length === 1 ? 'contrato selecionado' : 'contratos selecionados'}
          </p>
        </div>
      )}
    </div>
  )
}
