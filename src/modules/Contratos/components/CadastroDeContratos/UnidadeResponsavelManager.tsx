import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { 
  Plus, 
  Building, 
  Users,
  AlertTriangle 
} from 'lucide-react'
import { cn, normalizeText } from '@/lib/utils'
import { useBuscarUnidades, useUnidadesByIds } from '@/modules/Unidades/hooks/use-unidades'
import { UnidadeResponsavelItem } from './UnidadeResponsavelItem'
import type { CriarUnidadeResponsavelPayload } from '@/modules/Contratos/types/contrato'

interface UnidadeResponsavelManagerProps {
  unidades: CriarUnidadeResponsavelPayload[]
  onChange: (unidades: CriarUnidadeResponsavelPayload[]) => void
  className?: string
}

type UnidadeComNome = CriarUnidadeResponsavelPayload & {
  unidadeSaudeNome: string
}

export function UnidadeResponsavelManager({ 
  unidades, 
  onChange,
  className 
}: UnidadeResponsavelManagerProps) {
  const [openDemandante, setOpenDemandante] = useState(false)
  const [openGestora, setOpenGestora] = useState(false)
  
  // Estados de busca
  const [searchDemandante, setSearchDemandante] = useState('')
  const [submittedDemandante, setSubmittedDemandante] = useState('')
  const [searchGestora, setSearchGestora] = useState('')
  const [submittedGestora, setSubmittedGestora] = useState('')
  
  // Buscar unidades demandantes apenas quando hÃ¡ termo de busca
  const { 
    data: unidadesDemandantes, 
    isLoading: loadingDemandantes, 
    error: errorDemandantes 
  } = useBuscarUnidades(submittedDemandante, {
    enabled: submittedDemandante.trim().length >= 2
  })
  
  // Buscar unidades gestoras apenas quando hÃ¡ termo de busca  
  const { 
    data: unidadesGestoras, 
    isLoading: loadingGestoras, 
    error: errorGestoras 
  } = useBuscarUnidades(submittedGestora, {
    enabled: submittedGestora.trim().length >= 2
  })

  // Separar unidades por tipo
  const { demandantes, gestoras } = useMemo(() => {
    const demandantes = unidades.filter(u => u.tipoResponsabilidade === 1)
    const gestoras = unidades.filter(u => u.tipoResponsabilidade === 2)
    return { demandantes, gestoras }
  }, [unidades])

  // Buscar detalhes das unidades selecionadas para exibir nomes estÃ¡veis
  const selectedIdsForDetails = useMemo(() => unidades.map(u => u.unidadeSaudeId), [unidades])
  const { data: unidadesSelecionadasMap } = useUnidadesByIds(selectedIdsForDetails)

  // Obter nomes das unidades (usando todas as unidades de ambas as buscas)
  const todasUnidadesEncontradas = useMemo(() => {
    const todas = [
      ...(unidadesDemandantes || []),
      ...(unidadesGestoras || [])
    ]
    // Remover duplicatas pelo ID
    return todas.filter((unidade, index, self) => 
      index === self.findIndex(u => u.id === unidade.id)
    )
  }, [unidadesDemandantes, unidadesGestoras])

  const unidadesComNome: UnidadeComNome[] = useMemo(() => {
    return unidades.map(unidade => {
      const unidadeData = unidadesSelecionadasMap?.[unidade.unidadeSaudeId] ||
        todasUnidadesEncontradas.find(u => u.id === unidade.unidadeSaudeId)
      return {
        ...unidade,
        unidadeSaudeNome: unidadeData?.nome || `Unidade ${unidade.unidadeSaudeId.slice(0, 8)}...`
      }
    })
  }, [unidades, todasUnidadesEncontradas, unidadesSelecionadasMap])

  // Unidades jÃ¡ selecionadas (nÃ£o pode selecionar novamente)
  const unidadesSelecionadasIds = useMemo(() => 
    unidades.map(u => u.unidadeSaudeId),
    [unidades]
  )

  // Adicionar nova unidade
  const adicionarUnidade = useCallback((tipoResponsabilidade: 1 | 2, unidadeSaudeId: string) => {
    // Verificar se unidade jÃ¡ foi selecionada
    if (unidadesSelecionadasIds.includes(unidadeSaudeId)) {
      return
    }

    const novaUnidade: CriarUnidadeResponsavelPayload = {
      unidadeSaudeId,
      tipoResponsabilidade,
      principal: false,
      observacoes: ''
    }

    onChange([...unidades, novaUnidade])
    
    // Fechar popover e limpar busca
    if (tipoResponsabilidade === 1) {
      setOpenDemandante(false)
      setSearchDemandante('')
      setSubmittedDemandante('')
    } else {
      setOpenGestora(false)
      setSearchGestora('')
      setSubmittedGestora('')
    }
  }, [unidades, onChange, unidadesSelecionadasIds])

  // Remover unidade
  const removerUnidade = useCallback((index: number) => {
    const novasUnidades = [...unidades]
    novasUnidades.splice(index, 1)
    onChange(novasUnidades)
  }, [unidades, onChange])
  
  // Alternar principal removido (noop)
  const alternarPrincipal = useCallback((_index: number) => {}, [])

  // Atualizar observaÃ§Ãµes
  const atualizarObservacoes = useCallback((index: number, observacoes: string) => {
    const novasUnidades = [...unidades]
    novasUnidades[index].observacoes = observacoes
    onChange(novasUnidades)
  }, [unidades, onChange])

  // Verificar se pode remover (mÃ­nimo 1 por tipo)
  const podeRemover = useCallback((_unidade: CriarUnidadeResponsavelPayload) => {
    return true
  }, [])

  // ValidaÃ§Ãµes
  const temDemandante = demandantes.length > 0
  const temGestora = gestoras.length > 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Unidades ResponsÃ¡veis *
        </label>
        <p className="text-xs text-muted-foreground">
          Selecione as unidades demandantes e gestoras do contrato.
          {!temDemandante && !temGestora && " Unidade demandante e unidade gestora são obrigatórias"}
          {!temDemandante && temGestora && " Unidade demandante é obrigatória"}
          {temDemandante && !temGestora && " Unidade gestora é obrigatória"}
        </p>
      </div>

      {/* SeÃ§Ã£o Demandantes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">Unidades Demandantes</span>
            <Badge variant="outline" className="text-xs">
              {demandantes.length}
            </Badge>
          </div>
          <Popover open={openDemandante} onOpenChange={setOpenDemandante}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput 
                  placeholder="Digite e pressione Enter para buscar unidade demandante..." 
                  value={searchDemandante}
                  onValueChange={setSearchDemandante}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSubmittedDemandante(searchDemandante.trim())
                    }
                  }}
                />
                <CommandList>
                  {!searchDemandante ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Digite o nome da unidade e pressione Enter para buscar
                    </div>
                  ) : searchDemandante.length < 2 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Digite pelo menos 2 caracteres
                    </div>
                  ) : (!submittedDemandante || submittedDemandante !== searchDemandante) ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Pressione Enter para buscar "{searchDemandante}"
                    </div>
                  ) : loadingDemandantes ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      ðŸ” Buscando unidades...
                    </div>
                  ) : errorDemandantes ? (
                    <div className="py-6 text-center">
                      <div className="text-sm text-red-600 mb-2">Erro ao buscar unidades</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearchDemandante(''); setSubmittedDemandante('') }}
                        className="text-xs"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>Nenhuma unidade encontrada para "{submittedDemandante}"</CommandEmpty>
                      <CommandGroup>
                        {unidadesDemandantes
                          ?.filter(u => !unidadesSelecionadasIds.includes(u.id))
                          .map((unidade) => (
                            <CommandItem
                              key={unidade.id}
                              value={normalizeText(unidade.nome)}
                              onSelect={() => adicionarUnidade(1, unidade.id)}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              {unidade.nome}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Lista de Demandantes */}
        <div className="space-y-2">
          {demandantes.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Building className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Nenhuma unidade demandante selecionada</p>
              <p className="text-xs text-gray-400">Clique em "Adicionar" para incluir unidades</p>
            </div>
          ) : (
            unidadesComNome
              .filter(u => u.tipoResponsabilidade === 1)
              .map((unidade) => {
                const absoluteIndex = unidades.findIndex(u => 
                  u.unidadeSaudeId === unidade.unidadeSaudeId && 
                  u.tipoResponsabilidade === 1
                )
                return (
                  <UnidadeResponsavelItem
                    key={`${unidade.unidadeSaudeId}-${unidade.tipoResponsabilidade}`}
                    unidade={unidade}
                    index={absoluteIndex}
                    canRemove={podeRemover(unidade)}
                    onRemove={removerUnidade}
                    onUpdateObservacoes={atualizarObservacoes}
                  />
                )
              })
          )}
        </div>
      </div>

      {/* SeÃ§Ã£o Gestoras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Unidades Gestoras</span>
            <Badge variant="outline" className="text-xs">
              {gestoras.length}
            </Badge>
          </div>
          <Popover open={openGestora} onOpenChange={setOpenGestora}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput
                  placeholder="Digite e pressione Enter para buscar unidade gestora..."
                  value={searchGestora}
                  onValueChange={setSearchGestora}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSubmittedGestora(searchGestora.trim())
                    }
                  }}
                />
                <CommandList>
                  {!searchGestora ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Digite o nome da unidade e pressione Enter para buscar
                    </div>
                  ) : searchGestora.length < 2 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Digite pelo menos 2 caracteres
                    </div>
                  ) : (!submittedGestora || submittedGestora !== searchGestora) ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Pressione Enter para buscar "{searchGestora}"
                    </div>
                  ) : loadingGestoras ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Buscando unidades...
                    </div>
                  ) : errorGestoras ? (
                    <div className="py-6 text-center">
                      <div className="text-sm text-red-600 mb-2">Erro ao buscar unidades</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearchGestora(''); setSubmittedGestora('') }}
                        className="text-xs"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>Nenhuma unidade encontrada para "{submittedGestora}"</CommandEmpty>
                      <CommandGroup>
                        {unidadesGestoras
                          ?.filter(u => !unidadesSelecionadasIds.includes(u.id))
                          .map((unidade) => (
                            <CommandItem
                              key={unidade.id}
                              value={normalizeText(unidade.nome)}
                              onSelect={() => adicionarUnidade(2, unidade.id)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              {unidade.nome}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Lista de Gestoras */}
        <div className="space-y-2">
          {gestoras.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Nenhuma unidade gestora selecionada</p>
              <p className="text-xs text-gray-400">Clique em "Adicionar" para incluir unidades</p>
            </div>
          ) : (
            unidadesComNome
              .filter(u => u.tipoResponsabilidade === 2)
              .map((unidade) => {
                const absoluteIndex = unidades.findIndex(u => 
                  u.unidadeSaudeId === unidade.unidadeSaudeId && 
                  u.tipoResponsabilidade === 2
                )
                return (
                  <UnidadeResponsavelItem
                    key={`${unidade.unidadeSaudeId}-${unidade.tipoResponsabilidade}`}
                    unidade={unidade}
                    index={absoluteIndex}
                    canRemove={podeRemover(unidade)}
                    onRemove={removerUnidade}
                    onUpdateObservacoes={atualizarObservacoes}
                  />
                )
              })
          )}
        </div>
      </div>

      {/* Debug info (remover em produÃ§Ã£o) */}
      
    </div>
  )
}






