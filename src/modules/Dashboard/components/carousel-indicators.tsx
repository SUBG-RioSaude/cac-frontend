import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface CarouselIndicatorsProps {
  total: number
  current: number
  onSelect: (index: number) => void
  className?: string
}

/**
 * Indicadores visuais (bolinhas) para o carousel do dashboard
 *
 * Features:
 * - Animação suave ao trocar de slide
 * - Clicável para navegar direto
 * - Destaque visual do slide ativo
 * - Responsivo e acessível
 */
export const CarouselIndicators = ({
  total,
  current,
  onSelect,
  className,
}: CarouselIndicatorsProps) => {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 py-4', className)}
      role="tablist"
      aria-label="Indicadores de slides do carousel"
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = current === index

        return (
          <button
            key={index}
            role="tab"
            aria-selected={isActive}
            aria-label={`Ir para slide ${index + 1} de ${total}`}
            onClick={() => onSelect(index)}
            className={cn(
              'relative h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
              isActive
                ? 'w-8 bg-[#42b9eb] focus:ring-[#42b9eb]'
                : 'w-2 bg-muted hover:bg-muted-foreground/50',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="activeIndicator"
                className="absolute inset-0 rounded-full bg-[#42b9eb]"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <span className="sr-only">
              {isActive ? `Slide atual: ${index + 1}` : `Slide ${index + 1}`}
            </span>
          </button>
        )
      })}
    </div>
  )
}
