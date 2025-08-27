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
import { useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { executeWithFallback } from '@/lib/axios'

export default function PageBreadcrumb() {
  const location = useLocation()

  // Extrair ID do contrato manualmente da URL
  const contratoId = location.pathname.match(/\/contratos\/([^/]+)/)?.[1]
  const isContratoRoute = !!contratoId
  
  console.log('🍞 Breadcrumb Debug:', { 
    pathname: location.pathname, 
    contratoId,
    isContratoRoute
  })
  
  const { data: contratoData, isLoading: contratoLoading } = useQuery<{ numeroContrato?: string; id?: string }>({ 
    queryKey: ['contrato-breadcrumb', contratoId],
    queryFn: async (): Promise<{ numeroContrato?: string; id?: string }> => {
      console.log('🔍 Breadcrumb buscando contrato:', contratoId)
      const response = await executeWithFallback({
        method: 'get',
        url: `/contratos/${contratoId}`
      })
      console.log('✅ Breadcrumb dados recebidos:', response.data)
      return response.data as { numeroContrato?: string; id?: string }
    },
    enabled: !!isContratoRoute && !!contratoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Retry apenas 1 vez para breadcrumb
  })

  // Generate breadcrumbs based on current path
  const generateCrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Início', href: '/' }]

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`

      console.log('🔄 Processando segment:', { segment, currentPath, contratoId })

      // Handle dynamic routes - diretamente baseado na URL
      if (currentPath.includes('/contratos/') && segment === contratoId) {
          // Use número do contrato se disponível, senão use o ID
          let label = `Contrato ${segment}`
          
          console.log('🏷️ Estado atual:', { 
            segment, 
            contratoId,
            contratoLoading, 
            hasData: !!contratoData,
            numeroContrato: contratoData?.numeroContrato,
            fullData: contratoData
          })
          
          if (contratoLoading) {
            label = 'Carregando...'
          } else if (contratoData?.numeroContrato) {
            label = `Contrato ${contratoData.numeroContrato}`
          } else if (contratoData?.id) {
            label = `Contrato ${contratoData.id}`
          }
          
          console.log('🏷️ Label final:', label)
          crumbs.push({ label, href: currentPath })
      } else if (currentPath.includes('/fornecedores/') && segment.match(/^[a-f0-9-]{36}$/)) {
        // Handle fornecedores route
        crumbs.push({ label: `Fornecedor ${segment}`, href: currentPath })
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
