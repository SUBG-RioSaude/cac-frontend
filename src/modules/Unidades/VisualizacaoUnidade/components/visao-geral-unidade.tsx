import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnidadeStatusBadge } from '@/components/ui/status-badge'
import { Building, Hash, Users } from 'lucide-react'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface VisaoGeralUnidadeProps {
  unidade: UnidadeSaudeApi
}

export function VisaoGeralUnidade({ unidade }: VisaoGeralUnidadeProps) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="text-primary h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Nome
              </label>
              <p className="font-medium">{unidade.nome}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Sigla
              </label>
              <p className="font-mono text-sm">{unidade.sigla || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Status
              </label>
              <div className="mt-1">
                <UnidadeStatusBadge
                  status={unidade.ativo ? 'ativo' : 'inativo'}
                />
              </div>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                ID
              </label>
              <p className="text-muted-foreground font-mono text-xs">
                {unidade.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do CAP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary h-5 w-5" />
            CAP (Centro de Atenção Primária)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Nome do CAP
              </label>
              <p className="font-medium">{unidade.cap.nome}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                ID do CAP
              </label>
              <p className="text-muted-foreground font-mono text-xs">
                {unidade.cap.id}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                UO do CAP
              </label>
              <p className="font-mono text-sm">{unidade.cap.uo}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Status do CAP
              </label>
              <div className="mt-1">
                <UnidadeStatusBadge
                  status={unidade.cap.ativo ? 'ativo' : 'inativo'}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Códigos e Identificadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="text-primary h-5 w-5" />
            Códigos e Identificadores
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              UA
            </label>
            <p className="font-mono text-sm">{unidade.ua || 'N/A'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              UO
            </label>
            <p className="font-mono text-sm">{unidade.uo || 'N/A'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              UG
            </label>
            <p className="font-mono text-sm">{unidade.ug || 'N/A'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              CNES
            </label>
            <p className="font-mono text-sm">{unidade.cnes || 'N/A'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              AP
            </label>
            <p className="font-mono text-sm">{unidade.ap || 'N/A'}</p>
          </div>
          <div>
            <label className="text-muted-foreground text-sm font-medium">
              Subsecretaria
            </label>
            <p className="font-mono text-sm">
              {unidade.subsecretaria || 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
