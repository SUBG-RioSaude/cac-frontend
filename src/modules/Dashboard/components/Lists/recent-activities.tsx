import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  FileSignature,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// TODO: Substituir por dados reais da API
const activities = [
  {
    id: 1,
    type: 'created',
    title: 'Novo contrato criado',
    description: 'CT-2024-1284 - Contrato de Serviços de TI',
    user: 'Maria Silva',
    timestamp: 'há 2 horas',
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 2,
    type: 'approved',
    title: 'Contrato aprovado',
    description: 'CT-2024-1283 - Fornecimento de Equipamentos',
    user: 'João Santos',
    timestamp: 'há 4 horas',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    type: 'expiring',
    title: 'Alerta de vencimento',
    description: 'CT-2024-0892 vence em 15 dias',
    user: 'Sistema',
    timestamp: 'há 5 horas',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 4,
    type: 'signed',
    title: 'Contrato assinado',
    description: 'CT-2024-1282 - Consultoria Empresarial',
    user: 'Ana Costa',
    timestamp: 'há 6 horas',
    icon: FileSignature,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 5,
    type: 'review',
    title: 'Aguardando revisão',
    description: 'CT-2024-1281 - Locação de Imóvel Comercial',
    user: 'Carlos Oliveira',
    timestamp: 'há 8 horas',
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  {
    id: 6,
    type: 'approved',
    title: 'Aprovação de renovação',
    description: 'CT-2024-0745 renovado por mais 12 meses',
    user: 'Pedro Almeida',
    timestamp: 'há 10 horas',
    icon: UserCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
]

export const RecentActivities = () => {
  return (
    <Card className="bg-card flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">Atividades Recentes</CardTitle>
        <CardDescription>Últimas ações e eventos do sistema</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 space-y-3 overflow-y-auto">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="border-border bg-muted/30 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${activity.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-foreground text-sm leading-none font-medium">
                        {activity.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    por <span className="font-medium">{activity.user}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
