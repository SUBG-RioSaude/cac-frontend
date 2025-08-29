import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

interface Contato {
  tipo: string;
  valor: string;
}

interface ContatosFornecedorProps {
  contatos: Contato[];
}

export function ContatosFornecedor({ contatos }: ContatosFornecedorProps) {
  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'telefone':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {contatos.map((contato, index) => (
            <li key={index} className="flex items-center gap-2">
              {getIcon(contato.tipo)}
              <a
                href={contato.tipo === 'email' ? `mailto:${contato.valor}` : `tel:${contato.valor}`}
              >
                {contato.valor}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
