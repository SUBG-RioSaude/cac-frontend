import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, FileDown } from 'lucide-react'

interface ModalConfirmacaoExportacaoProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalFornecedores: number
}

export function ModalConfirmacaoExportacao({
  isOpen,
  onClose,
  onConfirm,
  totalFornecedores,
}: ModalConfirmacaoExportacaoProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Confirmar Exportação</DialogTitle>
              <DialogDescription className="mt-1">
                Você está prestes a exportar todos os fornecedores
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 space-y-2 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total de fornecedores:
              </span>
              <span className="font-semibold">
                {totalFornecedores.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Formato:</span>
              <span className="font-semibold">CSV</span>
            </div>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            Esta ação pode levar alguns segundos dependendo da quantidade de
            dados.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exportar Todos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
