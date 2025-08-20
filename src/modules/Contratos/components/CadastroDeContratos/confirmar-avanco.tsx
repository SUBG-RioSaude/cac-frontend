import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
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

export default function ConfirmarAvancoModal({
  aberto,
  onConfirmar,
  onCancelar,
  titulo = 'Confirmar Avanço',
  descricao = 'Tem certeza que deseja avançar para a próxima etapa? Esta ação não poderá ser desfeita.',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
}: ConfirmarAvancoModalProps) {
  useEffect(() => {
    // Previne scroll da página quando modal estiver aberto
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [aberto])

  if (!aberto) return null

  const isFinalizacao = textoConfirmar.toLowerCase().includes('finalizar')

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay com blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancelar}
      />
      
      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isFinalizacao
                  ? 'bg-green-100 text-green-600'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
              <p className="text-sm text-gray-500">
                {isFinalizacao
                  ? 'Confirme para finalizar o cadastro'
                  : 'Confirme para prosseguir'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-700">{descricao}</p>

          {/* Aviso de atenção */}
          <div className="flex items-start space-x-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Atenção</p>
              <p className="text-xs text-amber-700">
                {isFinalizacao
                  ? 'Os dados serão salvos permanentemente.'
                  : 'Não será possível retornar à etapa anterior.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium"
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
              'px-4 py-2 text-sm font-medium',
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
