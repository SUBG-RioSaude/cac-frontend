import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Search, X, RotateCcw } from 'lucide-react'

import type { DocumentoContrato, FiltroDocumento, StatusDocumento } from '@/modules/Contratos/types/contrato'
import { TIPOS_DOCUMENTO } from '@/modules/Contratos/types/contrato'

interface FiltroDocumentosProps {
  filtro: FiltroDocumento
  onFiltroChange: (filtro: FiltroDocumento) => void
  documentos: DocumentoContrato[]
  className?: string
}

const statusOptions: { value: StatusDocumento | 'todos', label: string, color?: string }[] = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'conferido', label: 'Conferidos', color: 'green' },
  { value: 'pendente', label: 'Pendentes', color: 'amber' },
  { value: 'em_analise', label: 'Em Análise', color: 'blue' },
  { value: 'com_pendencia', label: 'Com Pendência', color: 'red' },
  { value: 'rejeitado', label: 'Rejeitados', color: 'gray' }
]

const categoriaOptions = [
  { value: 'todos', label: 'Todas as Categorias' },
  { value: 'obrigatorio', label: 'Obrigatórios' },
  { value: 'opcional', label: 'Opcionais' }
]

export function FiltroDocumentos({ 
  filtro, 
  onFiltroChange, 
  documentos,
  className 
}: FiltroDocumentosProps) {
  
  const tiposUsados = Array.from(
    new Set(documentos.map(d => d.tipo.id))
  ).map(tipoId => 
    TIPOS_DOCUMENTO.find(t => t.id === tipoId)
  ).filter(Boolean)

  const limparFiltros = () => {
    onFiltroChange({
      categoria: 'todos',
      status: 'todos',
      tipo: 'todos',
      busca: ''
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
    filtro.busca ? 1 : 0
  ].reduce((acc, curr) => acc + curr, 0)

  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
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
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Busca por texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição, tipo ou responsável..."
            value={filtro.busca || ''}
            onChange={(e) => onFiltroChange({ ...filtro, busca: e.target.value })}
            className="pl-10 pr-10"
          />
          {filtro.busca && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltroChange({ ...filtro, busca: '' })}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filtros em linha */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Filtro por categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={filtro.categoria || 'todos'}
              onValueChange={(value) => onFiltroChange({ 
                ...filtro, 
                categoria: value as 'obrigatorio' | 'opcional' | 'todos' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriaOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filtro.status || 'todos'}
              onValueChange={(value) => onFiltroChange({ 
                ...filtro, 
                status: value as StatusDocumento | 'todos' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          option.color === 'green' && 'bg-green-500',
                          option.color === 'amber' && 'bg-amber-500',
                          option.color === 'blue' && 'bg-blue-500',
                          option.color === 'red' && 'bg-red-500',
                          option.color === 'gray' && 'bg-gray-500'
                        )} />
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
            <label className="text-sm font-medium">Tipo de Documento</label>
            <Select
              value={filtro.tipo || 'todos'}
              onValueChange={(value) => onFiltroChange({ 
                ...filtro, 
                tipo: value 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                {tiposUsados.map(tipo => tipo && (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        `bg-${tipo.cor}-500`
                      )} />
                      {tipo.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros rápidos por status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filtros Rápidos</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.slice(1).map(option => {
              const isActive = filtro.status === option.value
              const count = documentos.filter(d => d.status === option.value).length
              
              if (count === 0) return null

              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFiltroChange({ 
                    ...filtro, 
                    status: isActive ? 'todos' : option.value as StatusDocumento 
                  })}
                  className={cn(
                    'text-xs h-8',
                    !isActive && option.color === 'green' && 'border-green-200 text-green-700 hover:bg-green-50',
                    !isActive && option.color === 'amber' && 'border-amber-200 text-amber-700 hover:bg-amber-50',
                    !isActive && option.color === 'blue' && 'border-blue-200 text-blue-700 hover:bg-blue-50',
                    !isActive && option.color === 'red' && 'border-red-200 text-red-700 hover:bg-red-50'
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