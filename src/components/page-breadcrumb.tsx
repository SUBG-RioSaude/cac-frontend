import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { SidebarTrigger } from './ui/sidebar'
import { useLocation, useParams, Link } from 'react-router-dom'

export default function PageBreadcrumb() {
  const location = useLocation()
  const params = useParams()

  // Generate breadcrumbs based on current path
  const generateCrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Início', href: '/' }]

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`

      // Check if segment is a parameter (like contratoId, fornecedorId)
      const isParam = Object.values(params).includes(segment)

      if (isParam) {
        // Handle dynamic routes
        if (segment === params.contratoId) {
          crumbs.push({ label: `Contrato ${segment}`, href: currentPath })
        } else if (segment === params.fornecedorId) {
          crumbs.push({ label: `Fornecedor ${segment}`, href: currentPath })
        }
      } else {
        // Handle static routes
        const labels: Record<string, string> = {
          contratos: 'Contratos',
          fornecedores: 'Fornecedores',
        }

        const label =
          labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        crumbs.push({ label, href: currentPath })
      }
    })

    return crumbs
  }

  const crumbs = generateCrumbs()

  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger
        className="cursor-pointer rounded-md border border-transparent p-2 transition-colors duration-200 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
        aria-label="Alternar sidebar"
        title="Clique para expandir/colapsar a sidebar (Ctrl+B)"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLastItem = index === crumbs.length - 1

            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLastItem ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLastItem && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
