import { Search, X, RotateCcw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  DocumentoContrato,
  FiltroDocumento,
  StatusDocumento,
} from '@/modules/Contratos/types/contrato'
import { TIPOS_DOCUMENTO } from '@/modules/Contratos/types/contrato'

interface FiltroDocumentosProps {
  filtro: FiltroDocumento
  onFiltroChange: (filtro: FiltroDocumento) => void
  documentos: DocumentoContrato[]
  className?: string
}

const statusOptions: {
  value: StatusDocumento | 'todos'
  label: string
  color?: string
}[] = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'conferido', label: 'Conferidos', color: 'green' },
  { value: 'pendente', label: 'Pendentes', color: 'amber' },
  { value: 'em_analise', label: 'Em Análise', color: 'blue' },
  { value: 'com_pendencia', label: 'Com Pendência', color: 'red' },
  { value: 'rejeitado', label: 'Rejeitados', color: 'gray' },
]

const categoriaOptions = [
  { value: 'todos', label: 'Todas as Categorias' },
  { value: 'obrigatorio', label: 'Obrigatórios' },
  { value: 'opcional', label: 'Opcionais' },
]

export const FiltroDocumentos = ({
  filtro,
  onFiltroChange,
  documentos,
  className,
}: FiltroDocumentosProps) => {
  const tiposUsados = Array.from(new Set(documentos.map((d) => d.tipo.id)))
    .map((tipoId) => TIPOS_DOCUMENTO.find((t) => t.id === tipoId))
    .filter(Boolean)

  const limparFiltros = () => {
    onFiltroChange({
      categoria: 'todos',
      status: 'todos',
      tipo: 'todos',
      busca: '',
    })
  }

  const temFiltrosAtivos =
    filtro.categoria !== 'todos' ||
    filtro.status !== 'todos' ||
    filtro.tipo !== 'todos' ||
    !!filtro.busca

  const contadorFiltros = [
    filtro.categoria !== 'todos' ? 1 : 0,
    filtro.status !== 'todos' ? 1 : 0,
    filtro.tipo !== 'todos' ? 1 : 0,
    filtro.busca ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0)

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Filtrar Documentos
            {contadorFiltros > 0 && (
              <Badge variant="secondary" className="text-xs">
                {contadorFiltros} filtro{contadorFiltros !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>

          {temFiltrosAtivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Buscar por nome, descrição, tipo ou responsável..."
            value={filtro.busca ?? ''}
            onChange={(e) =>
              onFiltroChange({ ...filtro, busca: e.target.value })
            }
            className="pr-10 pl-10"
          />
          {filtro.busca && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltroChange({ ...filtro, busca: '' })}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filtros em linha */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Filtro por categoria */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="categoria-select">Categoria</Label>
            <Select
              value={filtro.categoria ?? 'todos'}
              onValueChange={(value) =>
                onFiltroChange({
                  ...filtro,
                  categoria: value as 'obrigatorio' | 'opcional' | 'todos',
                })
              }
            >
              <SelectTrigger id="categoria-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="status-select">Status</Label>
            <Select
              value={filtro.status ?? 'todos'}
              onValueChange={(value) =>
                onFiltroChange({
                  ...filtro,
                  status: value as StatusDocumento | 'todos',
                })
              }
            >
              <SelectTrigger id="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            option.color === 'green' && 'bg-green-500',
                            option.color === 'amber' && 'bg-amber-500',
                            option.color === 'blue' && 'bg-blue-500',
                            option.color === 'red' && 'bg-red-500',
                            option.color === 'gray' && 'bg-gray-500',
                          )}
                        />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por tipo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="tipo-select">Tipo de Documento</Label>
            <Select
              value={filtro.tipo ?? 'todos'}
              onValueChange={(value) =>
                onFiltroChange({
                  ...filtro,
                  tipo: value,
                })
              }
            >
              <SelectTrigger id="tipo-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                {tiposUsados.map(
                  (tipo) =>
                    tipo && (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              `bg-${tipo.cor}-500`,
                            )}
                          />
                          {tipo.nome}
                        </div>
                      </SelectItem>
                    ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros rápidos por status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtros Rápidos</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.slice(1).map((option) => {
              const isActive = filtro.status === option.value
              const count = documentos.filter(
                (d) => d.status === option.value,
              ).length

              if (count === 0) return null

              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    onFiltroChange({
                      ...filtro,
                      status: isActive
                        ? 'todos'
                        : (option.value as StatusDocumento),
                    })
                  }
                  className={cn(
                    'h-8 text-xs',
                    !isActive &&
                      option.color === 'green' &&
                      'border-green-200 text-green-700 hover:bg-green-50',
                    !isActive &&
                      option.color === 'amber' &&
                      'border-amber-200 text-amber-700 hover:bg-amber-50',
                    !isActive &&
                      option.color === 'blue' &&
                      'border-blue-200 text-blue-700 hover:bg-blue-50',
                    !isActive &&
                      option.color === 'red' &&
                      'border-red-200 text-red-700 hover:bg-red-50',
                  )}
                >
                  {option.label} ({count})
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
