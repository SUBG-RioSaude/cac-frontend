import { Building2, Home, PenBoxIcon, Settings2, Truck } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { NavMain } from '@/components/nav-main'

import { NavUser } from '@/components/nav-user'
import SidebarFooterCustom from '@/components/sidebar-footer'
import { Separator } from './ui/separator'

const data = {
  user: {
    name: 'João Silva',
    email: 'joao.silva@prefeitura.gov.br',
    avatar: '/logos-cac/4.png',
  },
  navMain: [
    {
      title: 'Início',
      url: '/',
      icon: Home,
    },
    {
      title: 'Contratos',
      url: '/contratos',
      icon: PenBoxIcon,
      items: [
          {
            title: 'Lista de Contratos',
            url: '/contratos',
          },
          {
            title: 'Cadastrar Contrato',
            url: '/contratos/cadastrar',
          },
      ],
    },
    {
      title: 'Fornecedores',
      url: '/fornecedores',
      icon: Truck,
      items: [
        {
          title: 'Lista de Fornecedores',
          url: '/fornecedores',
        },
      ],
    },
    {
      title: 'Unidades',
      url: '/unidades',
      icon: Building2,
      items: [
        {
          title: 'Lista de Unidades',
          url: '/unidades',
        },
      ],
    },
    {
      title: 'Configurações',
      url: '/configuracoes',
      icon: Settings2,
      items: [
        {
          title: 'Geral',
          url: '/configuracoes',
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="h-svh" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group/logo cursor-pointer">
              {/* Container principal da logo */}
              <div className="flex flex-col items-center space-y-3 group-data-[state=collapsed]:space-y-2">
                {/* Logo principal limpa - sem quadrado */}
                <div className="logo-container relative transition-all duration-500 group-hover/logo:scale-110 group-data-[state=collapsed]:scale-75">
                  <img
                    src="/logo certa.png"
                    alt="Logo Prefeitura"
                    className="h-24 w-52 object-contain drop-shadow-lg transition-all duration-500 group-data-[state=collapsed]:h-24 group-data-[state=collapsed]:w-24"
                  />
                </div>

                {/* Badge CAC melhorada */}
                <div className="group-data-[state=collapsed]:hidden">
                  <div className="inline-flex items-center gap-3 rounded-xl  px-4 py-2.5 opacity-80 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:opacity-95">
                    <img
                      src="/logos-cac/3.png"
                      alt="Logo CAC"
                      className="h-20 w-20 animate-spin object-contain opacity-95 drop-shadow-sm"
                      style={{ animationDuration: '6s' }}
                    />
                    <span className="text-sidebar-foreground text-sm font-bold tracking-wider uppercase drop-shadow-sm">
                      CAC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Separador entre header e menu */}
        <div className="px-4 py-2">
          <Separator className="bg-sidebar-border/50" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <SidebarFooterCustom />
      </SidebarFooter>
    </Sidebar>
  )
}
