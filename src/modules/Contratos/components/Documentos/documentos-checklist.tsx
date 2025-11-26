import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { ChecklistData } from '../../types/contrato'

interface DocumentosChecklistProps {
  checklistData: ChecklistData
  contratoId: string
}

const checklistLabels: Record<keyof ChecklistData, string> = {
  termoReferencia: 'Termo de Referência/Edital',
  homologacao: 'Homologação',
  ataRegistroPrecos: 'Ata de Registro de Preços',
  garantiaContratual: 'Garantia Contratual',
  contrato: 'Contrato',
  publicacaoPncp: 'Publicação PNCP',
  publicacaoExtrato: 'Publicação de Extrato Contratual',
}

export const DocumentosChecklist = ({
  checklistData,
  contratoId,
}: DocumentosChecklistProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Espera o componente montar para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determina se está em dark mode
  const isDarkMode = mounted && (theme === 'dark' || resolvedTheme === 'dark')

  const handleCheckedChange = (
    documentoKey: keyof ChecklistData,
    checked: boolean,
  ) => {
    // Log para testes e debug
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      // eslint-disable-next-line no-console
      console.log(
        `Documento ${documentoKey} (contrato ${contratoId}) alterado para: ${checked}`,
      )
    }
    // Lógica para atualizar o estado e criar evento na timeline será adicionada aqui
  }

  return (
    <Card
      className={cn(
        isDarkMode
          ? 'bg-gray-900 border-gray-800 text-gray-100'
          : 'bg-card text-card-foreground',
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            'text-foreground',
            isDarkMode && 'dark:text-gray-100',
          )}
        >
          Checklist de Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(checklistLabels).map(([key, label]) => {
          const documentoKey = key as keyof ChecklistData
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const isChecked = checklistData[documentoKey]?.entregue ?? false

          return (
            <div
              key={String(documentoKey)}
              className={cn(
                'flex items-center space-x-3 rounded-lg border p-3 transition-colors',
                isChecked
                  ? isDarkMode
                    ? 'border-green-700/50 bg-green-950/60'
                    : 'border-green-200 bg-green-50'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-800/80'
                    : 'border-gray-200 bg-gray-50',
              )}
            >
              <Checkbox
                id={String(documentoKey)}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleCheckedChange(documentoKey, !!checked)
                }
              />
              <Label
                htmlFor={String(documentoKey)}
                className={cn(
                  'text-base cursor-pointer flex-1',
                  isChecked
                    ? isDarkMode
                      ? 'text-green-400 dark:text-green-400'
                      : 'text-green-700'
                    : isDarkMode
                      ? 'text-gray-300 dark:text-gray-300'
                      : 'text-gray-900',
                )}
              >
                {label}
              </Label>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
