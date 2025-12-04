import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
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
import { patchNotesService } from '@/services/patch-notes-service'
import {
  PatchNoteTipo,
  PatchNoteImportancia,
  type CriarPatchNoteRequest,
} from '@/types/patch-notes'

const criarPatchNoteSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória'),
  titulo: z.enum(['Novidade', 'Melhoria', 'Correção']),
  items: z
    .array(
      z.object({
        tipo: z.number(),
        mensagem: z.string().min(1, 'Mensagem é obrigatória'),
        importancia: z.number(),
      }),
    )
    .min(1, 'Adicione pelo menos um item'),
})

type CriarPatchNoteFormData = z.infer<typeof criarPatchNoteSchema>

interface CriarPatchNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const CriarPatchNoteModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CriarPatchNoteModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CriarPatchNoteFormData>({
    resolver: zodResolver(criarPatchNoteSchema),
    defaultValues: {
      versao: '',
      titulo: 'Novidade',
      items: [
        {
          tipo: PatchNoteTipo.Feature,
          mensagem: '',
          importancia: PatchNoteImportancia.Baixa,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const handleCriar = async (data: CriarPatchNoteFormData) => {
    setIsLoading(true)

    try {
      const payload: CriarPatchNoteRequest = {
        sistemaId: import.meta.env.VITE_SYSTEM_ID as string,
        versao: data.versao,
        titulo: data.titulo,
        dataPublicacao: new Date().toISOString(),
        importancia: PatchNoteImportancia.Media, // Pode ajustar conforme necessário
        items: data.items.map((item) => ({
          tipo: item.tipo as PatchNoteTipo,
          mensagem: item.mensagem,
          importancia: item.importancia as PatchNoteImportancia,
        })),
        publicarImediatamente: true,
      }

      await patchNotesService.criar(payload)

      toast.success('Patch Note criado com sucesso!', {
        description: `Versão ${data.versao} foi publicada`,
      })

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (erro) {
      toast.error('Erro ao criar Patch Note', {
        description: erro instanceof Error ? erro.message : 'Erro desconhecido',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const adicionarItem = () => {
    append({
      tipo: PatchNoteTipo.Feature,
      mensagem: '',
      importancia: PatchNoteImportancia.Baixa,
    })
  }

  const getTipoLabel = (tipo: PatchNoteTipo): string => {
    switch (tipo) {
      case PatchNoteTipo.Feature:
        return 'Feature (Novidade)'
      case PatchNoteTipo.Fix:
        return 'Fix (Correção)'
      case PatchNoteTipo.Improvement:
        return 'Improvement (Melhoria)'
      default:
        return 'Desconhecido'
    }
  }

  const getImportanciaLabel = (importancia: PatchNoteImportancia): string => {
    switch (importancia) {
      case PatchNoteImportancia.Baixa:
        return 'Baixa'
      case PatchNoteImportancia.Media:
        return 'Média'
      case PatchNoteImportancia.Alta:
        return 'Alta'
      default:
        return 'Desconhecida'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Patch Note</DialogTitle>
          <DialogDescription>
            Adicione uma nova atualização ao sistema
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit(handleCriar)(e)
            }}
            className="space-y-4"
          >
            {/* Versão */}
            <FormField
              control={form.control}
              name="versao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: v1.2.3"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo/Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Novidade">Novidade</SelectItem>
                      <SelectItem value="Melhoria">Melhoria</SelectItem>
                      <SelectItem value="Correção">Correção</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lista de Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Itens da Atualização</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarItem}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Adicionar Item
                </Button>
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  {/* Tipo do Item */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.tipo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value.toString()}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PatchNoteTipo.Feature.toString()}>
                              {getTipoLabel(PatchNoteTipo.Feature)}
                            </SelectItem>
                            <SelectItem value={PatchNoteTipo.Fix.toString()}>
                              {getTipoLabel(PatchNoteTipo.Fix)}
                            </SelectItem>
                            <SelectItem
                              value={PatchNoteTipo.Improvement.toString()}
                            >
                              {getTipoLabel(PatchNoteTipo.Improvement)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mensagem */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.mensagem`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descreva a alteração"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Importância */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.importancia`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Importância</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value.toString()}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a importância" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value={PatchNoteImportancia.Baixa.toString()}
                            >
                              {getImportanciaLabel(PatchNoteImportancia.Baixa)}
                            </SelectItem>
                            <SelectItem
                              value={PatchNoteImportancia.Media.toString()}
                            >
                              {getImportanciaLabel(PatchNoteImportancia.Media)}
                            </SelectItem>
                            <SelectItem
                              value={PatchNoteImportancia.Alta.toString()}
                            >
                              {getImportanciaLabel(PatchNoteImportancia.Alta)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Patch Note'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
