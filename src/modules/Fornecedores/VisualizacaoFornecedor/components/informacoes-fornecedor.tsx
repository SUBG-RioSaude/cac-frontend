import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cnpjUtils } from '@/lib/utils'

interface InformacoesFornecedorProps {
  razaoSocial: string
  cnpj: string
  inscricaoEstadual?: string | null
  inscricaoMunicipal?: string | null
}

export const InformacoesFornecedor = (props: InformacoesFornecedorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Razão Social</p>
            <p className="font-medium">{props.razaoSocial}</p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">CNPJ</p>
            <p className="font-mono">{cnpjUtils.formatar(props.cnpj)}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Inscrição Estadual
              </p>
              <p>{props.inscricaoEstadual ?? 'Não informada'}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Inscrição Municipal
              </p>
              <p>{props.inscricaoMunicipal ?? 'Não informada'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
