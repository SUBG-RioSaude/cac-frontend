import { FileText, Calendar, DollarSign } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// TODO: Substituir por dados reais da API
const recentContracts = [
  {
    id: 'CT-2024-1284',
    title: 'Contrato de Serviços de TI',
    company: 'Tech Solutions Ltda',
    value: 'R$ 125.000,00',
    date: '15/12/2024',
    status: 'ativo' as const,
  },
  {
    id: 'CT-2024-1283',
    title: 'Fornecimento de Equipamentos',
    company: 'Equipamentos Pro S.A.',
    value: 'R$ 89.500,00',
    date: '14/12/2024',
    status: 'ativo' as const,
  },
  {
    id: 'CT-2024-1282',
    title: 'Consultoria Empresarial',
    company: 'Consultores Associados',
    value: 'R$ 45.000,00',
    date: '13/12/2024',
    status: 'pendente' as const,
  },
  {
    id: 'CT-2024-1281',
    title: 'Locação de Imóvel Comercial',
    company: 'Imobiliária Central',
    value: 'R$ 12.000,00',
    date: '12/12/2024',
    status: 'ativo' as const,
  },
  {
    id: 'CT-2024-1280',
    title: 'Manutenção Predial',
    company: 'Manutenções Express',
    value: 'R$ 28.750,00',
    date: '11/12/2024',
    status: 'ativo' as const,
  },
]

const statusConfig = {
  ativo: { label: 'Ativo', variant: 'default' as const },
  pendente: { label: 'Pendente', variant: 'secondary' as const },
}

export const RecentContracts = () => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Contratos Recentes</CardTitle>
        <CardDescription>Últimos 5 contratos formalizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentContracts.map((contract) => (
            <div
              key={contract.id}
              className="border-border bg-muted/30 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-foreground text-sm leading-none font-medium">
                      {contract.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {contract.company}
                    </p>
                  </div>
                  <Badge variant={statusConfig[contract.status].variant}>
                    {statusConfig[contract.status].label}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{contract.value}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{contract.date}</span>
                  </div>
                  <span className="text-muted-foreground/70">
                    {contract.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
