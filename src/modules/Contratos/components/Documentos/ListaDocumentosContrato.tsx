import { useState } from 'react'
import { useDocumentos, useDeleteDocumento } from '../../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateDisplay } from '@/components/ui/formatters'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  File,
  Loader2,
  Trash2,
  AlertCircle,
  Upload,
} from 'lucide-react'
import type { DocumentoContratoDto } from '../../types/contrato'

interface ListaDocumentosContratoProps {
  contratoId: string
}

export function ListaDocumentosContrato({
  contratoId,
}: ListaDocumentosContratoProps) {
  const { data: documentos, isLoading, error } = useDocumentos(contratoId)
  const deleteMutation = useDeleteDocumento()

  const [documentoParaExcluir, setDocumentoParaExcluir] =
    useState<DocumentoContratoDto | null>(null)

  const handleDelete = () => {
    if (documentoParaExcluir) {
      deleteMutation.mutate(
        { contratoId, documentoId: documentoParaExcluir.id! },
        {
          onSuccess: () => {
            setDocumentoParaExcluir(null) // Fecha o dialog
          },
        },
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando documentos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os documentos. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentos Anexados</CardTitle>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Adicionar Documento
          </Button>
        </CardHeader>
        <CardContent>
          {documentos && documentos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="flex items-center font-medium">
                      <File className="text-muted-foreground mr-2 h-4 w-4 flex-shrink-0" />
                      {doc.nome}
                    </TableCell>
                    <TableCell>{doc.tipo}</TableCell>
                    <TableCell>
                      {doc.dataCadastro ? (
                        <DateDisplay value={doc.dataCadastro} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button variant="outline" size="icon" asChild>
                        <a
                          href={doc.linkExterno || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDocumentoParaExcluir(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum documento anexado a este contrato ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!documentoParaExcluir}
        onOpenChange={(open) => !open && setDocumentoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o documento "
              {documentoParaExcluir?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
