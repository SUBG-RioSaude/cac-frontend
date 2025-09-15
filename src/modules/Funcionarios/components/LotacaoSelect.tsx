import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetLotacoes } from '@/modules/Funcionarios'
import type { LotacaoApi } from '@/modules/Funcionarios'
import { Skeleton } from '@/components/ui/skeleton'

interface LotacaoSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function LotacaoSelect({ value, onChange, placeholder = 'Selecione a lotação...', disabled }: LotacaoSelectProps) {
  const { data, isLoading } = useGetLotacoes({ tamanhoPagina: 100, ativo: true })
  const lotacoes: LotacaoApi[] = data?.dados || []

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {lotacoes.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            {l.nome} {l.sigla ? `(${l.sigla})` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

