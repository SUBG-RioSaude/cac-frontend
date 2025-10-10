import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useLocation, Link } from 'react-router-dom'

import { executeWithFallback } from '@/lib/axios'
import { createComponentLogger } from '@/lib/logger'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { SidebarTrigger } from './ui/sidebar'

const PageBreadcrumb = () => {
  const logger = createComponentLogger('PageBreadcrumb', 'navigation')
  const location = useLocation()

  // Extrair ID do contrato manualmente da URL
  const contratoId = /\/contratos\/([^/]+)/.exec(location.pathname)?.[1]
  const isContratoRoute = !!contratoId

  logger.debug(
    {
      pathname: location.pathname,
      contratoId,
      isContratoRoute,
    },
    'Breadcrumb navegação iniciada',
  )

  const { data: contratoData, isLoading: contratoLoading } = useQuery<{
    numeroContrato?: string
    id?: string
  }>({
    queryKey: ['contrato-breadcrumb', contratoId],
    queryFn: async (): Promise<{ numeroContrato?: string; id?: string }> => {
      logger.debug({ contratoId }, 'Breadcrumb buscando dados do contrato')
      const response = await executeWithFallback({
        method: 'get',
        url: `/contratos/${contratoId}`,
      })
      logger.debug(
        { contratoData: response.data },
        'Breadcrumb dados do contrato recebidos',
      )
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

      logger.trace(
        { segment, currentPath, contratoId },
        'Breadcrumb processando segmento',
      )

      // Handle dynamic routes - diretamente baseado na URL
      if (currentPath.includes('/contratos/') && segment === contratoId) {
        // Use número do contrato se disponível, senão use o ID
        let label = `Contrato ${segment}`

        logger.trace(
          {
            segment,
            contratoId,
            contratoLoading,
            hasData: !!contratoData,
            numeroContrato: contratoData?.numeroContrato,
            fullData: contratoData,
          },
          'Breadcrumb estado do segmento',
        )

        if (contratoLoading) {
          label = 'Carregando...'
        } else if (contratoData?.numeroContrato) {
          label = `Contrato ${contratoData.numeroContrato}`
        } else if (contratoData?.id) {
          label = `Contrato ${contratoData.id}`
        }

        logger.trace({ label, segment }, 'Breadcrumb label final gerado')
        crumbs.push({ label, href: currentPath })
      } else if (
        currentPath.includes('/fornecedores/') &&
        /^[a-f0-9-]{36}$/.exec(segment)
      ) {
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

export default PageBreadcrumb
