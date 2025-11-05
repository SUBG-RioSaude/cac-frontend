/**
 * Aba Analytics - Análises Detalhadas
 *
 * Sub-tabs com análises por:
 * - Status
 * - Tipo
 * - Valor
 * - Fornecedor
 * - Temporal
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { DashboardData } from '../../types/dashboard'
import { ContractsCharts } from '../Charts'


interface AnalyticsTabProps {
  data?: DashboardData
  isLoading: boolean
}

export const AnalyticsTab = ({ data, isLoading }: AnalyticsTabProps) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="tipo">Tipo</TabsTrigger>
          <TabsTrigger value="valor">Valor</TabsTrigger>
          <TabsTrigger value="fornecedor">Fornecedor</TabsTrigger>
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6 pt-6">
          <ContractsCharts data={data} isLoading={isLoading} detailed />
        </TabsContent>

        <TabsContent value="tipo" className="space-y-6 pt-6">
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Análise por Tipo</h3>
              <p className="text-muted-foreground text-sm">Em implementação...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="valor" className="space-y-6 pt-6">
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Análise por Valor</h3>
              <p className="text-muted-foreground text-sm">Em implementação...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fornecedor" className="space-y-6 pt-6">
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Análise por Fornecedor</h3>
              <p className="text-muted-foreground text-sm">Em implementação...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-6 pt-6">
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Análise Temporal</h3>
              <p className="text-muted-foreground text-sm">Em implementação...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
