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

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [

    {
      title: 'Início',
      url: '/',
      icon: Home,
      isActive: true,
    },

    {
      title: 'Contratos',
      url: '/contratos',
      icon: PenBoxIcon,
      isActive: false,
      items: [
        {
          title: 'Cadastrar Contrato',
          url: '/contratos',
        },
        {
          title: 'Lista de Contratos',
          url: '/contratos/lista',
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
          url: '/fornecedores/lista',
        },
      ],
    },
    {
      title: 'Unidades',
      url: '#',
      icon: Building2,
      items: [
        {
          title: 'Lista de Unidades',
          url: '/unidades/lista',
        },
      ],
    },
    {
      title: 'Configurações',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        }
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="bg-neutral-500 text-white" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <img
                  src="/logo-prefeitura.png"
                  alt="Logo Prefeitura"
                  className="h-5 w-10"
                />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Sistema de Contratos
                  </span>
                  <span className="truncate text-xs">Cac</span>
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
      </SidebarFooter>
    </Sidebar>
  )
}
