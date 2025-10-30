import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterSearchBarProps {
  searchTerm: string
  onSearchTermChange: (term: string) => void
  onClearSearch: () => void
  placeholder?: string
  showMinCharactersWarning?: boolean
  minCharacters?: number
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
            className="mt-2 flex items-center gap-2 text-sm text-yellow-600"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Digite pelo menos {minCharacters} caracteres para pesquisar</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
