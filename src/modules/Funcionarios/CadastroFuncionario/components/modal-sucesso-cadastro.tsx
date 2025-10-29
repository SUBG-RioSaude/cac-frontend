import { CheckCircle, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalSucessoCadastroProps {
  isOpen: boolean
  funcionario: {
    nomeCompleto: string
    matricula: string
  }
  onConfirm: () => void
}

export const ModalSucessoCadastro = ({
  isOpen,
  funcionario,
  onConfirm,
}: ModalSucessoCadastroProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onConfirm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle>Funcionário Cadastrado!</DialogTitle>
              <DialogDescription>
                O cadastro foi realizado com sucesso
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/50 space-y-2 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{funcionario.nomeCompleto}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            Matrícula: {funcionario.matricula}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm} className="w-full">
            Ir para Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
