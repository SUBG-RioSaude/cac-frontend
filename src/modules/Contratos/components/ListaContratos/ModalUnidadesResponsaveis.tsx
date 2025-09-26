import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Building2, Shield, Users } from 'lucide-react'
import type { UnidadeResponsavel } from '@/modules/Contratos/types/contrato'

interface ModalUnidadesResponsaveisProps {
  isOpen: boolean
  onClose: () => void
  unidades: UnidadeResponsavel[]
  numeroContrato: string
}

export function ModalUnidadesResponsaveis({
  isOpen,
  onClose,
  unidades,
  numeroContrato,
}: ModalUnidadesResponsaveisProps) {
  const demandantes = unidades.filter(u => u.tipoResponsabilidade === 1 && u.ativo)
  const gestoras = unidades.filter(u => u.tipoResponsabilidade === 2 && u.ativo)

  const totalUnidades = demandantes.length + gestoras.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Unidades Responsáveis</DialogTitle>
              <DialogDescription>
                Contrato: {numeroContrato}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de unidades:</span>
              <span className="font-semibold">{totalUnidades}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Demandantes • Gestoras:</span>
              <span className="font-semibold">{demandantes.length} • {gestoras.length}</span>
            </div>
          </div>

          {/* Unidades Demandantes */}
          {demandantes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">Unidades Demandantes</h3>
                <Badge variant="secondary" className="text-xs">
                  {demandantes.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {demandantes.map((unidade) => (
                  <div
                    key={unidade.id}
                    className="border rounded-lg p-3 bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {unidade.unidadeSaudeNome}
                          </span>
                          {unidade.principal && (
                            <Badge variant="default" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        {unidade.observacoes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {unidade.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unidades Gestoras */}
          {gestoras.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Unidades Gestoras</h3>
                <Badge variant="secondary" className="text-xs">
                  {gestoras.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {gestoras.map((unidade) => (
                  <div
                    key={unidade.id}
                    className="border rounded-lg p-3 bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {unidade.unidadeSaudeNome}
                          </span>
                          {unidade.principal && (
                            <Badge variant="default" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        {unidade.observacoes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {unidade.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {totalUnidades === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhuma unidade responsável cadastrada para este contrato.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}