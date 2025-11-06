import { Calendar, Filter } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FiltersBarProps {
  onFiltersChange?: (filters: Record<string, unknown>) => void
  onReset?: () => void
}

export const FiltersBar = ({ onFiltersChange, onReset }: FiltersBarProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState('2025-10')

  const statusOptions = [
    { id: 'ativo', label: 'Ativo' },
    { id: 'vencendo', label: 'Vencendo' },
    { id: 'vencido', label: 'Vencido' },
    { id: 'suspenso', label: 'Suspenso' },
    { id: 'encerrado', label: 'Encerrado' },
    { id: 'em-aprovacao', label: 'Em Aprovação' },
    { id: 'rascunho', label: 'Rascunho' },
  ]

  const typeOptions = [
    { id: 'servicos', label: 'Serviços' },
    { id: 'obras', label: 'Obras' },
    { id: 'fornecimento', label: 'Fornecimento' },
    { id: 'concessao', label: 'Concessão' },
  ]

  const unitOptions = [
    'Assessoria de Comunicação Social',
    'Assessoria de Demandas Institucionais',
    'Assessoria de Planejamento, Controle e Responsabilização',
    'Coordenadoria de Administração',
    'Coordenadoria de Atenção Primária',
    'Coordenadoria de Emergência Regional',
  ]

  const handleStatusToggle = (statusId: string) => {
    setSelectedStatus((prev) =>
      prev.includes(statusId)
        ? prev.filter((id) => id !== statusId)
        : [...prev, statusId],
    )
  }

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId],
    )
  }

  const handleUnitToggle = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit],
    )
  }

  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        status: selectedStatus,
        types: selectedTypes,
        units: selectedUnits,
        month: selectedMonth,
      })
    }
  }

  const handleResetFilters = () => {
    setSelectedStatus([])
    setSelectedTypes([])
    setSelectedUnits([])
    setSelectedMonth('2025-10')
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <Calendar className=" h-5 w-5 text-brand-secondary" />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="border-border bg-background w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-10">outubro 2025</SelectItem>
            <SelectItem value="2025-09">setembro 2025</SelectItem>
            <SelectItem value="2025-08">agosto 2025</SelectItem>
            <SelectItem value="2025-07">julho 2025</SelectItem>
            <SelectItem value="2025-06">junho 2025</SelectItem>
            <SelectItem value="2025-05">maio 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-background gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {(selectedStatus.length > 0 ||
              selectedTypes.length > 0 ||
              selectedUnits.length > 0) && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">
                {selectedStatus.length +
                  selectedTypes.length +
                  selectedUnits.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="end">
          <div className="border-border border-b p-4">
            <h3 className="text-foreground font-semibold">Filtros Avançados</h3>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-6 p-4">
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="bg-foreground text-background hover:bg-foreground/90 flex-1"
                  onClick={handleApplyFilters}
                >
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleResetFilters}
                >
                  Limpar
                </Button>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  <h4 className="text-foreground text-sm font-semibold">
                    Status
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={status.id}
                        checked={selectedStatus.includes(status.id)}
                        onCheckedChange={() => handleStatusToggle(status.id)}
                      />
                      <Label
                        htmlFor={status.id}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  <h4 className="text-foreground text-sm font-semibold">
                    Tipo
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {typeOptions.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => handleTypeToggle(type.id)}
                      />
                      <Label
                        htmlFor={type.id}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Units Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  <h4 className="text-foreground text-sm font-semibold">
                    Unidades
                  </h4>
                </div>
                <div className="space-y-2">
                  {unitOptions.map((unit) => (
                    <div key={unit} className="flex items-center space-x-2">
                      <Checkbox
                        id={unit}
                        checked={selectedUnits.includes(unit)}
                        onCheckedChange={() => handleUnitToggle(unit)}
                      />
                      <Label
                        htmlFor={unit}
                        className="cursor-pointer text-sm leading-tight font-normal"
                      >
                        {unit}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
