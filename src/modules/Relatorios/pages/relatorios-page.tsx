import { useState } from 'react'
import { FileText, History, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsCAC, TabsContentCAC, TabsListCAC, TabsTriggerCAC } from '../components/tabs-customizadas'
import { GerarRelatorioForm } from '../components/FiltroRelatorios/filtro-relatorios-form'
import { TabelaHistorico } from '../components/HistoricoRelatorios/tabela-historico'

/**
 * Página principal do módulo de Relatórios
 * Estrutura com 3 abas: Gerar | Histórico | Agendados
 */
export const RelatoriosPage = () => {
  const [abaAtiva, setAbaAtiva] = useState<'gerar' | 'historico' | 'agendados'>('gerar')

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Cabeçalho com cores CAC */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2a688f]">Relatórios Contratuais</h1>
            <p className="text-slate-600 mt-1">
              Gere relatórios profissionais em PDF com dados completos dos contratos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <TabsCAC
          value={abaAtiva}
          onValueChange={(value) => setAbaAtiva(value as typeof abaAtiva)}
          className="w-full"
        >
          <TabsListCAC className="grid w-full max-w-md grid-cols-3">
            <TabsTriggerCAC value="gerar">
              <FileText className="h-4 w-4" />
              <span>Gerar</span>
            </TabsTriggerCAC>
            <TabsTriggerCAC value="historico">
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </TabsTriggerCAC>
            <TabsTriggerCAC value="agendados" disabled>
              <Calendar className="h-4 w-4" />
              <span>Agendados</span>
            </TabsTriggerCAC>
          </TabsListCAC>

          {/* Aba: Gerar Relatório */}
          <TabsContentCAC value="gerar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Novo Relatório</CardTitle>
                <CardDescription>
                  Selecione o tipo de relatório, configure os filtros e gere seu documento em PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerarRelatorioForm />
              </CardContent>
            </Card>
          </TabsContentCAC>

          {/* Aba: Histórico */}
          <TabsContentCAC value="historico" className="mt-6">
            <TabelaHistorico />
          </TabsContentCAC>

          {/* Aba: Agendados (futuro) */}
          <TabsContentCAC value="agendados" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Agendados</CardTitle>
                <CardDescription>
                  Configure geração automática periódica de relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
                  <div className="text-center">
                    <Calendar className="text-muted-foreground mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Funcionalidade em Breve</h3>
                    <p className="text-muted-foreground mt-2 text-sm max-w-sm">
                      A funcionalidade de agendamento estará disponível em uma próxima versão
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContentCAC>
        </TabsCAC>
      </motion.div>
    </div>
  )
}
