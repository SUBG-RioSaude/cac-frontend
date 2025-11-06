import { Info, GitBranch, Hash, Calendar, Package } from 'lucide-react'

import { NavUser } from '@/components/nav-user'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  obterVersaoApp,
  obterAnoAtual,
  obterMetadataVersao,
} from '@/lib/versao'

/**
 * Componente de rodapé para a sidebar.
 * Exibe informações sobre o desenvolvedor, versão do aplicativo e menu de usuário.
 */
const SidebarFooter = () => {
  const versaoApp = obterVersaoApp()
  const anoAtual = obterAnoAtual()
  const metadata = obterMetadataVersao()
  const { state } = useSidebar()

  // Determinar cor baseado no ambiente
  const getAmbienteColors = (ambiente: string) => {
    switch (ambiente) {
      case 'production':
        return {
          badge: 'border-green-600 bg-green-50 text-green-700',
          arrow: 'bg-green-600 fill-green-600',
          label: 'Produção',
        }
      case 'staging':
        return {
          badge: 'border-yellow-600 bg-yellow-50 text-yellow-700',
          arrow: 'bg-yellow-600 fill-yellow-600',
          label: 'Staging',
        }
      default:
        return {
          badge: 'border-blue-600 bg-blue-50 text-blue-700',
          arrow: 'bg-blue-600 fill-blue-600',
          label: 'Desenvolvimento',
        }
    }
  }

  const ambienteColors = getAmbienteColors(metadata.ambiente)

  // Formatar mensagem do tooltip com metadata
  const tooltipContent = (
    <div className="w-64 space-y-2 p-1">
      {/* Header com título e badge de ambiente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-semibold">Build Info</span>
        </div>
        <Badge className={`${ambienteColors.badge} text-[10px]`}>
          {ambienteColors.label}
        </Badge>
      </div>

      <Separator className="my-1" />

      {/* Grid de informações */}
      <div className="space-y-1.5">
        {/* Versão */}
        <div className="flex items-center gap-1.5">
          <Package className="text-muted-foreground h-3 w-3" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Versão:</span>
            <span className="font-mono text-[11px] font-medium">
              {metadata.versao}
            </span>
          </div>
        </div>

        {/* Build Number */}
        <div className="flex items-center gap-1.5">
          <Hash className="text-muted-foreground h-3 w-3" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Build:</span>
            <span className="font-mono text-[11px] font-medium">
              #{metadata.buildNumber}
            </span>
          </div>
        </div>

        {/* Commit SHA */}
        <div className="flex items-center gap-1.5">
          <GitBranch className="text-muted-foreground h-3 w-3" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Commit:</span>
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] font-medium text-slate-700">
              {metadata.commitSha}
            </code>
          </div>
        </div>

        {/* Data do Build */}
        <div className="flex items-center gap-1.5">
          <Calendar className="text-muted-foreground h-3 w-3" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-[11px]">Data:</span>
            <span className="text-[11px] font-medium">
              {metadata.buildTimestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  if (state === 'collapsed') {
    // Versão compacta quando a sidebar está colapsada
    return (
      <div className="border-sidebar-border bg-sidebar border-t">
        <NavUser />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hover:bg-sidebar-accent cursor-help p-2 text-center transition-colors">
                <div className="text-sidebar-foreground/60 font-mono text-xs">
                  v{versaoApp}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="border-gray-200 bg-white text-gray-900 shadow-lg"
              arrowClassName={ambienteColors.arrow}
            >
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="border-sidebar-border bg-sidebar text-sidebar-foreground border-t">
      <NavUser />
      <div className="p-3">
        <div className="space-y-2 text-center">
          <div className="text-sidebar-foreground/70 text-xs">
            Desenvolvido pelo time de TI {anoAtual}
          </div>
          <Separator className="bg-sidebar-border/50" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sidebar-foreground/60 hover:text-sidebar-foreground/80 cursor-help font-mono text-xs transition-colors">
                  v{versaoApp}
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="border-gray-200 bg-white text-gray-900 shadow-lg"
                arrowClassName={ambienteColors.arrow}
              >
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

export default SidebarFooter
