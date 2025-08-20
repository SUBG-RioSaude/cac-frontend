
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChecklistData } from "../../types/contrato-detalhado";
import { useTimelineIntegration } from '../../hooks/useTimelineIntegration';
import { toast } from 'sonner';

interface TabDocumentosProps {
  checklistData: ChecklistData;
  contratoId: string;
}

const checklistLabels: Record<keyof ChecklistData, string> = {
  termoReferencia: "Termo de Referência/Edital",
  homologacao: "Homologação",
  ataRegistroPrecos: "Ata de Registro de Preços",
  garantiaContratual: "Garantia Contratual",
  contrato: "Contrato",
  publicacaoPncp: "Publicação PNCP",
  publicacaoExtrato: "Publicação de Extrato Contratual",
};

export function TabDocumentos({ checklistData: initialChecklistData, contratoId }: TabDocumentosProps) {
  const [checklistData, setChecklistData] = useState(initialChecklistData);

  const onAdicionarEntradaTimeline = useCallback((entrada: any) => {
    // Em um app real, isso seria despachado para um store global da timeline
    console.log('Nova entrada na timeline:', entrada);
  }, []);
  
  const { criarEntradaChecklist } = useTimelineIntegration({ contratoId, onAdicionarEntrada: onAdicionarEntradaTimeline });

  const handleCheckedChange = useCallback((documentoKey: keyof ChecklistData, checked: boolean) => {
    const newStatus = checked ? 'entregue' : 'pendente';
    
    setChecklistData(prev => ({ ...prev, [documentoKey]: { ...prev[documentoKey], status: newStatus } }));

    const autor = { id: 'user-1', nome: 'Matheus', tipo: 'usuario' as const };
    criarEntradaChecklist(checklistLabels[documentoKey], newStatus, autor);

    toast.success(`"${checklistLabels[documentoKey]}" foi atualizado.`, {
      description: `Status alterado para: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    });

    console.log(`Simulando persistência para ${documentoKey}: ${newStatus}`);
  }, [contratoId, criarEntradaChecklist]);

  if (!checklistData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Documentos Obrigatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dados da checklist não disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Documentos Obrigatórios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(checklistLabels).map(([key, label]) => {
          const documentoKey = key as keyof ChecklistData;
          const isChecked = checklistData[documentoKey]?.status === 'entregue';

          return (
            <div key={documentoKey} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
              <Checkbox
                id={documentoKey}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(documentoKey, !!checked)}
                aria-label={label}
              />
              <Label htmlFor={documentoKey} className="text-base font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
