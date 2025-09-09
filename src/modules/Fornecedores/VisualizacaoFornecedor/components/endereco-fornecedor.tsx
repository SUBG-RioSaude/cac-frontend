import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnderecoFornecedorProps {
  logradouro: string;
  numero?: string | null;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export function EnderecoFornecedor(props: EnderecoFornecedorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            <span>{props.logradouro}</span>
            {props.numero && <span>, {props.numero}</span>}
            {props.complemento && <span>, {props.complemento}</span>}
          </div>
          <div className="text-sm text-muted-foreground">
            {props.bairro}, {props.cidade} - {props.estado}
          </div>
          <div className="text-sm text-muted-foreground">
            CEP: {props.cep}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
