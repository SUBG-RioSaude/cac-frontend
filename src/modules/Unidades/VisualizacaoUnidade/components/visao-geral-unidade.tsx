import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Hash, Users } from 'lucide-react'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface VisaoGeralUnidadeProps {
  unidade: UnidadeSaudeApi
}

export function VisaoGeralUnidade({ unidade }: VisaoGeralUnidadeProps) {
  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
        Inativo
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="font-medium">{unidade.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sigla</label>
              <p className="font-mono text-sm">{unidade.sigla || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {getStatusBadge(unidade.ativo)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID</label>
              <p className="font-mono text-xs text-muted-foreground">{unidade.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do CAP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            CAP (Centro de Atenção Primária)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome do CAP</label>
              <p className="font-medium">{unidade.cap.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID do CAP</label>
              <p className="font-mono text-xs text-muted-foreground">{unidade.cap.id}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">UO do CAP</label>
              <p className="font-mono text-sm">{unidade.cap.uo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status do CAP</label>
              <div className="mt-1">
                {getStatusBadge(unidade.cap.ativo)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Códigos e Identificadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Códigos e Identificadores
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">UA</label>
            <p className="font-mono text-sm">{unidade.ua || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">UO</label>
            <p className="font-mono text-sm">{unidade.uo || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">UG</label>
            <p className="font-mono text-sm">{unidade.ug || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">CNES</label>
            <p className="font-mono text-sm">{unidade.cnes || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">AP</label>
            <p className="font-mono text-sm">{unidade.ap || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Subsecretaria</label>
            <p className="font-mono text-sm">{unidade.subsecretaria || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}