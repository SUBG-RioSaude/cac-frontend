import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'


interface ConfirmEditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (justification?: string) => Promise<void>
  fieldLabel: string
  oldValue: string | number
  newValue: string | number
  isLoading?: boolean
  isCritical?: boolean
  formatValue?: (value: string | number) => string
}

export const ConfirmEditModal = ({
  isOpen,
  onClose,
  onConfirm,
  fieldLabel,
  oldValue,
  newValue,
  isLoading = false,
  isCritical = false,
  formatValue = (value) => String(value),
}: ConfirmEditModalProps) => {
  const [justification, setJustification] = useState('')

  const handleConfirm = async () => {
    try {
      await onConfirm(justification)
      setJustification('')
    } catch {
      // Error handling será feito pelo componente pai
    }
  }

  const handleClose = () => {
    setJustification('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCritical && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            Confirmar Alteração
          </DialogTitle>
          <DialogDescription>
            Você está prestes a alterar o campo <strong>{fieldLabel}</strong>.
            {isCritical && (
              <span className="mt-2 block font-medium text-amber-600">
                ⚠️ Esta é uma alteração crítica que pode impactar o contrato.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparação de valores */}
          <div className="bg-muted space-y-3 rounded-lg p-4">
            <div>
              <Label className="text-muted-foreground text-sm font-medium">
                Valor Atual:
              </Label>
              <p className="bg-background mt-1 rounded border px-2 py-1 font-mono text-sm">
                {formatValue(oldValue)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm font-medium">
                Novo Valor:
              </Label>
              <p className="bg-background mt-1 rounded border border-blue-200 px-2 py-1 font-mono text-sm text-blue-700">
                {formatValue(newValue)}
              </p>
            </div>
          </div>

          {/* Campo de justificativa */}
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm font-medium">
              Justificativa {isCritical ? '(obrigatória)' : '(opcional)'}
            </Label>
            <Textarea
              id="justification"
              placeholder={
                isCritical
                  ? 'Explique o motivo desta alteração crítica...'
                  : 'Descreva o motivo da alteração (opcional)...'
              }
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={() => { void handleConfirm() }}
            disabled={isLoading || (isCritical && !justification.trim())}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar Alteração'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
