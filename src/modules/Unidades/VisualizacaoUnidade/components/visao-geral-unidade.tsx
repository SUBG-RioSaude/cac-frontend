import { Building, Hash, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UnidadeStatusBadge } from '@/components/ui/status-badge'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface VisaoGeralUnidadeProps {
  unidade: UnidadeSaudeApi
}

export const VisaoGeralUnidade = ({ unidade }: VisaoGeralUnidadeProps) => {
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
              <span className="text-muted-foreground text-sm font-medium">
                Nome
              </span>
              <p className="font-medium">{unidade.nome}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                Sigla
              </span>
              <p className="font-mono text-sm">{unidade.sigla ?? 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                Status
              </span>
              <div className="mt-1">
                <UnidadeStatusBadge
                  status={unidade.ativo ? 'ativo' : 'inativo'}
                />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                ID
              </span>
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
              <span className="text-muted-foreground text-sm font-medium">
                Nome do CAP
              </span>
              <p className="font-medium">{unidade.cap.nome}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                ID do CAP
              </span>
              <p className="text-muted-foreground font-mono text-xs">
                {unidade.cap.id}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                UO do CAP
              </span>
              <p className="font-mono text-sm">{unidade.cap.uo}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm font-medium">
                Status do CAP
              </span>
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
            <span className="text-muted-foreground text-sm font-medium">
              UA
            </span>
            <p className="font-mono text-sm">{unidade.ua ?? 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              UO
            </span>
            <p className="font-mono text-sm">{unidade.uo ?? 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              UG
            </span>
            <p className="font-mono text-sm">{unidade.ug ?? 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              CNES
            </span>
            <p className="font-mono text-sm">{unidade.cnes ?? 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              AP
            </span>
            <p className="font-mono text-sm">{unidade.ap ?? 'N/A'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-sm font-medium">
              Subsecretaria
            </span>
            <p className="font-mono text-sm">
              {unidade.subsecretaria ?? 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
