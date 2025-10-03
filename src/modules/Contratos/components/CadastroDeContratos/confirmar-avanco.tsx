import { CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmarAvancoModalProps {
  aberto: boolean
  onConfirmar: () => void
  onCancelar: () => void
  titulo?: string
  descricao?: string
  textoConfirmar?: string
  textoCancelar?: string
}

const ConfirmarAvancoModal = ({
  aberto,
  onConfirmar,
  onCancelar,
  titulo = 'Confirmar Avanço',
  descricao = 'Tem certeza que deseja avançar para a próxima etapa? Esta ação não poderá ser desfeita.',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
}: ConfirmarAvancoModalProps) => {
  useEffect(() => {
    // Previne scroll da página quando modal estiver aberto
    if (aberto) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = ''
      document.body.style.width = ''
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [aberto])

  if (!aberto) return null

  const isFinalizacao = textoConfirmar.toLowerCase().includes('finalizar')

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen items-center justify-center p-4 md:p-8">
      {/* Overlay com blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancelar}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCancelar()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fechar modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg',
                isFinalizacao
                  ? 'bg-green-100 text-green-600'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{titulo}</h2>
              <p className="text-base text-gray-500">
                {isFinalizacao
                  ? 'Confirme para finalizar o cadastro'
                  : 'Confirme para prosseguir'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 px-8 py-6">
          <p className="text-base leading-relaxed text-gray-700">{descricao}</p>

          {/* Aviso de atenção */}
          <div className="flex items-start space-x-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-base font-medium text-amber-800">Atenção</p>
              <p className="text-sm text-amber-700">
                {isFinalizacao
                  ? 'Os dados serão salvos permanentemente.'
                  : 'Não será possível retornar à etapa anterior.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 border-t border-gray-100 px-8 py-6">
          <Button
            variant="outline"
            onClick={onCancelar}
            className="px-6 py-3 text-base font-medium"
          >
            {textoCancelar}
          </Button>
          <Button
            onClick={() => {
              // Rola a página para o topo antes de confirmar
              window.scrollTo({ top: 0, behavior: 'smooth' })
              onConfirmar()
            }}
            className={cn(
              'px-6 py-3 text-base font-medium',
              isFinalizacao
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-slate-700 hover:bg-slate-600',
            )}
          >
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmarAvancoModal
