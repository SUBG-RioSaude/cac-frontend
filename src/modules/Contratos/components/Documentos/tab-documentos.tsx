import { useState, useMemo } from 'react';
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
  FileText,
  CheckCircle,
  ExternalLink,
  Edit,
  Save,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { useDocumentos, useUpdateDocumento, useCreateDocumento } from '../../hooks';
import type { DocumentoContratoDto } from '../../types/contrato';

interface TabDocumentosProps {
  contratoId: string;
}

const tiposDeDocumentoObrigatorio = [
  { key: 'termo_referencia', nome: 'Termo de Referência/Edital', tipo: '1' },
  { key: 'homologacao', nome: 'Homologação', tipo: '2' },
  { key: 'ata_registro_precos', nome: 'Ata de Registro de Preços', tipo: '3' },
  { key: 'garantia_contratual', nome: 'Garantia Contratual', tipo: '4' },
  { key: 'contrato', nome: 'Contrato', tipo: '5' },
  { key: 'publicacao_pncp', nome: 'Publicação PNCP', tipo: '6' },
  { key: 'publicacao_extrato', nome: 'Publicação de Extrato Contratual', tipo: '7' },
];

export function TabDocumentos({ contratoId }: TabDocumentosProps) {
  const { data: documentosApi = [], isLoading, error } = useDocumentos(contratoId);
  const updateMutation = useUpdateDocumento();
  const createMutation = useCreateDocumento();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempLink, setTempLink] = useState('');
  const [tempObservacoes, setTempObservacoes] = useState('');

  const checklistItems = useMemo(() => {
    return tiposDeDocumentoObrigatorio.map(tipoEstatico => {
      const docApi = documentosApi.find(d => d.tipo === tipoEstatico.tipo);
      if (docApi) {
        return { ...docApi, key: tipoEstatico.key, nome: tipoEstatico.nome };
      }
      return {
        id: null,
        key: tipoEstatico.key,
        nome: tipoEstatico.nome,
        tipo: tipoEstatico.tipo,
        status: 'pendente',
        linkExterno: null,
        observacoes: '',
        dataAtualizacao: null,
      };
    });
  }, [documentosApi]);

  const progressData = useMemo(() => {
    const entregues = checklistItems.filter(doc => doc.status === 'conferido' || doc.status === 'entregue').length;
    const total = checklistItems.length;
    const percentual = total > 0 ? Math.round((entregues / total) * 100) : 0;
    return { entregues, total, percentual };
  }, [checklistItems]);

  const handleStartEditing = (documento: (typeof checklistItems)[0]) => {
    setEditingKey(documento.key);
    setTempLink(documento.linkExterno || '');
    setTempObservacoes(documento.observacoes || '');
  };

  const handleSave = (documento: (typeof checklistItems)[0]) => {
    const temLink = tempLink.trim() !== '';
    const commonPayload = {
      contratoId:  contratoId,
      nome: documento.nome,
      tipo: documento.tipo,
      linkExterno: temLink ? tempLink : undefined,
      observacoes: tempObservacoes,
      status: temLink ? 'conferido' : 'pendente',
      dataEntrega: new Date().toISOString(), // Requerido pela API de criação
      dataAtualizacao: new Date().toISOString(),
    };

    const onSuccess = () => {
      setEditingKey(null);
      setTempLink('');
      setTempObservacoes('');
    };

    if (documento.id) {
      updateMutation.mutate({ contratoId, documentoId: documento.id, payload: commonPayload }, { onSuccess });
    } else {
      createMutation.mutate({ contratoId, payload: commonPayload }, { onSuccess });
    }
  };

  const formatarData = (data?: string | null) => {
    if (!data) return null;
    return new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Erro</AlertTitle><AlertDescription>Não foi possível carregar o checklist.</AlertDescription></Alert>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileText />Checklist de Documentos</CardTitle>
          <Badge variant="outline">{progressData.entregues} de {progressData.total} entregues</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-sm"><span><BarChart3 className="inline h-4 w-4 mr-1" />Progresso</span><span>{progressData.percentual}%</span></div>
          <Progress value={progressData.percentual} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {checklistItems.map((documento) => {
            const isChecked = documento.status === 'conferido' || documento.status === 'entregue';
            const isEditing = editingKey === documento.key;
            const isSaving = (updateMutation.isPending || createMutation.isPending) && editingKey === documento.key;

            return (
              <div key={documento.key} className="p-4 rounded-lg border bg-card space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox id={documento.key} checked={isChecked} disabled className="mt-1"/>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={documento.key}>{documento.nome}</Label>
                    {isChecked && documento.dataAtualizacao && <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Entregue em {formatarData(documento.dataAtualizacao)}</div>}
                  </div>
                  {!isEditing && <Button variant="ghost" size="sm" onClick={() => handleStartEditing(documento)}><Edit className="h-3 w-3" /></Button>}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`link-${documento.key}`} className="text-xs font-medium">Link</Label>
                      <Input id={`link-${documento.key}`} value={tempLink} onChange={(e) => setTempLink(e.target.value)} placeholder="https://..." disabled={isSaving} />
                    </div>
                    <div>
                      <Label htmlFor={`obs-${documento.key}`} className="text-xs font-medium">Observações</Label>
                      <Textarea id={`obs-${documento.key}`} value={tempObservacoes} onChange={(e) => setTempObservacoes(e.target.value)} placeholder="Observações..." disabled={isSaving} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingKey(null)} disabled={isSaving}>Cancelar</Button>
                      <Button onClick={() => handleSave(documento)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documento.linkExterno ? <Button variant="outline" size="sm" asChild><a href={documento.linkExterno} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-1" />Visualizar</a></Button> : <div className="text-xs text-muted-foreground italic">Nenhum link fornecido.</div>}
                    {documento.observacoes && <p className="text-xs text-muted-foreground p-2 bg-muted rounded-md"><strong>Obs:</strong> {documento.observacoes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}