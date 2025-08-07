import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

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
  console.log('🚀 ConfirmarAvancoModal renderizado - aberto:', aberto)

  useEffect(() => {
    console.log(
      '🚀 ConfirmarAvancoModal useEffect - aberto mudou para:',
      aberto,
    )
  }, [aberto])

  if (!aberto) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="animate-in fade-in-0 fixed inset-0 z-50 bg-black/50"
        onClick={onCancelar}
      />
      {/* Modal */}
      <div className="animate-in fade-in-0 zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{descricao}</p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Atenção</p>
            <p className="mt-1 text-yellow-700">
              Após confirmar o avanço, não será possível retornar à etapa
              anterior.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancelar} className="flex-1">
            {textoCancelar}
          </Button>
          <Button
            onClick={onConfirmar}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </>
  )
}
