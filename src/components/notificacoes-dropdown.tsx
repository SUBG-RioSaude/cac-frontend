import { useState, useRef, useEffect } from 'react'
import { Bell, Check, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNotificacoesStore, type Notificacao } from '@/lib/notificacoes-store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificacoesDropdown() {
  const [aberto, setAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notificacoes, notificacoesNaoLidas, marcarComoLida, marcarTodasComoLidas, removerNotificacao, limparVisualizadas, limparTodas } = useNotificacoesStore()

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarcarComoLida = (id: string) => {
    marcarComoLida(id)
  }

  const handleRemoverNotificacao = (id: string) => {
    removerNotificacao(id)
  }

  const getIconePorTipo = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'aviso':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }



  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setAberto(!aberto)}
        className="relative h-10 w-10 p-0 hover:bg-gray-100"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        
    
        {notificacoesNaoLidas > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-medium flex items-center justify-center"
          >
            {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
          </Badge>
        )}
      </Button>

      {/* Dropdown de notificações */}
      {aberto && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Header do dropdown */}
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              {notificacoesNaoLidas > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {notificacoesNaoLidas} não lida{notificacoesNaoLidas > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
                         {/* Botões de ação em grid responsivo */}
             {notificacoes.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {notificacoesNaoLidas > 0 && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={marcarTodasComoLidas}
                     className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 flex-shrink-0"
                     aria-label="Marcar todas como lidas"
                   >
                     <Check className="h-3 w-3 mr-1" />
                     Visualizar todas
                   </Button>
                 )}
                 {notificacoes.filter(n => n.lida).length > 0 && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={limparVisualizadas}
                     className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-orange-200 flex-shrink-0"
                     aria-label="Limpar notificações visualizadas"
                   >
                     <X className="h-3 w-3 mr-1" />
                     Limpar visualizadas
                   </Button>
                 )}
                 {notificacoes.length > 0 && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={limparTodas}
                     className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 flex-shrink-0"
                     aria-label="Limpar todas as notificações"
                   >
                     <X className="h-3 w-3 mr-1" />
                     Limpar todas
                   </Button>
                   )}
               </div>
             )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 transition-colors',
                      !notificacao.lida && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone do tipo */}
                      <div className="mt-0.5 flex-shrink-0">
                        {getIconePorTipo(notificacao.tipo)}
                      </div>

                      {/* Conteúdo da notificação */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            'text-sm font-medium text-gray-900',
                            !notificacao.lida && 'font-semibold'
                          )}>
                            {notificacao.titulo}
                          </h4>
                          
                          {/* Botões de ação */}
                          <div className="flex items-center gap-1">
                            {!notificacao.lida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarComoLida(notificacao.id)}
                                className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
                                aria-label="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoverNotificacao(notificacao.id)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
                              aria-label="Remover notificação"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className={cn(
                          'mt-1 text-sm text-gray-600 line-clamp-2',
                          !notificacao.lida && 'text-gray-700'
                        )}>
                          {notificacao.mensagem}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                          {formatDistanceToNow(notificacao.data, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer do dropdown */}
          {notificacoes.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setAberto(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
