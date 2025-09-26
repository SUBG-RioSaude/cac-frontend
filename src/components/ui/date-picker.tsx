import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disabledDates?: (date: Date) => boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecionar data",
  disabled = false,
  className,
  disabledDates
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Por padrão, desabilitar datas anteriores a hoje
  const defaultDisabledDates = React.useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }, [])

  const finalDisabledDates = disabledDates || defaultDisabledDates

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate)
            setOpen(false)
          }}
          disabled={finalDisabledDates}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}