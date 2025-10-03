import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  Plus,
  FileText,
  DollarSign,
  FileCheck,
  Shield,
  Award,
  FilePlus,
  FileSignature,
  Play,
  Receipt,
  File,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type {
  DocumentoContrato,
  TipoDocumento,
} from '@/modules/Contratos/types/contrato'
import { TIPOS_DOCUMENTO } from '@/modules/Contratos/types/contrato'

const tipoIcons = {
  FileText,
  DollarSign,
  FileCheck,
  Shield,
  Award,
  FilePlus,
  FileSignature,
  Play,
  Receipt,
  File,
}

const novoDocumentoSchema = z.object({
  nome: z
    .string()
    .min(5, 'Nome deve ter pelo menos 5 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  tipoId: z.string().min(1, 'Selecione um tipo de documento'),
  categoria: z.enum(['obrigatorio', 'opcional'], {
    message: 'Selecione a categoria do documento',
  }),
  linkExterno: z
    .string()
    .url('Link deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
})

type NovoDocumentoForm = z.infer<typeof novoDocumentoSchema>

interface NovoDocumentoDialogProps {
  onAdicionarDocumento: (
    documento: Omit<
      DocumentoContrato,
      'id' | 'dataUpload' | 'dataUltimaVerificacao' | 'prioridade'
    >,
  ) => void
  usuarioAtual?: string
  children: React.ReactNode
}

export const NovoDocumentoDialog = ({
  onAdicionarDocumento,
  usuarioAtual = 'Usuário Atual',
  children,
}: NovoDocumentoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<NovoDocumentoForm>({
    resolver: zodResolver(novoDocumentoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipoId: '',
      categoria: 'obrigatorio',
      linkExterno: '',
    },
  })

  const tipoSelecionado = form.watch('tipoId')
  const tipoDocumento = TIPOS_DOCUMENTO.find((t) => t.id === tipoSelecionado)
  const categoriaSelecionada = form.watch('categoria')

  const handleSubmit = async (data: NovoDocumentoForm) => {
    try {
      setIsSubmitting(true)

      const tipo = TIPOS_DOCUMENTO.find((t) => t.id === data.tipoId)
      if (!tipo) {
        toast.error('Tipo de documento inválido')
        return
      }

      const novoDocumento: Omit<
        DocumentoContrato,
        'id' | 'dataUpload' | 'dataUltimaVerificacao' | 'prioridade'
      > = {
        nome: data.nome.trim(),
        descricao: data.descricao.trim(),
        tipo,
        categoria: data.categoria,
        status: 'pendente',
        linkExterno: data.linkExterno ?? undefined,
        responsavel: usuarioAtual,
        observacoes: undefined,
      }

      await Promise.resolve(onAdicionarDocumento(novoDocumento))

      toast.success(`Documento "${data.nome}" foi adicionado com sucesso`, {
        description: `Status inicial: Pendente • Categoria: ${data.categoria === 'obrigatorio' ? 'Obrigatório' : 'Opcional'}`,
      })

      form.reset()
      setIsOpen(false)
    } catch {
      toast.error('Erro ao adicionar documento', {
        description: 'Tente novamente ou contate o suporte',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTipoIcon = (tipo?: TipoDocumento) => {
    if (!tipo) return File
    const iconKey = tipo.icone as keyof typeof tipoIcons
    return iconKey in tipoIcons ? tipoIcons[iconKey] : File
  }

  const submitForm = form.handleSubmit(handleSubmit)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5 text-teal-600" />
            Adicionar Novo Documento
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              void submitForm(event)
            }}
            className="space-y-6"
          >
            {/* Preview do tipo selecionado */}
            {tipoDocumento && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
              >
                {(() => {
                  const IconComponent = getTipoIcon(tipoDocumento)
                  return (
                    <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded-lg">
                      <IconComponent className="text-muted-foreground h-5 w-5" />
                    </div>
                  )
                })()}
                <div>
                  <div className="font-medium">{tipoDocumento.nome}</div>
                  <div className="text-muted-foreground text-sm">
                    {tipoDocumento.descricaoDetalhada}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Nome do documento */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Nome do Documento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Edital Pregão Eletrônico nº 001/2024"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome completo e descritivo do documento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o conteúdo e finalidade do documento..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explicação detalhada sobre o documento e sua importância
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de documento */}
            <FormField
              control={form.control}
              name="tipoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="required">Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo do documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => {
                        const iconKey = tipo.icone as keyof typeof tipoIcons
                        const IconComponent =
                          iconKey in tipoIcons ? tipoIcons[iconKey] : File
                        return (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{tipo.nome}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categoria que melhor descreve este documento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria obrigatório/opcional */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Documento Obrigatório
                    </FormLabel>
                    <FormDescription>
                      Documentos obrigatórios são necessários para a validade do
                      contrato
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'obrigatorio'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'obrigatorio' : 'opcional')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Link externo */}
            <FormField
              control={form.control}
              name="linkExterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link do Documento{' '}
                    <span className="text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/documento.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL para acessar o documento (pode ser adicionado depois)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resumo da categoria selecionada */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Categoria:</span>
              <Badge
                variant={
                  categoriaSelecionada === 'obrigatorio'
                    ? 'destructive'
                    : 'outline'
                }
                className="text-xs"
              >
                {categoriaSelecionada === 'obrigatorio'
                  ? 'Obrigatório'
                  : 'Opcional'}
              </Badge>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setIsOpen(false)
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Documento
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
