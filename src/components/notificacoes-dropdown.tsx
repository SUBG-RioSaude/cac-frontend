/**
 * Componente de dropdown de notificações
 * Refatorado para usar TanStack Query ao invés de Zustand
 */


import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bell,
  Check,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Archive,
  Settings,
  Megaphone,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificacoes } from '@/hooks/use-notificacoes'
import { useNotificacoesArquivadasQuery } from '@/hooks/use-notificacoes-query'
import { cn } from '@/lib/utils'
import type {
  BroadcastTemporario,
  NotificacaoUsuario,
  TipoNotificacao,
} from '@/types/notificacao'

import { NotificacoesPreferenciasDialog } from './notificacoes-preferencias-dialog'
import { TabSeguindo } from './tab-seguindo'

export const NotificacoesDropdown = () => {
  const [aberto, setAberto] = useState(false)
  const [preferenciasAbertas, setPreferenciasAbertas] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<
    'todas' | 'nao-lidas' | 'arquivo' | 'seguindo'
  >('todas')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hook principal de notificações (TanStack Query + SignalR)
  const {
    notificacoesVisiveis,
    notificacoesNaoLidas,
    itensExibicao,
    contagemNaoLidas,
    conectado,
    reconectando,
    isLoading,
    marcarComoLida,
    arquivar,
    marcarTodasComoLidas,
    arquivarTodasLidas,
    deletar,
    descartarBroadcast,
    descartarTodosBroadcasts,
  } = useNotificacoes()

  // Query para notificações arquivadas (carrega apenas se aba ativa)
  const { data: arquivadas, isLoading: isLoadingArquivadas } =
    useNotificacoesArquivadasQuery(1, 20, abaAtiva === 'arquivo')

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Obtém ícone baseado no tipo da notificação (API usa nomes em inglês)
   */
  const obterIconePorTipo = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default: // 'info'
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  /**
   * Obtém indicador de status SignalR
   */
  const obterIndicadorStatus = () => {
    if (reconectando) {
      return (
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"
          title="Reconectando"
        />
      )
    }
    if (conectado) {
      return (
        <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
      )
    }
    return <span className="h-2 w-2 rounded-full bg-red-500" title="Offline" />
  }

  /**
   * Verifica se um item é broadcast
   */
  const isBroadcast = (
    item:
      | (NotificacaoUsuario & { tipo_item?: 'notificacao' })
      | (BroadcastTemporario & { tipo_item: 'broadcast' }),
  ): item is BroadcastTemporario & { tipo_item: 'broadcast' } => {
    return 'tipo_item' in item && item.tipo_item === 'broadcast'
  }

  /**
   * Filtra notificações baseado na aba ativa
   */
  const notificacoesFiltradas = () => {
    if (abaAtiva === 'nao-lidas') {
      // Não lidas: apenas notificações não lidas + broadcasts (broadcasts são sempre "não lidos")
      return [
        ...itensExibicao.filter((item) => isBroadcast(item)),
        ...notificacoesNaoLidas.slice(0, 20),
      ]
    }
    if (abaAtiva === 'arquivo') {
      // Arquivadas: apenas notificações arquivadas (broadcasts não são arquiváveis)
      return arquivadas?.items ?? []
    }
    // 'todas': broadcasts + notificações
    return itensExibicao
  }

  const lista = notificacoesFiltradas()
  const temNotificacoes = lista.length > 0

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAberto(!aberto)}
        className="relative h-10 w-10 p-0 hover:bg-gray-100"
        aria-label="Notificações"
        aria-expanded={aberto}
      >
        <Bell className="h-5 w-5 text-gray-600" />

        {/* Badge de contagem */}
        {contagemNaoLidas > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium"
          >
            {contagemNaoLidas > 9 ? '9+' : contagemNaoLidas}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {aberto && (
        <div className="absolute top-12 right-0 z-50 w-[440px] rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-100 px-4 py-3">
            {/* Título e status */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                {obterIndicadorStatus()}
              </div>
              {contagemNaoLidas > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {contagemNaoLidas} não lida
                  {contagemNaoLidas > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Abas */}
            <Tabs
              value={abaAtiva}
              onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)}
            >
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="todas" className="text-xs">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="nao-lidas" className="text-xs">
                  Não lidas {contagemNaoLidas > 0 && `(${contagemNaoLidas})`}
                </TabsTrigger>
                <TabsTrigger value="arquivo" className="text-xs">
                  Arquivo
                </TabsTrigger>
                <TabsTrigger value="seguindo" className="text-xs">
                  Seguindo
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Botões de ação */}
            {temNotificacoes &&
              abaAtiva !== 'arquivo' &&
              abaAtiva !== 'seguindo' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {contagemNaoLidas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      marcarTodasComoLidas()
                      descartarTodosBroadcasts()
                    }}
                    className="h-8 flex-shrink-0 border border-blue-200 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    aria-label="Marcar todas como lidas"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Visualizar todas
                  </Button>
                )}
                {notificacoesVisiveis.some((n) => n.lida) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => arquivarTodasLidas()}
                    className="h-8 flex-shrink-0 border border-orange-200 px-2 text-xs text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    aria-label="Arquivar notificações lidas"
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Arquivar lidas
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {/* Aba "Seguindo" */}
            {abaAtiva === 'seguindo' ? (
              <TabSeguindo aoClicar={() => setAberto(false)} />
            ) : /* Loading state */ isLoading ||
              (abaAtiva === 'arquivo' && isLoadingArquivadas) ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-4 flex-shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !temNotificacoes ? (
              // Empty state
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm">
                  {abaAtiva === 'arquivo'
                    ? 'Nenhuma notificação arquivada'
                    : abaAtiva === 'nao-lidas'
                      ? 'Nenhuma notificação não lida'
                      : 'Nenhuma notificação'}
                </p>
              </div>
            ) : (
              // Lista de notificações e broadcasts
              <div className="divide-y divide-gray-100">
                {lista.map((item) => {
                  const ehBroadcast = isBroadcast(item)

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'p-4 transition-colors hover:bg-gray-50',
                        // Broadcast: fundo roxo/lilás
                        ehBroadcast && 'bg-purple-50/70',
                        // Broadcast urgente (prioridade 2): borda vermelha
                        ehBroadcast &&
                          item.prioridade === 2 &&
                          'border-l-4 border-red-500',
                        // Notificação não lida: fundo azul
                        !ehBroadcast &&
                          !item.lida &&
                          !item.arquivada &&
                          'bg-blue-50/50',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone do tipo */}
                        <div className="mt-0.5 flex-shrink-0">
                          {ehBroadcast ? (
                            <Megaphone
                              className={cn(
                                'h-4 w-4',
                                item.prioridade === 2
                                  ? 'text-red-500'
                                  : 'text-purple-500',
                              )}
                            />
                          ) : (
                            obterIconePorTipo(item.tipo)
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h4
                                className={cn(
                                  'text-sm font-medium text-gray-900',
                                  !ehBroadcast &&
                                    !item.lida &&
                                    'font-semibold',
                                  ehBroadcast && 'font-semibold',
                                )}
                              >
                                {item.titulo}
                              </h4>

                              {/* Indicador de visualização (estilo WhatsApp) */}
                              {!ehBroadcast && (
                                <div className="flex items-center">
                                  {item.lida ? (
                                    // Dois checks azuis para lida
                                    <div className="relative flex">
                                      <Check className="h-3 w-3 text-blue-500" />
                                      <Check className="h-3 w-3 -ml-1.5 text-blue-500" />
                                    </div>
                                  ) : (
                                    // Um check cinza para não lida
                                    <Check className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              )}

                              {/* Badge BROADCAST */}
                              {ehBroadcast && (
                                <Badge
                                  variant={
                                    item.prioridade === 2
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {item.prioridade === 2
                                    ? '🚨 URGENTE'
                                    : '📢 BROADCAST'}
                                </Badge>
                              )}
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-1">
                              {ehBroadcast ? (
                                // Broadcast: botões de check (descartar) e X (remover)
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => descartarBroadcast(item.id)}
                                    className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
                                    aria-label="Marcar como lida"
                                    title="Marcar como lida"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => descartarBroadcast(item.id)}
                                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                                    aria-label="Descartar broadcast"
                                    title="Remover"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                // Notificação: botões normais
                                <>
                                  {!item.lida && !item.arquivada && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => marcarComoLida(item.id)}
                                      className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
                                      aria-label="Marcar como lida"
                                      title="Marcar como lida"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {!item.arquivada && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => arquivar(item.id)}
                                      className="h-6 w-6 p-0 hover:bg-orange-100 hover:text-orange-700"
                                      aria-label="Arquivar"
                                      title="Arquivar"
                                    >
                                      <Archive className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deletar(item.id)}
                                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                                    aria-label="Remover notificação"
                                    title="Remover"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <p
                            className={cn(
                              'mt-1 line-clamp-2 text-sm text-gray-600',
                              !ehBroadcast &&
                                !item.lida &&
                                'text-gray-700',
                              ehBroadcast && 'text-gray-700 font-medium',
                            )}
                          >
                            {item.mensagem}
                          </p>

                          {/* Timestamp */}
                          <p className="mt-2 text-xs text-gray-400">
                            {formatDistanceToNow(new Date(item.criadoEm), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                            {ehBroadcast && item.categoria && (
                              <span className="ml-2">· {item.categoria}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setPreferenciasAbertas(true)}
                aria-label="Configurações de notificações"
              >
                <Settings className="mr-1 h-3 w-3" />
                Preferências
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setAberto(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preferências */}
      <NotificacoesPreferenciasDialog
        aberto={preferenciasAbertas}
        aoFechar={() => setPreferenciasAbertas(false)}
      />
    </div>
  )
}
