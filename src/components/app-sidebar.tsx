import { Building2, Home, PenBoxIcon, Settings2, Truck } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { NavMain } from '@/components/nav-main'

import { NavUser } from '@/components/nav-user'
import SidebarFooterCustom from '@/components/sidebar-footer'

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
            <SidebarMenuButton
              size="lg"
              asChild
              className="group/logo hover:bg-sidebar-accent rounded-lg p-3 transition-all duration-300"
            >
              <a href="#" className="flex items-center gap-3">
                <div className="logo-container from-sidebar-primary/20 to-sidebar-primary/5 border-sidebar-primary/20 relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br shadow-sm transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:shadow-md">
                  <img
                    src="/logo certa.png"
                    alt="Logo Prefeitura"
                    className="h-8 w-8 object-contain transition-all duration-300 group-hover/logo:scale-110"
                  />
                  <div className="bg-sidebar-primary/5 absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight transition-transform duration-300 group-hover/logo:translate-x-0.5">
                  <span className="text-sidebar-foreground group-hover/logo:text-sidebar-primary truncate font-semibold transition-colors duration-300">
                    Sistema de Contratos
                  </span>
                  <span className="text-sidebar-foreground/70 truncate text-xs font-medium tracking-wider uppercase">
                    CAC
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
