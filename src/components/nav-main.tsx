import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = isItemActive(item.url, item.items)
          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={
                    isActive
                      ? '[&[data-active=true]]:bg-transparent [&[data-active=true]]:font-medium [&[data-active=true]]:text-[#43B9EB]'
                      : ''
                  }
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
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
                                    ? '[&[data-active=true]]:bg-transparent [&[data-active=true]]:font-medium [&[data-active=true]]:text-[#43B9EB]'
                                    : ''
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
