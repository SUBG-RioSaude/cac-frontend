import { CheckCircle, User, Mail, KeyRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

interface ModalSucessoCadastroProps {
  isOpen: boolean
  funcionario: FuncionarioApi | { nomeCompleto: string; matricula: string }
  usuarioId?: string
  onConfirm?: () => void
  onClose?: () => void
}

export const ModalSucessoCadastro = ({
  isOpen,
  funcionario,
  usuarioId,
  onConfirm,
  onClose,
}: ModalSucessoCadastroProps) => {
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else if (onConfirm) {
      onConfirm()
    }
  }

  const isFuncionarioApi = 'emailInstitucional' in funcionario
  const showAccessInfo = usuarioId && isFuncionarioApi
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle>
                {showAccessInfo ? 'Cadastro Completo!' : 'Funcionário Cadastrado!'}
              </DialogTitle>
              <DialogDescription>
                {showAccessInfo
                  ? 'Funcionário, usuário e permissão de acesso criados com sucesso'
                  : 'O cadastro foi realizado com sucesso'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Funcionário */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Dados do Funcionário</h4>
            <div className="bg-muted/50 space-y-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{funcionario.nomeCompleto}</span>
              </div>
              <div className="text-muted-foreground text-sm">
                Matrícula: {funcionario.matricula}
              </div>
            </div>
          </div>

          {/* Informações de Acesso (apenas no wizard) */}
          {showAccessInfo && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Acesso ao Sistema</h4>
                <div className="bg-primary/5 space-y-3 rounded-lg border border-primary/20 p-4">
                  <div className="flex items-start gap-2">
                    <Mail className="text-primary mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Senha provisória enviada</p>
                      <p className="text-muted-foreground text-sm">
                        {isFuncionarioApi && funcionario.emailInstitucional}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <KeyRound className="text-primary mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">ID do Usuário</p>
                      <p className="text-muted-foreground font-mono text-xs">{usuarioId}</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 mt-3 rounded-md border border-yellow-200 dark:border-yellow-900 p-3">
                    <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                      O funcionário receberá um email com instruções para ativar sua conta e
                      criar uma senha permanente.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            Ir para Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
