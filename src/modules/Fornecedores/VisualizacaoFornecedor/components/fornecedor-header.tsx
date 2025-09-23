import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cnpjUtils } from '@/lib/utils'

interface FornecedorHeaderProps {
  razaoSocial: string
  cnpj: string
  status: string
}

export function FornecedorHeader({
  razaoSocial,
  cnpj,
  status,
}: FornecedorHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{razaoSocial}</h1>
          <p className="text-muted-foreground">{cnpjUtils.formatar(cnpj)}</p>
        </div>
      </div>
      <Badge>{status}</Badge>
    </div>
  )
}
