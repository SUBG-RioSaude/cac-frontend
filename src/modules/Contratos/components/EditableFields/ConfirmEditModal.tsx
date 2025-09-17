import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

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

export function ConfirmEditModal({
  isOpen,
  onClose,
  onConfirm,
  fieldLabel,
  oldValue,
  newValue,
  isLoading = false,
  isCritical = false,
  formatValue = (value) => String(value)
}: ConfirmEditModalProps) {
  const [justification, setJustification] = useState('')

  const handleConfirm = async () => {
    try {
      await onConfirm(justification)
      setJustification('')
    } catch (error) {
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
              <span className="block mt-2 text-amber-600 font-medium">
                ⚠️ Esta é uma alteração crítica que pode impactar o contrato.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comparação de valores */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Valor Atual:
              </Label>
              <p className="mt-1 font-mono text-sm bg-background rounded px-2 py-1 border">
                {formatValue(oldValue)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Novo Valor:
              </Label>
              <p className="mt-1 font-mono text-sm bg-background rounded px-2 py-1 border border-blue-200 text-blue-700">
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
                  ? "Explique o motivo desta alteração crítica..."
                  : "Descreva o motivo da alteração (opcional)..."
              }
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isLoading || 
              (isCritical && !justification.trim())
            }
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
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