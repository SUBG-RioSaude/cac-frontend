import { FileText, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface PatchNote {
  version: string
  date: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking'
  changes: string[]
}

const PATCH_NOTES: PatchNote[] = [
  {
    version: 'v1.0.8-dev',
    date: '25/11/2025',
    type: 'feature',
    changes: [
      'Adicionada página de Configurações completa',
      'Implementado suporte a Dark Mode e Light Mode',
      'Adicionado controle de volume de notificações',
      'Criada seção de Patch Notes para acompanhar atualizações',
      'Implementado formulário de alteração de senha',
    ],
  },
  {
    version: 'v1.0.7-dev',
    date: '24/11/2025',
    type: 'feature',
    changes: [
      'Implementado cadastro de funcionários com validação de CPF',
      'Adicionada atribuição de permissões em 2 etapas',
      'Criado fluxo de detecção de usuário duplicado (erro 400)',
      'Adicionada pré-seleção de permissão existente',
      'Implementado endpoint de atualização em lote de permissões (API v1.1)',
    ],
  },
  {
    version: 'v1.0.6-dev',
    date: '20/11/2025',
    type: 'improvement',
    changes: [
      'Migração para API v1.1',
      'Adicionado sistemaId em endpoints de autenticação',
      'Melhorias na estrutura de resposta de permissões',
      'Otimização de queries com TanStack Query',
    ],
  },
  {
    version: 'v1.0.5-dev',
    date: '15/11/2025',
    type: 'fix',
    changes: [
      'Correção de bug no sistema de notificações SignalR',
      'Melhorias na performance do Dashboard',
      'Correção de erros de validação em formulários',
      'Ajustes de responsividade em telas pequenas',
    ],
  },
]

const getBadgeVariant = (
  type: PatchNote['type'],
): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (type) {
    case 'feature':
      return 'default'
    case 'fix':
      return 'destructive'
    case 'improvement':
      return 'secondary'
    case 'breaking':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getBadgeLabel = (type: PatchNote['type']): string => {
  switch (type) {
    case 'feature':
      return 'Novidade'
    case 'fix':
      return 'Correção'
    case 'improvement':
      return 'Melhoria'
    case 'breaking':
      return 'Breaking Change'
    default:
      return 'Outros'
  }
}

export const PatchNotesSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          Notas de Atualização
        </CardTitle>
        <CardDescription>
          Acompanhe as novidades e melhorias do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {PATCH_NOTES.map((note) => (
            <AccordionItem key={note.version} value={note.version}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-gray-500" />
                    <span className="font-semibold">{note.version}</span>
                    <Badge variant={getBadgeVariant(note.type)}>
                      {getBadgeLabel(note.type)}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">{note.date}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="ml-7 space-y-2 text-sm">
                  {note.changes.map((change, changeIndex) => (
                    <li
                      key={changeIndex}
                      className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 rounded-lg border border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Versão atual:</strong> {PATCH_NOTES[0].version} (
            {PATCH_NOTES[0].date})
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
