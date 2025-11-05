/**
 * Aba Riscos - Gestão de Riscos
 *
 * Exibe:
 * - Cards de resumo por nível de risco
 * - Timeline de vencimentos (90 dias)
 * - Lista de ações prioritárias
 * - Documentação pendente
 */

import { RiskAnalysis } from '../Lists'

interface RisksTabProps {
  isLoading: boolean
}

export const RisksTab = ({ isLoading }: RisksTabProps) => {
  return (
    <div className="space-y-6">
      {/* Análise de Riscos Detalhada */}
      <RiskAnalysis detailed isLoading={isLoading} />

      {/* Timeline de Vencimentos (placeholder) */}
      <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Timeline de Vencimentos</h3>
          <p className="text-muted-foreground text-sm">
            Próximos 90 dias - Em implementação...
          </p>
        </div>
      </div>

      {/* Ações Prioritárias (placeholder) */}
      <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Ações Prioritárias</h3>
          <p className="text-muted-foreground text-sm">Em implementação...</p>
        </div>
      </div>
    </div>
  )
}
