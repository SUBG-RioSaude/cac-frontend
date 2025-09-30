import { NavUser } from '@/components/nav-user'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'
import { obterVersaoApp, obterAnoAtual } from '@/lib/versao'

/**
 * Componente de rodapé para a sidebar.
 * Exibe informações sobre o desenvolvedor, versão do aplicativo e menu de usuário.
 */
const SidebarFooter = () => {
  const versaoApp = obterVersaoApp()
  const anoAtual = obterAnoAtual()
  const { state } = useSidebar()

  if (state === 'collapsed') {
    // Versão compacta quando a sidebar está colapsada
    return (
      <div className="border-sidebar-border bg-sidebar border-t">
        <NavUser />
        <div className="p-2 text-center">
          <div className="text-sidebar-foreground/60 font-mono text-xs">
            v{versaoApp}
          </div>
        </div>
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
          <div className="text-sidebar-foreground/60 font-mono text-xs">
            v{versaoApp}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarFooter
