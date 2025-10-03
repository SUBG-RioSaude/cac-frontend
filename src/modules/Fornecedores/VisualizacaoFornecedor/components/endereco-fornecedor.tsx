import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EnderecoFornecedorProps {
  logradouro: string
  numero?: string | null
  complemento?: string | null
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export const EnderecoFornecedor = (props: EnderecoFornecedorProps) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Endereço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-lg tracking-wide">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1">
            <span>{props.logradouro}</span>
            {props.numero && <span>, {props.numero}</span>}
            {props.complemento && <span>, {props.complemento}</span>}
          </div>
          <div className="text-md text-muted-foreground">
            {props.bairro}, {props.cidade} - {props.estado}
          </div>
          <div className="text-md text-muted-foreground">CEP: {props.cep}</div>
        </div>
      </CardContent>
    </Card>
  )
}
