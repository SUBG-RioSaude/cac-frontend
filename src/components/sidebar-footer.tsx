import { NavUser } from '@/components/nav-user'
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

  // Formatar mensagem do tooltip com metadata
  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">Informações do Build</div>
      <Separator className="my-1" />
      <div>
        <span className="text-muted-foreground">Versão:</span> {metadata.versao}
      </div>
      <div>
        <span className="text-muted-foreground">Ambiente:</span>{' '}
        {metadata.ambiente}
      </div>
      <div>
        <span className="text-muted-foreground">Build #:</span>{' '}
        {metadata.buildNumber}
      </div>
      <div>
        <span className="text-muted-foreground">Commit:</span>{' '}
        <code className="rounded bg-muted px-1 font-mono text-xs">
          {metadata.commitSha}
        </code>
      </div>
      <div>
        <span className="text-muted-foreground">Data:</span>{' '}
        {metadata.buildTimestamp}
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
              <div className="cursor-help p-2 text-center transition-colors hover:bg-sidebar-accent">
                <div className="text-sidebar-foreground/60 font-mono text-xs">
                  v{versaoApp}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{tooltipContent}</TooltipContent>
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
                <div className="text-sidebar-foreground/60 cursor-help font-mono text-xs transition-colors hover:text-sidebar-foreground/80">
                  v{versaoApp}
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

export default SidebarFooter
