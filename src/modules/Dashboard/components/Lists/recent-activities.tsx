import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  FileSignature,
  FileX,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { DashboardActivity } from '../../types/dashboard'

interface RecentActivitiesProps {
  activities?: DashboardActivity[] | null
  isLoading?: boolean
}

// Mapeamento de ícones por tipo de atividade
const activityIcons: Record<string, LucideIcon> = {
  created: FileText,
  approved: CheckCircle2,
  expiring: AlertCircle,
  signed: FileSignature,
  review: Clock,
  renewed: UserCheck,
}

// Configuração de cores por tipo
const activityColors: Record<
  string,
  { color: string; bgColor: string }
> = {
  created: { color: 'text-primary', bgColor: 'bg-primary/10' },
  approved: { color: 'text-green-600', bgColor: 'bg-green-50' },
  expiring: { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  signed: { color: 'text-primary', bgColor: 'bg-primary/10' },
  review: { color: 'text-muted-foreground', bgColor: 'bg-muted' },
  renewed: { color: 'text-green-600', bgColor: 'bg-green-50' },
}

export const RecentActivities = ({
  activities,
  isLoading = false,
}: RecentActivitiesProps) => {
  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-lg">
            Atividades Recentes
          </CardTitle>
          <CardDescription>Carregando atividades...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="min-w-0 space-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="min-w-0 flex items-center gap-3 rounded-lg border p-3"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-lg">
            Atividades Recentes
          </CardTitle>
          <CardDescription>Últimas ações e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
          <div className="text-muted-foreground flex flex-col items-center justify-center text-center">
            <FileX className="mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="bg-card flex h-[590px] w-full min-w-0 flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-lg">
          Atividades Recentes
        </CardTitle>
        <CardDescription>Últimas ações e eventos do sistema</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-4">
        <div className="min-w-0 space-y-2.5">
          {activities.slice(0, 6).map((activity) => {
            const Icon = activityIcons[activity.tipo] || FileText
            const colors = activityColors[activity.tipo] || {
              color: 'text-primary',
              bgColor: 'bg-primary/10',
            }

            return (
              <div
                key={activity.id}
                className="border-border bg-muted/30 hover:bg-muted/50 min-w-0 flex items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${colors.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground line-clamp-2 leading-snug text-sm font-medium">
                        {activity.titulo}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {activity.descricao}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 whitespace-nowrap text-xs">
                      {activity.dataHora}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
