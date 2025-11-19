import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Info } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterSearchBarProps {
  searchTerm: string
  onSearchTermChange: (term: string) => void
  onClearSearch: () => void
  placeholder?: string
  showMinCharactersWarning?: boolean
  minCharacters?: number
  totalResults?: number
  isSearching?: boolean
  resultLabel?: string
}

/**
 * Barra de pesquisa com animações e feedback visual
 */
export const FilterSearchBar = ({
  searchTerm,
  onSearchTermChange,
  onClearSearch,
  placeholder = 'Pesquisar...',
  showMinCharactersWarning = false,
  minCharacters = 0,
  totalResults,
  isSearching = false,
  resultLabel = 'resultados',
}: FilterSearchBarProps) => {
  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="focus:border-primary h-10 border-2 pr-10 pl-10 shadow-sm transition-all duration-200 sm:h-11"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="hover:bg-muted absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Aviso de mínimo de caracteres */}
      <AnimatePresence>
        {showMinCharactersWarning && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground bg-background/95 absolute top-full left-0 z-10 mt-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm backdrop-blur-sm"
          >
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              Digite pelo menos {minCharacters} caracteres para pesquisar
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de resultados */}
      <AnimatePresence>
        {searchTerm.trim().length >= minCharacters &&
          minCharacters > 0 &&
          totalResults !== undefined &&
          !isSearching &&
          !showMinCharactersWarning && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 z-10 mt-1"
            >
              <Badge variant="secondary" className="text-xs shadow-sm">
                {totalResults}{' '}
                {totalResults === 1
                  ? resultLabel.replace(/s$/, '')
                  : resultLabel}
              </Badge>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  )
}
