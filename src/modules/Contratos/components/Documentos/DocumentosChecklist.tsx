
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ChecklistData } from "../../types/contrato";

interface DocumentosChecklistProps {
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

export function DocumentosChecklist({ checklistData, contratoId }: DocumentosChecklistProps) {
  const handleCheckedChange = (documentoKey: keyof ChecklistData, checked: boolean) => {
    console.log(`Documento ${String(documentoKey)} (contrato ${contratoId}) alterado para: ${checked}`);
    // Lógica para atualizar o estado e criar evento na timeline será adicionada aqui
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(checklistLabels).map(([key, label]) => {
          const documentoKey = key as keyof ChecklistData;
          const documento = checklistData[documentoKey];
          const isChecked = documento?.entregue || false;

          return (
            <div key={String(documentoKey)} className="flex items-center space-x-2">
              <Checkbox
                id={String(documentoKey)}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(documentoKey, !!checked)}
              />
              <Label htmlFor={String(documentoKey)} className="text-base">
                {label}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
