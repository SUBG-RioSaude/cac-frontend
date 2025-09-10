import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  ExternalLink,
  Save,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { useDocumentos, useUpdateDocumentosMultiplos } from '../../hooks'
import type { DocumentoMultiplo } from '../../types/contrato'
import { DateDisplay } from '@/components/ui/formatters'

interface TabDocumentosProps {
  contratoId: string;
}

// Tipos de documento obrigatórios (1-8 conforme API)
const tiposDeDocumento = [
  { tipo: 1, nome: 'Termo de Referência/Edital', key: 'termo_referencia', apiName: 'TermoReferencia' },
  { tipo: 2, nome: 'Homologação', key: 'homologacao', apiName: 'Homologacao' },
  { tipo: 3, nome: 'Ata de Registro de Preços', key: 'ata_registro_precos', apiName: 'AtaRegistroPrecos' },
  { tipo: 4, nome: 'Garantia Contratual', key: 'garantia_contratual', apiName: 'GarantiaContratual' },
  { tipo: 5, nome: 'Contrato', key: 'contrato', apiName: 'Contrato' },
  { tipo: 6, nome: 'Publicação PNCP', key: 'publicacao_pncp', apiName: 'PublicacaoPNCP' },
  { tipo: 7, nome: 'Publicação de Extrato Contratual', key: 'publicacao_extrato', apiName: 'PublicacaoExtrato' },
  { tipo: 8, nome: 'Proposta', key: 'proposta', apiName: 'Proposta' },
]

interface DocumentoLocal {
  tipo: number
  nome: string
  key: string
  apiName: string
  selecionado: boolean
  urlDocumento: string
  observacoes: string
  dataEntrega?: string
}

export function TabDocumentos({ contratoId }: TabDocumentosProps) {
  const { data: documentosApi = [], isLoading, error } = useDocumentos(contratoId);
  const updateMutation = useUpdateDocumentosMultiplos();

  // Estados para confirmações
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado local dos documentos (todos os 7 tipos sempre)
  const [documentosLocais, setDocumentosLocais] = useState<DocumentoLocal[]>(() => 
    tiposDeDocumento.map(tipo => ({
      tipo: tipo.tipo,
      nome: tipo.nome,
      key: tipo.key,
      apiName: tipo.apiName,
      selecionado: false,
      urlDocumento: '',
      observacoes: '',
    }))
  )

  // Sincronizar com dados da API quando carregarem
  useMemo(() => {
    if (documentosApi.length > 0) {
      setDocumentosLocais(prev => 
        prev.map(local => {
          // Buscar documento da API pelo tipo numérico
          const docApi = documentosApi.find(d => d.tipo === local.tipo.toString())
          if (docApi) {
            return {
              ...local,
              selecionado: docApi.status === 'conferido', // baseado no campo 'ativo' da API
              urlDocumento: docApi.linkExterno && docApi.linkExterno !== 'sem url' ? docApi.linkExterno : '',
              observacoes: docApi.observacoes || '',
              dataEntrega: docApi.dataAtualizacao || undefined
            }
          }
          return local
        })
      )
    }
  }, [documentosApi])

  // Calcular progresso
  const progressData = useMemo(() => {
    const entregues = documentosLocais.filter(doc => doc.selecionado).length
    const total = documentosLocais.length
    const percentual = total > 0 ? Math.round((entregues / total) * 100) : 0
    return { entregues, total, percentual }
  }, [documentosLocais])

  // Atualizar documento local
  const atualizarDocumento = useCallback((key: string, campo: keyof DocumentoLocal, valor: string | boolean) => {
    setDocumentosLocais(prev => 
      prev.map(doc => 
        doc.key === key 
          ? { 
              ...doc, 
              [campo]: valor,
              // Quando marca como selecionado, define data automaticamente
              ...(campo === 'selecionado' && valor === true ? { dataEntrega: new Date().toISOString() } : {})
            }
          : doc
      )
    )
    
    // Marcar como tendo mudanças não salvas
    setHasUnsavedChanges(true)
  }, [])

  // Salvar todas as alterações (com confirmação)
  const handleSalvarTodos = useCallback(() => {
    setShowSaveConfirm(true)
  }, [])

  // Confirmar e salvar todas as alterações
  const confirmarSalvarTodos = useCallback(() => {
    const payload = {
      documentos: documentosLocais.map(doc => ({
        tipoDocumento: doc.tipo,
        urlDocumento: doc.urlDocumento || 'sem url',
        dataEntrega: doc.dataEntrega || new Date().toISOString(),
        observacoes: doc.observacoes || '',
        selecionado: doc.selecionado
      } as DocumentoMultiplo))
    }

    updateMutation.mutate({ contratoId, payload })
    setShowSaveConfirm(false)
    setHasUnsavedChanges(false)
  }, [contratoId, documentosLocais, updateMutation])


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o checklist de documentos.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Checklist de Documentos
          </CardTitle>
          <Badge variant="outline">
            {progressData.entregues} de {progressData.total} entregues
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Progresso
            </span>
            <span className="font-medium">{progressData.percentual}%</span>
          </div>
          <Progress value={progressData.percentual} className="h-2" />
        </div>

        {/* Grid de documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documentosLocais.map((documento) => (
            <div 
              key={documento.key} 
              className={`p-3 rounded-lg border transition-colors ${
                documento.selecionado 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Header do documento */}
              <div className="flex items-start gap-2 mb-3">
                <Checkbox 
                  id={documento.key}
                  checked={documento.selecionado}
                  onCheckedChange={(checked) => 
                    atualizarDocumento(documento.key, 'selecionado', checked === true)
                  }
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={documento.key} className="text-xs font-medium leading-4 block">
                    {documento.nome}
                  </Label>
                  {documento.selecionado && documento.dataEntrega && (
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="truncate"><DateDisplay value={documento.dataEntrega} options={{
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }} /></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos compactos */}
              <div className="space-y-2">
                <div>
                  <Label htmlFor={`url-${documento.key}`} className="text-xs text-gray-600 block mb-1">
                    URL (opcional)
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      id={`url-${documento.key}`}
                      value={documento.urlDocumento}
                      onChange={(e) => atualizarDocumento(documento.key, 'urlDocumento', e.target.value)}
                      placeholder="https://..."
                      className="text-xs h-8 flex-1"
                    />
                    {documento.urlDocumento && (
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                        <a 
                          href={documento.urlDocumento} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`obs-${documento.key}`} className="text-xs text-gray-600 block mb-1">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id={`obs-${documento.key}`}
                    value={documento.observacoes}
                    onChange={(e) => atualizarDocumento(documento.key, 'observacoes', e.target.value)}
                    placeholder="Observações..."
                    className="text-xs h-16 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de salvamento */}
        <div className="flex justify-end pt-4 border-t">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Há alterações não salvas
              </span>
            )}
            <Button 
              onClick={handleSalvarTodos}
              disabled={updateMutation.isPending || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Dialog de confirmação para save completo */}
        <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Alterações</DialogTitle>
              <DialogDescription>
                Deseja salvar todas as alterações nos documentos? Isso incluirá status de entrega, URLs e observações.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowSaveConfirm(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmarSalvarTodos}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Salvar Tudo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}