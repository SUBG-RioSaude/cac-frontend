import type { LucideIcon } from 'lucide-react'

/**
 * Props principais do componente AdvancedFilters
 * @template TFilters - Tipo dos filtros específicos do módulo
 */
export interface AdvancedFiltersProps<TFilters extends Record<string, any>> {
  // Estado controlado
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters) => void
  onLimparFiltros: () => void

  // Configuração de pesquisa
  searchConfig?: SearchConfig<TFilters>

  // Seções de filtro dinâmicas
  filterSections: FilterSection<TFilters>[]

  // Layout e comportamento
  layoutMode?: 'dropdown' | 'popover' | 'inline'
  mobileMode?: 'sheet' | 'drawer'
  showActiveFiltersCount?: boolean

  // Estado de loading
  isLoading?: boolean
  totalResults?: number

  // Acessibilidade
  ariaLabel?: string
}

/**
 * Configuração da barra de pesquisa
 */
export interface SearchConfig<TFilters> {
  placeholder?: string
  debounceMs?: number
  minCharacters?: number
  showMinCharactersWarning?: boolean
  detectType?: (term: string) => Partial<TFilters>
  validationRules?: ValidationRule[]
}

/**
 * Regra de validação para pesquisa
 */
export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

/**
 * Seção de filtro expansível
 */
export interface FilterSection<TFilters> {
  id: string
  title: string
  icon?: LucideIcon
  type: FilterFieldType
  defaultExpanded?: boolean
  collapsible?: boolean

  // Configuração específica por tipo de campo
  config: FieldConfig<TFilters>
}

/**
 * Tipos de campo disponíveis
 */
export type FilterFieldType =
  | 'checkbox-list'
  | 'range'
  | 'date-range'
  | 'select'
  | 'async-checkbox'
  | 'custom'

/**
 * Union type de todas as configurações de campo
 */
export type FieldConfig<TFilters> =
  | CheckboxListConfig<TFilters>
  | RangeConfig<TFilters>
  | DateRangeConfig<TFilters>
  | SelectConfig<TFilters>
  | AsyncCheckboxConfig<TFilters>
  | CustomConfig<TFilters>

/**
 * Configuração para checkbox-list (múltipla seleção ou única)
 */
export interface CheckboxListConfig<TFilters> {
  type: 'checkbox-list'
  field: keyof TFilters
  multiSelect: boolean
  options: CheckboxOption[]
}

export interface CheckboxOption {
  value: string
  label: string
  color?: string
  icon?: LucideIcon
}

/**
 * Configuração para range (valores numéricos min/max)
 * Resolve o problema de perda de foco usando estados locais
 */
export interface RangeConfig<TFilters> {
  type: 'range'
  minField: keyof TFilters
  maxField: keyof TFilters
  inputType: 'number' | 'currency'
  minLabel: string
  maxLabel: string
  minPlaceholder?: string
  maxPlaceholder?: string
  step?: number
  min?: number
  max?: number
  formatValue?: (value: number) => string
}

/**
 * Configuração para date-range (períodos de data)
 */
export interface DateRangeConfig<TFilters> {
  type: 'date-range'
  startDateField: keyof TFilters
  endDateField: keyof TFilters
  startLabel: string
  endLabel: string
  minDate?: string
  maxDate?: string
}

/**
 * Configuração para select simples
 */
export interface SelectConfig<TFilters> {
  type: 'select'
  field: keyof TFilters
  options: SelectOption[]
  placeholder?: string
}

export interface SelectOption {
  value: string
  label: string
}

/**
 * Configuração para checkboxes carregados assincronamente (via API)
 */
export interface AsyncCheckboxConfig<TFilters> {
  type: 'async-checkbox'
  field: keyof TFilters
  loadOptions: () => Promise<CheckboxOption[]>
  searchable?: boolean
  searchPlaceholder?: string
}

/**
 * Configuração para campo customizado (escape hatch)
 */
export interface CustomConfig<TFilters> {
  type: 'custom'
  render: (props: CustomFieldRenderProps<TFilters>) => React.ReactNode
}

export interface CustomFieldRenderProps<TFilters> {
  filtros: TFilters
  onFiltrosChange: (filtros: TFilters) => void
  isMobile?: boolean
}
