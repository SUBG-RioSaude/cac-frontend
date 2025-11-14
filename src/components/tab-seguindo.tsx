/**
 * Aba "Seguindo" do dropdown de notificações
 * Lista entidades que o usuário está seguindo
 */

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  FileText,
  Building2,
  MapPin,
  BellRing,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMinhasSubscricoesQuery,
  useToggleSeguirMutation,
} from '@/hooks/use-subscricoes-query'
import { cn } from '@/lib/utils'
import type { Subscricao } from '@/types/notificacao'

// ============================================================================
// TYPES
// ============================================================================

interface SubscricaoPorSistema {
  sistemaId: string
  nomeSistema: string
  icone: React.ReactNode
  subscricoes: Subscricao[]
  urlBase: string
}

// ============================================================================
// UTILS
// ============================================================================

/**
 * Obtém configuração de exibição por sistema
 */
const obterConfigSistema = (
  sistemaId: string,
): { nome: string; icone: React.ReactNode; urlBase: string } => {
  const configs: Record<
    string,
    { nome: string; icone: React.ReactNode; urlBase: string }
  > = {
    contratos: {
      nome: 'Contratos',
      icone: <FileText className="h-4 w-4 text-blue-600" />,
      urlBase: '/contratos',
    },
    fornecedores: {
      nome: 'Fornecedores',
      icone: <Building2 className="h-4 w-4 text-green-600" />,
      urlBase: '/fornecedores',
    },
    unidades: {
      nome: 'Unidades',
      icone: <MapPin className="h-4 w-4 text-purple-600" />,
      urlBase: '/unidades',
    },
  }

  return (
    configs[sistemaId] ?? {
      nome: sistemaId,
      icone: <BellRing className="h-4 w-4 text-gray-600" />,
      urlBase: '/',
    }
  )
}

/**
 * Agrupa subscrições por sistema
 */
const agruparPorSistema = (
  subscricoes: Subscricao[],
): SubscricaoPorSistema[] => {
  const grupos: Record<string, Subscricao[]> = {}

  subscricoes.forEach((sub) => {
    if (!grupos[sub.sistemaId]) {
      grupos[sub.sistemaId] = []
    }
    grupos[sub.sistemaId].push(sub)
  })

  // Mapeia para estrutura com ícones e nomes
  return Object.entries(grupos).map(([sistemaId, subs]) => {
    const config = obterConfigSistema(sistemaId)
    return {
      sistemaId,
      nomeSistema: config.nome,
      icone: config.icone,
      subscricoes: subs,
      urlBase: config.urlBase,
    }
  })
}

// ============================================================================
// COMPONENTE
// ============================================================================

interface TabSeguindoProps {
  /**
   * Callback ao clicar em uma subscrição (fecha dropdown)
   */
  aoClicar?: () => void
}

export const TabSeguindo = ({ aoClicar }: TabSeguindoProps) => {
  const navigate = useNavigate()

  // ============================================================================
  // QUERIES E MUTATIONS
  // ============================================================================

  const { data, isLoading } = useMinhasSubscricoesQuery()
  const toggleSeguir = useToggleSeguirMutation()

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const subscricoes = data?.items ?? []
  const total = data?.total ?? 0
  const grupos = agruparPorSistema(subscricoes)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDeixarDeSeguir = (subscricao: Subscricao) => {
    toggleSeguir.mutate({
      sistemaId: subscricao.sistemaId,
      entidadeOrigemId: subscricao.entidadeOrigemId,
    })
  }

  const handleNavegar = (urlBase: string, entidadeId: string) => {
    navigate(`${urlBase}/${entidadeId}`)
    void aoClicar?.()
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (subscricoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BellRing className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-muted-foreground text-sm">
          Você não está seguindo nenhuma entidade
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Clique no botão &quot;Seguir&quot; em contratos, fornecedores ou
          unidades
        </p>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {/* Header com contador */}
      <div className="bg-muted/50 sticky top-0 z-10 border-b p-3">
        <p className="text-sm font-medium">
          Seguindo {total} {total === 1 ? 'entidade' : 'entidades'}
        </p>
      </div>

      {/* Lista agrupada por sistema */}
      <div className="divide-y">
        {grupos.map((grupo) => (
          <div key={grupo.sistemaId} className="p-3">
            {/* Header do grupo */}
            <div className="mb-2 flex items-center gap-2">
              {grupo.icone}
              <h4 className="text-sm font-semibold">{grupo.nomeSistema}</h4>
              <span className="text-muted-foreground text-xs">
                ({grupo.subscricoes.length})
              </span>
            </div>

            {/* Itens do grupo */}
            <div className="space-y-2">
              {grupo.subscricoes.map((subscricao) => (
                <div
                  key={subscricao.id}
                  className={cn(
                    'group flex items-start justify-between gap-2 rounded-lg border p-2 transition-colors',
                    'hover:bg-muted/50',
                  )}
                >
                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() =>
                        handleNavegar(
                          grupo.urlBase,
                          subscricao.entidadeOrigemId,
                        )
                      }
                      className="flex items-center gap-2 text-left transition-colors hover:text-blue-600"
                    >
                      <p className="truncate text-sm font-medium">
                        {subscricao.entidadeOrigemId}
                      </p>
                      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Seguindo há{' '}
                      {formatDistanceToNow(new Date(subscricao.criadoEm), {
                        locale: ptBR,
                        addSuffix: false,
                      })}
                    </p>
                  </div>

                  {/* Botão deixar de seguir */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeixarDeSeguir(subscricao)}
                    disabled={toggleSeguir.isPending}
                    className="shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                    title="Deixar de seguir"
                  >
                    {toggleSeguir.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Deixar de seguir'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer com link para página completa (futuro) */}
      <div className="bg-muted/30 sticky bottom-0 border-t p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            // TODO: Navegar para página /minhas-subscricoes quando criada
            // navigate('/minhas-subscricoes')
            // aoClicar?.()
          }}
          disabled
        >
          Ver todas as subscrições
          <span className="text-muted-foreground ml-1">(Em breve)</span>
        </Button>
      </div>
    </div>
  )
}
