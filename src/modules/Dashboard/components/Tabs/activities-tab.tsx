/**
 * Aba Atividades - Histórico
 *
 * Timeline de atividades recentes:
 * - Novos contratos cadastrados
 * - Contratos aprovados/atualizados
 * - Contratos cancelados
 * - Infinite scroll ou paginação
 */

import { RecentActivities } from '../Lists'

export const ActivitiesTab = () => {
  return (
    <div className="space-y-6">
      {/* Timeline de Atividades */}
      <RecentActivities />

      {/* Placeholder para paginação futura */}
      <div className="flex justify-center">
        <p className="text-muted-foreground text-sm">
          Scroll ou paginação será implementado em breve
        </p>
      </div>
    </div>
  )
}
