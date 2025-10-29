/**
 * ==========================================
 * COMPONENTE DE BUSCA DE FUNCIONÁRIO
 * ==========================================
 * Campo de busca com autocomplete para seleção de funcionários
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  User,
  Building,
  Hash,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useBuscarFuncionariosPorNome } from '@/modules/Funcionarios/hooks/use-funcionarios'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

// ========== INTERFACES ==========

interface BuscaFuncionarioFieldProps {
  label?: string
  placeholder?: string
  funcionarioSelecionado?: FuncionarioApi | null
  funcionariosExcluidos?: string[] // IDs de funcionários que não devem aparecer nos resultados
  onSelecionarFuncionario: (funcionario: FuncionarioApi) => void
  onLimparSelecao?: () => void
  disabled?: boolean
  required?: boolean
  className?: string
}

// ========== COMPONENTE ==========

export const BuscaFuncionarioField = ({
  label = 'Buscar funcionário',
  placeholder = 'Digite o nome do funcionário...',
  funcionarioSelecionado,
  funcionariosExcluidos = [],
  onSelecionarFuncionario,
  onLimparSelecao,
  disabled = false,
  required = false,
  className,
}: BuscaFuncionarioFieldProps) => {
  const [termoBusca, setTermoBusca] = useState('')
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [focoNoInput, setFocoNoInput] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hook para buscar funcionários
  const {
    data: funcionarios = [],
    isLoading,
    error,
  } = useBuscarFuncionariosPorNome(termoBusca, 10, {
    enabled: termoBusca.length >= 2 && !funcionarioSelecionado,
  })

  // Filtrar funcionários excluídos
  const funcionariosFiltrados = funcionarios.filter(
    (func) => !funcionariosExcluidos.includes(func.id),
  )

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMostrarResultados(false)
        setFocoNoInput(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Limpar busca quando funcionário é selecionado
  useEffect(() => {
    if (funcionarioSelecionado) {
      setTermoBusca('')
      setMostrarResultados(false)
    }
  }, [funcionarioSelecionado])

  // Handlers
  const handleInputChange = (valor: string) => {
    setTermoBusca(valor)
    setMostrarResultados(valor.length >= 2)
  }

  const handleSelecionarFuncionario = (funcionario: FuncionarioApi) => {
    onSelecionarFuncionario(funcionario)
    setMostrarResultados(false)
    setFocoNoInput(false)
  }

  const handleLimparSelecao = () => {
    if (onLimparSelecao) {
      onLimparSelecao()
    }
    setTermoBusca('')
    setMostrarResultados(false)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setFocoNoInput(true)
    if (termoBusca.length >= 2) {
      setMostrarResultados(true)
    }
  }

  // Renderizar funcionário selecionado
  if (funcionarioSelecionado) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
        )}

        <div className="relative">
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold">
                  {funcionarioSelecionado.nomeCompleto}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {funcionarioSelecionado.cargo}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  {funcionarioSelecionado.matricula && (
                    <Badge variant="outline" className="text-xs">
                      <Hash className="mr-1 h-3 w-3" />
                      {funcionarioSelecionado.matricula}
                    </Badge>
                  )}

                  {funcionarioSelecionado.lotacaoSigla && (
                    <Badge variant="outline" className="text-xs">
                      <Building className="mr-1 h-3 w-3" />
                      {funcionarioSelecionado.lotacaoSigla}
                    </Badge>
                  )}

                  {/* Status ativo/inativo */}
                  <Badge
                    variant={
                      funcionarioSelecionado.ativo ? 'default' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {funcionarioSelecionado.ativo ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {funcionarioSelecionado.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>

            {!disabled && onLimparSelecao && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLimparSelecao}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Renderizar campo de busca
  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={termoBusca}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            disabled={disabled}
            className={cn(
              'pl-10',
              focoNoInput && 'border-blue-300 ring-2 ring-blue-200',
            )}
          />
        </div>

        {/* Dropdown de resultados */}
        <AnimatePresence>
          {mostrarResultados && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
            >
              {isLoading && (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600">
                  Erro ao buscar funcionários
                </div>
              )}

              {!isLoading &&
                !error &&
                funcionariosFiltrados.length === 0 &&
                termoBusca.length >= 2 && (
                  <div className="text-muted-foreground p-3 text-sm">
                    Nenhum funcionário encontrado para "{termoBusca}"
                  </div>
                )}

              {funcionariosFiltrados.map((funcionario) => (
                <button
                  key={funcionario.id}
                  type="button"
                  onClick={() => handleSelecionarFuncionario(funcionario)}
                  className="w-full border-b p-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium">
                        {funcionario.nomeCompleto}
                      </h4>
                      <p className="text-muted-foreground truncate text-xs">
                        {funcionario.cargo}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {funcionario.matricula && (
                          <span className="text-muted-foreground text-xs">
                            Mat: {funcionario.matricula}
                          </span>
                        )}

                        {funcionario.lotacaoSigla && (
                          <span className="text-muted-foreground text-xs">
                            • {funcionario.lotacaoSigla}
                          </span>
                        )}

                        {!funcionario.ativo && (
                          <Badge variant="destructive" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Texto de ajuda */}
      <p className="text-muted-foreground text-xs">
        {termoBusca.length < 2
          ? 'Digite pelo menos 2 caracteres para buscar'
          : funcionariosFiltrados.length > 0
            ? `${funcionariosFiltrados.length} funcionário(s) encontrado(s)`
            : ''}
      </p>
    </div>
  )
}
