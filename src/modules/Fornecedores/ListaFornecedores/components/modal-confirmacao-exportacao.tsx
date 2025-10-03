import { AlertTriangle, FileDown, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ModalConfirmacaoExportacaoProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  totalFornecedores: number
}

export const ModalConfirmacaoExportacao = ({
  isOpen,
  onClose,
  onConfirm,
  totalFornecedores,
}: ModalConfirmacaoExportacaoProps) => {
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Overlay com data-testid para testes */}
      <div
        data-testid="modal-overlay"
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fechar modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          role="dialog"
          className="animate-in fade-in-0 zoom-in-95 z-50 w-full max-w-md rounded-lg border bg-white p-6 shadow-xl"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle
                  className="h-5 w-5 text-orange-600"
                  data-testid="icon-alert"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Confirmar Exportação</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Você está prestes a exportar todos os fornecedores.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6 space-y-4">
            <p className="text-muted-foreground text-sm">
              Esta ação irá gerar um arquivo CSV com todos os dados dos
              fornecedores listados.
            </p>

            <div className="bg-muted/50 space-y-2 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total de fornecedores: {totalFornecedores}{' '}
                  {totalFornecedores === 1 ? 'fornecedor' : 'fornecedores'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Formato:</span>
                <span className="font-semibold">CSV</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              Esta ação pode levar alguns segundos dependendo da quantidade de
              dados.
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <FileDown className="mr-2 h-4 w-4" data-testid="icon-download" />
              Confirmar
            </Button>
          </div>

          {/* Botão X para fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
