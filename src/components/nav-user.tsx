'use client'

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative overflow-hidden border border-sidebar-border/30 bg-gray-600 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-sidebar-border/50 hover:bg-sidebar-accent hover:shadow-lg active:scale-[0.96] active:bg-sidebar-accent/80 data-[state=open]:scale-[1.01] py-8"
            >
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sidebar-foreground/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full group-data-[state=open]:translate-x-full"></div>
              
              {/* Efeito de luz ambiente suave */}
              {/* <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/5 to-sidebar-primary/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-data-[state=open]:opacity-100"></div> */}
              
              {/* Efeito de pulsação no estado ativo */}
              <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/10 via-sidebar-primary/15 to-sidebar-primary/10 opacity-0 transition-all duration-500 group-data-[state=open]:animate-pulse group-data-[state=open]:opacity-100"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11 rounded-xl border-2 border-sidebar-border/40 bg-sidebar-foreground/5 shadow-lg backdrop-blur-sm transition-all duration-500 group-hover:border-sidebar-border/60 group-hover:shadow-xl group-data-[state=open]:scale-105 group-data-[state=open]:border-sidebar-primary/60 group-data-[state=open]:shadow-sidebar-primary/30">
                    <AvatarImage
                      src="/logos-cac/4.png"
                      alt={user.name}
                      className="object-contain p-1.5 opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100 group-data-[state=open]:scale-110 group-data-[state=open]:opacity-100"
                    />
                    <AvatarFallback className="rounded-xl border border-sidebar-border/30 bg-sidebar-primary font-bold text-sidebar-primary-foreground backdrop-blur-sm">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Indicador de status online */}
                  <div className="absolute -right-1 -bottom-1">
                    <div className="relative">
                      {/* Anel externo pulsante */}
                      <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-green-400/40 group-data-[state=open]:bg-green-300/60"></div>
                      {/* Anel médio */}
                      <div className="absolute inset-0.5 h-3 w-3 animate-pulse rounded-full bg-green-400/70"></div>
                      {/* Núcleo sólido */}
                      <div className="relative h-4 w-4 rounded-full border-2 border-sidebar bg-gradient-to-br from-green-400 to-green-500 shadow-lg transition-all duration-300 group-data-[state=open]:scale-110 group-data-[state=open]:shadow-green-400/40"></div>
                      {/* Brilho interno */}
                      <div className="absolute inset-1 h-2 w-2 rounded-full bg-green-200/90"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid flex-1 transform text-left text-sm leading-tight transition-all duration-500 group-hover:translate-x-1 group-data-[state=open]:translate-x-2">
                  <span className="truncate font-semibold text-sidebar-foreground drop-shadow-sm transition-colors duration-300 group-data-[state=open]:font-bold group-data-[state=open]:text-sidebar-accent-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-xs font-medium text-sidebar-foreground/70 transition-all duration-300 group-data-[state=open]:font-semibold group-data-[state=open]:text-sidebar-accent-foreground/90">
                    {user.email}
                  </span>
                </div>
                
                <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/60 transition-all duration-500 group-hover:scale-125 group-hover:rotate-180 group-hover:text-sidebar-foreground group-data-[state=open]:scale-125 group-data-[state=open]:rotate-180 group-data-[state=open]:text-sidebar-accent-foreground group-data-[state=open]:drop-shadow-sm" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-sidebar-border bg-sidebar/95 backdrop-blur-md"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="m-1 flex items-center gap-3 rounded-lg border border-sidebar-border/30 bg-sidebar-accent px-2 py-2 text-left text-sm shadow-sm backdrop-blur-sm">
                <div className="relative">
                  <Avatar className="h-9 w-9 rounded-xl border-2 border-sidebar-border/40 bg-sidebar-foreground/5 shadow-md backdrop-blur-sm">
                    <AvatarImage
                      src="/logos-cac/4.png"
                      alt={user.name}
                      className="object-contain p-1.5 opacity-90"
                    />
                    <AvatarFallback className="rounded-xl border border-sidebar-border/30 bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground backdrop-blur-sm">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-0.5 -bottom-0.5">
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full border-2 border-sidebar bg-gradient-to-br from-green-400 to-green-500 shadow-md"></div>
                      <div className="absolute inset-0.5 h-2 w-2 rounded-full bg-green-200/90"></div>
                    </div>
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground drop-shadow-sm">
                    {user.name}
                  </span>
                  <span className="truncate text-xs font-medium text-sidebar-foreground/70">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
                <Sparkles className="text-sidebar-accent-foreground" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
