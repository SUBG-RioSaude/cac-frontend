import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CarouselIndicators } from './carousel-indicators'

interface DashboardCarouselProps {
  slides: ReactNode[]
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

/**
 * Carousel principal do Dashboard
 *
 * Exibe seções completas em slides:
 * - SLIDE 1: Métricas Executivas (4 cards)
 * - SLIDE 2: Gráfico de Tendência
 * - SLIDE 3: Alertas Críticos
 * - SLIDE 4: Top 5 Contratos
 *
 * Features:
 * - Navegação por setas ou indicadores
 * - Auto-play opcional (pausa no hover)
 * - Animações suaves (Framer Motion)
 * - Keyboard navigation (arrow keys)
 * - Touch-friendly (mobile)
 */
export const DashboardCarousel = ({
  slides,
  autoPlay = false,
  autoPlayInterval = 5000,
  className,
}: DashboardCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const totalSlides = slides.length

  // Navegar para próximo slide
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  // Navegar para slide anterior
  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Navegar para slide específico
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused) return

    const interval = setInterval(goToNext, autoPlayInterval)

    return () => {
      clearInterval(interval)
    }
  }, [autoPlay, autoPlayInterval, isPaused, goToNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToNext, goToPrev])

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel do dashboard"
    >
      {/* Container dos slides */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} de ${totalSlides}`}
              aria-hidden={currentSlide !== index}
            >
              {slide}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Botão Anterior */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background sm:left-4"
        onClick={goToPrev}
        disabled={totalSlides <= 1}
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Botão Próximo */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-background/80 shadow-lg backdrop-blur-sm hover:bg-background sm:right-4"
        onClick={goToNext}
        disabled={totalSlides <= 1}
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Indicadores (bolinhas) */}
      {totalSlides > 1 && (
        <CarouselIndicators
          total={totalSlides}
          current={currentSlide}
          onSelect={goToSlide}
        />
      )}

      {/* Indicador de auto-play */}
      {autoPlay && (
        <div className="absolute bottom-20 right-4 text-xs text-muted-foreground">
          {isPaused ? 'Pausado' : 'Reproduzindo'}
        </div>
      )}
    </div>
  )
}
