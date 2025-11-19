import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGetLotacoes } from '@/modules/Funcionarios'
import type { LotacaoApi } from '@/modules/Funcionarios'

interface LotacaoSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export const LotacaoSelect = ({
  value,
  onChange,
  placeholder = 'Selecione a lotação...',
  disabled,
}: LotacaoSelectProps) => {
  const [open, setOpen] = useState(false)
  
  const { data, isLoading } = useGetLotacoes({
    tamanhoPagina: 100,
    ativo: true,
  })
  const lotacoes: LotacaoApi[] = data?.dados ?? []

  const selectedLotacao = lotacoes.find((l) => l.id === value)

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedLotacao ? (
            <>
              {selectedLotacao.nome}{' '}
              {selectedLotacao.sigla ? `(${selectedLotacao.sigla})` : ''}
            </>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar lotação..." />
          <CommandList>
            <CommandEmpty>Nenhuma lotação encontrada.</CommandEmpty>
            <CommandGroup>
              {lotacoes.map((lotacao) => (
                <CommandItem
                  key={lotacao.id}
                  value={`${lotacao.nome} ${lotacao.sigla ?? ''}`}
                  onSelect={() => {
                    onChange(lotacao.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === lotacao.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {lotacao.nome} {lotacao.sigla ? `(${lotacao.sigla})` : ''}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
