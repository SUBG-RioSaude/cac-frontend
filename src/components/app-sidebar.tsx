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
import { Link } from 'react-router-dom'

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
          title: 'Cadastrar Contrato',
          url: '/contratos/cadastrar',
        },
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
            <div className="cursor-pointer">
              {/* Container principal da logo */}
              <div className="flex flex-col items-center space-y-3 group-data-[state=collapsed]:space-y-2">
                {/* Logo principal limpa - sem quadrado */}
                <Link to="/">
                  <div className="logo-container relative transition-all duration-500 group-data-[state=collapsed]:scale-75 hover:scale-110">
                    <img
                      src="/logo certa.png"
                      alt="Logo Prefeitura"
                      className="h-24 w-52 object-contain drop-shadow-lg transition-all duration-500 group-data-[state=collapsed]:h-24 group-data-[state=collapsed]:w-24"
                    />
                  </div>
                </Link>

                {/* Badge CAC melhorada */}
                <div className="group-data-[state=collapsed]:hidden">
                  <div className="group/cac relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gray-600 px-4 opacity-80 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:opacity-95">
                    <img
                      src="/logos-cac/3.png"
                      alt="Logo CAC"
                      className="h-15 w-15 object-contain opacity-95 drop-shadow-sm"
                      style={{ animationDuration: '6s' }}
                    />
                    <span className="text-sidebar-foreground text-lg font-bold tracking-wider uppercase drop-shadow-sm">
                      CAC
                    </span>
                    {/* Efeito de brilho animado */}
                    <div className="via-sidebar-foreground/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-out group-hover/cac:translate-x-full"></div>
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
