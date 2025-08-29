import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InformacoesFornecedorProps {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export function InformacoesFornecedor(props: InformacoesFornecedorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Razão Social</p>
          <p>{props.razaoSocial}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Nome Fantasia</p>
          <p>{props.nomeFantasia}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">CNPJ</p>
          <p>{props.cnpj}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
          <p>{props.inscricaoEstadual}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Inscrição Municipal</p>
          <p>{props.inscricaoMunicipal}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data de Cadastro</p>
          <p>{props.dataCadastro}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Última Atualização</p>
          <p>{props.dataAtualizacao}</p>
        </div>
      </CardContent>
    </Card>
  );
}
