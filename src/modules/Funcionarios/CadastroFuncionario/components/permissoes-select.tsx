import { useState, useEffect } from 'react'
import { Check, Info } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermissoesQuery } from '@/lib/auth/permissoes-queries'
import { cn } from '@/lib/utils'

interface PermissoesSelectProps {
  value: number[]
  onChange: (permissoes: number[]) => void
  error?: string
}

export const PermissoesSelect = ({ value, onChange, error }: PermissoesSelectProps) => {
  const { data: permissoes, isLoading, error: queryError } = usePermissoesQuery()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(value))

  // Sincroniza selectedIds com value externo
  useEffect(() => {
    setSelectedIds(new Set(value))
  }, [value])

  const handleToggle = (permissaoId: number) => {
    const newSelected = new Set(selectedIds)

    if (newSelected.has(permissaoId)) {
      newSelected.delete(permissaoId)
    } else {
      newSelected.add(permissaoId)
    }

    setSelectedIds(newSelected)
    onChange(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    if (!permissoes) return

    if (selectedIds.size === permissoes.length) {
      // Desselecionar todos
      setSelectedIds(new Set())
      onChange([])
    } else {
      // Selecionar todos
      const allIds = new Set(permissoes.map((p) => p.id))
      setSelectedIds(allIds)
      onChange(Array.from(allIds))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissões do Sistema</CardTitle>
          <CardDescription>Carregando permissões disponíveis...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (queryError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao carregar permissões</CardTitle>
          <CardDescription>
            {queryError instanceof Error ? queryError.message : 'Erro desconhecido'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!permissoes || permissoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissões do Sistema</CardTitle>
          <CardDescription>Nenhuma permissão disponível</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const allSelected = selectedIds.size === permissoes.length

  return (
    <Card className={cn(error && 'border-destructive')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Permissões do Sistema</CardTitle>
            <CardDescription>
              Selecione as permissões que o usuário terá neste sistema
            </CardDescription>
          </div>
          {permissoes.length > 1 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-primary hover:underline"
            >
              {allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {permissoes.map((permissao) => {
            const isSelected = selectedIds.has(permissao.id)

            return (
              <div
                key={permissao.id}
                className={cn(
                  'flex items-start space-x-3 rounded-lg border p-3 transition-colors',
                  isSelected && 'border-primary bg-primary/5',
                  !isSelected && 'border-border hover:bg-accent',
                )}
              >
                <Checkbox
                  id={`permissao-${permissao.id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(permissao.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`permissao-${permissao.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {permissao.nome}
                    </Label>
                    {isSelected && <Check className="size-4 text-primary" />}
                  </div>
                  {permissao.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {permissao.descricao}
                    </p>
                  )}
                </div>
                {permissao.descricao && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{permissao.descricao}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )
          })}
        </div>

        {/* Contador de selecionadas */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} de {permissoes.length}{' '}
            {selectedIds.size === 1 ? 'permissão selecionada' : 'permissões selecionadas'}
          </span>
          {selectedIds.size > 0 && (
            <span className="text-sm font-medium text-primary">
              {Array.from(selectedIds)
                .map((id) => permissoes.find((p) => p.id === id)?.nome)
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
