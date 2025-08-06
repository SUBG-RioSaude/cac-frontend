import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
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
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.href}>
            <BreadcrumbLink asChild>
              <Link to={crumb.href}>{crumb.label}</Link>
            </BreadcrumbLink>
            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
