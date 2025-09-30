'use client'

import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
import { useAuthStore } from '@/lib/auth/auth-store'
import { createComponentLogger } from '@/lib/logger'

export const NavUser = () => {
  const logger = createComponentLogger('NavUser', 'navigation')
  const { isMobile } = useSidebar()
  const { usuario, logoutTodasSessoes } = useAuthStore()
  const [fazendoLogout, setFazendoLogout] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Debug: log dos dados do usuário
  useEffect(() => {
    logger.debug(
      {
        userId: usuario?.id,
        userName: usuario?.nomeCompleto,
        hasUser: !!usuario,
      },
      'NavUser dados do usuário carregados',
    )
  }, [logger, usuario])

  // Se não há usuário autenticado, não renderiza o componente
  if (!usuario) {
    logger.debug(
      {
        hasUser: false,
        component: 'not-rendered',
      },
      'NavUser usuário não encontrado, componente não renderizado',
    )
    return null
  }

  const handleLogout = async () => {
    try {
      setFazendoLogout(true)

      logger.info(
        {
          userId: usuario.id,
          action: 'logout_initiated',
        },
        'Logout iniciado pelo usuário',
      )

      // Chama a API de logout para invalidar TODOS os tokens no servidor
      await logoutTodasSessoes()

      logger.info(
        {
          userId: usuario.id,
          action: 'logout_completed',
        },
        'Logout completado com sucesso',
      )

      // O logout já foi tratado no store (limpa cookies, estado, etc.)
      // Redirecionamento será feito automaticamente pelo middleware
    } catch (erro) {
      logger.error(
        {
          userId: usuario.id,
          action: 'logout_error',
          error: erro instanceof Error ? erro.message : String(erro),
        },
        'Erro ao fazer logout',
      )

      // Mesmo com erro, força o logout local para garantir segurança
      void logoutTodasSessoes()
    } finally {
      // Só atualiza estado se componente ainda está montado
      if (isMountedRef.current) {
        setFazendoLogout(false)
      }
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group/user relative mt-5 mb-3 h-15 overflow-hidden bg-gray-600 py-4 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg data-[state=open]:scale-[1.01]"
            >
              {/* Efeito de brilho animado */}
              <div className="via-sidebar-foreground/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-out group-hover/user:translate-x-full group-data-[state=open]:translate-x-full" />

              {/* Efeito de luz ambiente suave */}
              <div className="from-sidebar-primary/5 to-sidebar-primary/10 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-data-[state=open]:opacity-100" />

              {/* Efeito de pulsação no estado ativo */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-all duration-500 group-data-[state=open]:animate-pulse" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="relative">
                  <Avatar className="border-sidebar-border/40 bg-sidebar-foreground/5 group-hover/user:border-sidebar-border/60 h-9 w-9 rounded-xl border-2 shadow-lg backdrop-blur-sm transition-all duration-500 group-hover/user:shadow-xl group-data-[state=open]:scale-105">
                    <AvatarImage
                      src="/logos-cac/4.png"
                      alt={usuario.nomeCompleto || usuario.email}
                      className="object-contain p-1.5 opacity-90 transition-all duration-500 group-hover/user:scale-110 group-hover/user:opacity-100 group-data-[state=open]:scale-110 group-data-[state=open]:opacity-100"
                    />
                    <AvatarFallback className="border-sidebar-border/30 bg-sidebar-primary text-sidebar-primary-foreground rounded-xl border font-bold backdrop-blur-sm">
                      {(usuario.nomeCompleto || usuario.email)
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Indicador de status online */}
                  <div className="absolute -right-0.5 -bottom-0.5">
                    <div className="relative">
                      {/* Anel externo pulsante */}
                      <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-400/40 group-data-[state=open]:bg-green-300/60" />
                      {/* Anel médio */}
                      <div className="absolute inset-0.5 h-2 w-2 animate-pulse rounded-full bg-green-400/70" />
                      {/* Núcleo sólido */}
                      <div className="border-sidebar relative h-3 w-3 rounded-full border-2 bg-gradient-to-br from-green-400 to-green-500 shadow-lg transition-all duration-300 group-data-[state=open]:scale-110 group-data-[state=open]:shadow-green-400/40" />
                      {/* Brilho interno */}
                      <div className="absolute inset-0.5 h-1.5 w-1.5 rounded-full bg-green-200/90" />
                    </div>
                  </div>
                </div>

                <div className="grid flex-1 transform text-left text-sm leading-tight transition-all duration-500 group-hover/user:translate-x-1 group-data-[state=open]:translate-x-2">
                  <span className="text-sidebar-foreground truncate font-semibold drop-shadow-sm transition-colors duration-300 group-data-[state=open]:font-bold">
                    {usuario.nomeCompleto || 'Usuário'}
                  </span>
                  <span className="text-sidebar-foreground/70 truncate text-xs font-medium transition-all duration-300 group-data-[state=open]:font-semibold">
                    {usuario.email}
                  </span>
                </div>

                <ChevronsUpDown className="text-sidebar-foreground/60 group-hover/user:text-sidebar-foreground ml-auto size-4 transition-all duration-500 group-hover/user:scale-125 group-hover/user:rotate-180 group-data-[state=open]:scale-125 group-data-[state=open]:rotate-180" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="border-sidebar-border bg-sidebar/95 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg backdrop-blur-md"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="border-sidebar-border/30 bg-sidebar-accent m-1 flex items-center gap-3 rounded-lg border px-2 py-2 text-left text-sm shadow-sm backdrop-blur-sm">
                <div className="relative">
                  <Avatar className="border-sidebar-border/40 bg-sidebar-foreground/5 h-9 w-9 rounded-xl border-2 shadow-md backdrop-blur-sm">
                    <AvatarImage
                      src="/logos-cac/4.png"
                      alt={usuario.nomeCompleto || usuario.email}
                      className="object-contain p-1.5 opacity-90"
                    />
                    <AvatarFallback className="border-sidebar-border/30 bg-sidebar-primary text-sidebar-primary-foreground rounded-xl border text-xs font-bold backdrop-blur-sm">
                      {(usuario.nomeCompleto || usuario.email)
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-0.5 -bottom-0.5">
                    <div className="relative">
                      <div className="border-sidebar h-3 w-3 rounded-full border-2 bg-gradient-to-br from-green-400 to-green-500 shadow-md" />
                      <div className="absolute inset-0.5 h-2 w-2 rounded-full bg-green-200/90" />
                    </div>
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-sidebar-foreground truncate font-semibold drop-shadow-sm">
                    {usuario.nomeCompleto || 'Usuário'}
                  </span>
                  <span className="text-sidebar-foreground/70 truncate text-xs font-medium">
                    {usuario.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground">
                <BadgeCheck />
                Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-sidebar-border/50" />
            <DropdownMenuItem
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-primary focus:text-sidebar-primary-foreground"
              onClick={handleLogout}
              disabled={fazendoLogout}
            >
              <LogOut className={fazendoLogout ? 'animate-spin' : ''} />
              {fazendoLogout ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
