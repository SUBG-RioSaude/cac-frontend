import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface LayoutPaginaProps {
  children: ReactNode
  titulo?: string
  descricao?: string
  className?: string
}

/**
 * Componente de layout padrão para todas as páginas do sistema.
 * Fornece um container responsivo com largura máxima e espaçamento consistente.
 */
const LayoutPagina = ({
  children,
  titulo,
  descricao,
  className,
}: LayoutPaginaProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho da página (opcional) */}
      {(titulo ?? descricao) && (
        <div className="space-y-2">
          {titulo && (
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {titulo}
            </h1>
          )}
          {descricao && <p className="text-sm text-gray-600 dark:text-gray-300">{descricao}</p>}
        </div>
      )}

      {/* Conteúdo da página */}
      <div className="space-y-6">{children}</div>
    </div>
  )
}

export default LayoutPagina
