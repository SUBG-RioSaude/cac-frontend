import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const isItemActive = (
    itemUrl: string,
    subItems?: { title: string; url: string }[],
  ) => {
    // Verifica se a URL atual corresponde exatamente ao item
    if (location.pathname === itemUrl) {
      return true
    }

    // Verifica se algum subitem está ativo
    if (subItems) {
      return subItems.some((subItem) => location.pathname === subItem.url)
    }

    // Para itens com subitens, verifica se a URL atual começa com a URL do item
    if (subItems && itemUrl !== '#' && itemUrl !== '/') {
      return location.pathname.startsWith(itemUrl)
    }

    return false
  }

  const isSubItemActive = (subItemUrl: string) => {
    return location.pathname === subItemUrl
  }

  const handleItemClick = (item: typeof items[0]) => {
    if (item.items?.length) {
      // Se tem subitens, alterna o estado de abertura
      setOpenItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(item.title)) {
          newSet.delete(item.title)
        } else {
          newSet.add(item.title)
        }
        return newSet
      })
    } else {
      // Se não tem subitens, navega para a URL
      navigate(item.url)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
        Menu Inicial
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isItemActive(item.url, item.items)
          const isOpen = openItems.has(item.title) || isActive
          return (
            <Collapsible key={item.title} asChild open={isOpen}>
              <SidebarMenuItem>
                                 <SidebarMenuButton
                   tooltip={state === 'collapsed' ? item.title : undefined}
                   isActive={isActive}
                   className={
                     isActive
                       ? '[&[data-active=true]]:text-sidebar-primary [&[data-active=true]]:bg-transparent [&[data-active=true]]:font-medium cursor-pointer'
                       : state === 'collapsed'
                         ? 'hover:text-sidebar-primary justify-center cursor-pointer'
                         : 'hover:text-sidebar-primary cursor-pointer'
                   }
                   onClick={() => handleItemClick(item)}
                 >
                  <item.icon
                    className={state === 'collapsed' ? 'h-5 w-5' : ''}
                  />
                  <span className={state === 'collapsed' ? 'sr-only' : ''}>
                    {item.title}
                  </span>
                </SidebarMenuButton>
                {item.items?.length && state !== 'collapsed' ? (
                  <>
                                         <CollapsibleTrigger asChild>
                       <SidebarMenuAction 
                         className="data-[state=open]:rotate-90 cursor-pointer"
                         onClick={() => handleItemClick(item)}
                       >
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = isSubItemActive(subItem.url)
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className={
                                  isSubActive
                                    ? '[&[data-active=true]]:text-sidebar-primary [&[data-active=true]]:bg-transparent [&[data-active=true]]:font-medium'
                                    : 'hover:text-sidebar-primary'
                                }
                              >
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
