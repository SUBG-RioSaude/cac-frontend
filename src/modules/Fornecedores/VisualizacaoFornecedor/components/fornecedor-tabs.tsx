/**
 * ==========================================
 * COMPONENTE DE TABS DO FORNECEDOR
 * ==========================================
 * Sistema de navegação por abas da página do fornecedor
 */

import { BarChart3, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { EmpresaResponse } from '@/modules/Empresas/types/empresa'

import { FornecedorContratos } from './fornecedor-contratos'
import { FornecedorVisaoGeral } from './fornecedor-visao-geral'

interface FornecedorTabsProps {
  fornecedor: EmpresaResponse
  contratos: Contrato[]
  isLoadingContratos?: boolean
}

type TabValue = 'visao-geral' | 'contratos'

export const FornecedorTabs = ({
  fornecedor,
  contratos,
  isLoadingContratos,
}: FornecedorTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabValue>('visao-geral')

  // Sincronizar com URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabValue
    if (['visao-geral', 'contratos'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue
    setActiveTab(newTab)

    // Atualizar URL
    const newSearchParams = new URLSearchParams(searchParams)
    if (newTab === 'visao-geral') {
      newSearchParams.delete('tab')
    } else {
      newSearchParams.set('tab', newTab)
    }
    setSearchParams(newSearchParams, { replace: true })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
        <TabsTrigger value="visao-geral" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Visão Geral</span>
          <span className="sm:hidden">Geral</span>
        </TabsTrigger>

        <TabsTrigger value="contratos" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Contratos</span>
          <span className="sm:hidden">Contratos</span>
          {contratos.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {contratos.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="visao-geral" className="space-y-6">
          <FornecedorVisaoGeral
            fornecedor={fornecedor}
            contratos={contratos}
            isLoading={isLoadingContratos}
          />
        </TabsContent>

        <TabsContent value="contratos" className="space-y-6">
          <FornecedorContratos
            contratos={contratos}
            isLoading={isLoadingContratos}
            empresa={{
              id: fornecedor.id,
              razaoSocial: fornecedor.razaoSocial,
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
