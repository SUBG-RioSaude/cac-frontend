import { useRef, useCallback, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Send, Smile, AlertCircle, X } from 'lucide-react'

interface ChatInputProps {
  valor: string
  onChange: (input: string) => void
  onEnviar: () => void
  isLoading?: boolean
  placeholder?: string
  maxLength?: number
  mensagemRespondendo?: {
    id: string
    remetente: string
    conteudo: string
  }
  onCancelarResposta?: () => void
  className?: string
}

export function ChatInput({
  valor,
  onChange,
  onEnviar,
  isLoading = false,
  placeholder = 'Digite sua mensagem...',
  maxLength = 2000,
  mensagemRespondendo,
  onCancelarResposta,
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (valor.trim() && !isLoading) {
          onEnviar()
        }
      }
    },
    [valor, isLoading, onEnviar],
  )

  const isEnviarDisabilitado = !valor.trim() || isLoading

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mensagem sendo respondida */}
      <AnimatePresence>
        {mensagemRespondendo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">
                      Respondendo para {mensagemRespondendo.remetente}
                    </p>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {mensagemRespondendo.conteudo}
                    </p>
                  </div>
                  {onCancelarResposta && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={onCancelarResposta}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de input principal */}
      <div className="relative rounded-lg border transition-colors focus-within:border-blue-500">
        <div className="flex items-end gap-2 p-3">
          {/* Botão de emoji (desabilitado por enquanto) */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
              title="Emojis (em breve)"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Textarea */}
          <div className="min-w-0 flex-1">
            <Textarea
              ref={textareaRef}
              value={valor}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="max-h-32 min-h-[20px] resize-none border-0 p-0 text-sm focus-visible:ring-0"
              maxLength={maxLength}
            />

            {/* Contador de caracteres */}
            <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {valor.length > maxLength * 0.8 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{maxLength - valor.length} restantes</span>
                  </div>
                )}
              </div>

              <span
                className={cn(
                  valor.length > maxLength * 0.9 && 'text-orange-600',
                  valor.length >= maxLength && 'text-red-600',
                )}
              >
                {valor.length}/{maxLength}
              </span>
            </div>
          </div>

          {/* Botão de enviar */}
          <Button
            size="sm"
            onClick={onEnviar}
            disabled={isEnviarDisabilitado}
            className="h-8 w-8 shrink-0 p-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Dica de uso */}
      <div className="text-muted-foreground text-xs">
        <span>Enter para enviar, Shift+Enter para nova linha</span>
      </div>
    </div>
  )
}
