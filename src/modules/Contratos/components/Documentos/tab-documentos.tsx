
import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  CheckCircle, 
  ExternalLink, 
  Edit, 
  Save,
  Calendar,
  BarChart3
} from 'lucide-react'

import type { ChecklistData } from '../../types/contrato-detalhado'
import type { TimelineEntry } from '../../types/timeline'
import { useTimelineIntegration } from '../../hooks/useTimelineIntegration'
import { useToast } from '../../hooks/useToast'
import { calcularProgressoChecklist } from '../../data/checklist-mock'

interface TabDocumentosProps {
  checklistData: ChecklistData
  contratoId: string
  onChecklistChange?: (checklist: ChecklistData) => void
}

const checklistLabels: Record<keyof ChecklistData, string> = {
  termoReferencia: 'Termo de Referência/Edital',
  homologacao: 'Homologação',
  ataRegistroPrecos: 'Ata de Registro de Preços',
  garantiaContratual: 'Garantia Contratual',
  contrato: 'Contrato',
  publicacaoPncp: 'Publicação PNCP',
  publicacaoExtrato: 'Publicação de Extrato Contratual'
}

export function TabDocumentos({ 
  checklistData: initialChecklistData, 
  contratoId,
  onChecklistChange 
}: TabDocumentosProps) {
  // Criar checklist vazia se não houver dados - sempre começa vazia para contratos novos
  const checklistVazia: ChecklistData = {
    termoReferencia: { entregue: false },
    homologacao: { entregue: false },
    ataRegistroPrecos: { entregue: false },
    garantiaContratual: { entregue: false },
    contrato: { entregue: false },
    publicacaoPncp: { entregue: false },
    publicacaoExtrato: { entregue: false }
  }
  
  const [checklistData, setChecklistData] = useState(initialChecklistData || checklistVazia)
  const [editingLink, setEditingLink] = useState<keyof ChecklistData | null>(null)
  const [tempLink, setTempLink] = useState('')

  const { success, info } = useToast()
  const progressData = calcularProgressoChecklist(checklistData)

  const onAdicionarEntradaTimeline = useCallback((entrada: TimelineEntry) => {
    console.log('Nova entrada na timeline:', entrada)
  }, [])
  
  const { criarEntradaChecklist } = useTimelineIntegration({ 
    contratoId, 
    onAdicionarEntrada: onAdicionarEntradaTimeline 
  })

  const handleCheckedChange = useCallback((documentoKey: keyof ChecklistData, checked: boolean) => {
    // Checkbox agora é só visual - controle é feito pelo link
    info({
      title: 'Controle via link',
      description: 'Use o botão de editar link para alterar o status do documento.'
    })
  }, [info])

  const handleStartEditingLink = (documentoKey: keyof ChecklistData) => {
    setEditingLink(documentoKey)
    setTempLink(checklistData[documentoKey].link || '')
  }

  const handleSaveLink = useCallback((documentoKey: keyof ChecklistData) => {
    const documento = checklistData[documentoKey]
    const temLink = tempLink.trim() !== ''
    
    const novoDocumento = {
      ...documento,
      link: temLink ? tempLink : undefined,
      // NOVA REGRA: Adicionar link = automaticamente entregue
      entregue: temLink,
      dataEntrega: temLink ? new Date().toISOString() : undefined
    }
    
    const novaChecklist = {
      ...checklistData,
      [documentoKey]: novoDocumento
    }
    
    setChecklistData(novaChecklist)
    onChecklistChange?.(novaChecklist)
    setEditingLink(null)
    setTempLink('')

    // Timeline integration
    const autor = { id: 'user-1', nome: 'Usuário Atual', tipo: 'usuario' as const }
    criarEntradaChecklist(checklistLabels[documentoKey], temLink ? 'entregue' : 'pendente', autor)

    success({
      title: `"${checklistLabels[documentoKey]}" foi ${temLink ? 'marcado como entregue' : 'marcado como pendente'}`,
      description: temLink ? 'Link adicionado e documento entregue automaticamente' : 'Link removido - documento voltou para pendente'
    })

    console.log(`Salvando link para ${documentoKey}: ${tempLink}`)
  }, [checklistData, tempLink, onChecklistChange, success, criarEntradaChecklist])

  const formatarData = (data?: string) => {
    if (!data) return null
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Checklist de Documentos Obrigatórios
          </CardTitle>
          
          <Badge variant="outline" className="font-medium">
            {progressData.entregues} de {progressData.total} entregues
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progresso de Entrega
            </span>
            <span className="font-medium">{progressData.percentual}%</span>
          </div>
          <Progress value={progressData.percentual} className="h-2 [&>div]:bg-green-500" />
        </div>

        {/* Grid de documentos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {Object.entries(checklistLabels).map(([key, label]) => {
            const documentoKey = key as keyof ChecklistData
            const documento = checklistData[documentoKey]
            const isChecked = documento.entregue
            const isEditingThisLink = editingLink === documentoKey

            return (
              <div 
                key={documentoKey} 
                className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  {/* Checkbox e label */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={documentoKey}
                      checked={isChecked}
                      disabled={true}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 mt-1 opacity-60"
                      aria-label={label}
                    />
                    <div className="flex-1 space-y-2">
                      <Label 
                        htmlFor={documentoKey} 
                        className="text-sm font-medium cursor-pointer block leading-tight"
                      >
                        {label}
                        {isChecked && <CheckCircle className="inline-block h-4 w-4 text-green-600 ml-2" />}
                      </Label>
                      
                      {/* Data de entrega */}
                      {isChecked && documento.dataEntrega && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Entregue em {formatarData(documento.dataEntrega)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Link do documento - sempre visível */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Link {!documento.link && <span className="text-red-500">*</span>}
                      </span>
                      {!isEditingThisLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEditingLink(documentoKey)}
                          className="h-6 px-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {isEditingThisLink ? (
                      <div className="flex gap-2">
                        <Input
                          value={tempLink}
                          onChange={(e) => setTempLink(e.target.value)}
                          placeholder="https://exemplo.com/documento.pdf"
                          className="text-xs h-8"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveLink(documentoKey)}
                          className="px-2 h-8"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {documento.link ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs h-7 justify-start w-full"
                          >
                            <a
                              href={documento.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate"
                            >
                              <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                              Visualizar
                            </a>
                          </Button>
                        ) : (
                          <div className="text-xs text-orange-600 italic">
                            📎 Clique para adicionar link e marcar como entregue
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
