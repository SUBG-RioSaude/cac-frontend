import {
  Building2,
  Home,
  PenBoxIcon,
  Settings2,
  Truck,
  ShieldUser,
  FileBarChart,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { NavMain } from '@/components/nav-main'
import SidebarFooterCustom from '@/components/sidebar-footer'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

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
    },
    {
      title: 'Unidades',
      url: '/unidades',
      icon: Building2,
    },
    {
      title: 'Relatórios',
      url: '/relatorios',
      icon: FileBarChart,
      items: [
        {
          title: 'Gerar Relatório',
          url: '/relatorios',
        },
        {
          title: 'Histórico',
          url: '/relatorios?tab=historico',
        },
      ],
    },
    {
      title: 'Gestão de Usuários',
      url: '/gestao-usuarios',
      icon: ShieldUser,
      items: [
        {
          title: 'Cadastro de Funcionários',
          url: '/funcionarios/cadastrar',
        },
        {
          title: 'Gerenciar Usuários',
          url: '/gestao-usuarios/gerenciar',
        },
        {
          title: 'Registro de Alterações',
          url: '/alteracoes',
        },
      ],
    },
    {
      title: 'Configurações',
      url: '/configuracoes',
      icon: Settings2,
    },
  ],
}

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="h-svh" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="cursor-pointer">
              {/* Container principal da logo */}
              <div className="flex flex-col items-center space-y-3 group-data-[state=collapsed]:space-y-2">
                {/* Logo principal limpa - sem quadrado */}
                <Link to="/dashboard">
                  <div className="logo-container relative transition-all duration-500 group-data-[state=collapsed]:scale-75 hover:scale-110">
                    <img
                      src="/logo certa.png"
                      alt="Logo Prefeitura"
                      className="h-24 w-52 object-contain drop-shadow-lg transition-all duration-500 group-data-[state=collapsed]:h-24 group-data-[state=collapsed]:w-24"
                    />
                  </div>
                </Link>

                {/* Badge CAC redesenhada com ícone maior */}
                <div className="w-full group-data-[state=collapsed]:hidden">
                  <div className="px-4 py-3">
                    <Separator className="bg-sidebar-border/50" />
                  </div>
                  <div className="flex items-center gap-8 overflow-hidden rounded-md bg-gray-600 px-4 py-2 opacity-80 transition-all duration-300 hover:scale-105 hover:opacity-95">
                    {/* Ícone CAC maior */}
                    <div className="flex h-[45px] items-center justify-center">
                      <img
                        src="/logos-cac/3.png"
                        alt="Logo CAC"
                        className="h-10 w-10 object-contain opacity-95 drop-shadow-sm"
                        style={{ animationDuration: '6s' }}
                      />
                    </div>
                    {/* Texto CAC */}
                    <div className="flex flex-col">
                      <span className="text-sidebar-foreground text-md ml-[-20px] font-bold tracking-wider uppercase drop-shadow-sm">
                        CAC 360
                      </span>
                      <span className="text-sidebar-foreground ml-[-20px] text-sm tracking-wider drop-shadow-sm">
                        Análise de Contratos
                      </span>
                    </div>
                    {/* Efeito de brilho animado */}
                    <div className="via-sidebar-foreground/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-out group-hover/cac:translate-x-full" />
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
        <SidebarFooterCustom />
      </SidebarFooter>
    </Sidebar>
  )
}
