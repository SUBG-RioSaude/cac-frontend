import { Mail, Phone, Smartphone } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContatoEmpresa } from '@/modules/Empresas/types/empresa'

interface ContatosFornecedorProps {
  contatos: ContatoEmpresa[]
}

export const ContatosFornecedor = ({ contatos }: ContatosFornecedorProps) => {
  const getIcon = (tipo: 'Email' | 'Telefone' | 'Celular') => {
    switch (tipo) {
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-600" />
      case 'Telefone':
        return <Phone className="h-4 w-4 text-green-600" />
      case 'Celular':
        return <Smartphone className="h-4 w-4 text-orange-600" />
      default:
        return <Phone className="h-4 w-4 text-gray-600" />
    }
  }

  const getHref = (tipo: 'Email' | 'Telefone' | 'Celular', valor: string) => {
    return tipo === 'Email' ? `mailto:${valor}` : `tel:${valor}`
  }

  // Filtrar apenas contatos ativos
  const contatosAtivos = contatos.filter((contato) => contato.ativo)

  if (contatosAtivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhum contato cadastrado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contatos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contatosAtivos.map((contato) => (
          <div
            key={contato.id}
            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
          >
            {getIcon(contato.tipo)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {contato.nome}
              </p>
              <a
                href={getHref(contato.tipo, contato.valor)}
                className="text-sm break-all text-blue-600 hover:text-blue-800 hover:underline"
                title={`${contato.tipo}: ${contato.valor}`}
              >
                {contato.valor}
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
