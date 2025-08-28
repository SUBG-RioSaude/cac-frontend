import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnderecoFornecedorProps {
  logradouro: string;
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
      <CardContent>
        <p>
          {props.logradouro}, {props.bairro}, {props.cidade} - {props.estado}, {props.cep}
        </p>
      </CardContent>
    </Card>
  );
}
