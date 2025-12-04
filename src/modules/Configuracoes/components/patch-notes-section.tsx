import { useQuery } from '@tanstack/react-query'
import { FileText, Sparkles, Plus, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cookieUtils } from '@/lib/auth/cookie-utils'
import { patchNotesService } from '@/services/patch-notes-service'
import { PatchNoteTipo } from '@/types/patch-notes'

import { CriarPatchNoteModal } from './criar-patch-note-modal'

const getBadgeVariant = (
  titulo: string,
): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (titulo) {
    case 'Novidade':
      return 'default'
    case 'Correção':
      return 'destructive'
    case 'Melhoria':
      return 'secondary'
    default:
      return 'outline'
  }
}

export const PatchNotesSection = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Verificar se usuário tem permissão ID = 5
  useEffect(() => {
    // Tentar ambos os nomes de cookie: 'token' e 'auth_token'
    let token = cookieUtils.getCookie('token')
    token ??= cookieUtils.getCookie('auth_token')

    if (!token) {
      return
    }

    try {
      // Decodificar JWT manualmente (payload está na segunda parte)
      const parts = token.split('.')

      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>

        // Permissão pode ser string única ou array
        let hasPermission = false

        if (typeof payload.permissao === 'string') {
          // Caso seja string única
          hasPermission = payload.permissao === '5'
        } else if (Array.isArray(payload.permissao)) {
          // Caso seja array
          hasPermission = payload.permissao.some(
            (p) => String(p) === '5'
          )
        }

        setIsAdmin(hasPermission)
      }
    } catch (erro) {
      // Erro silencioso ao decodificar token
      if (erro instanceof Error) {
        // Log apenas em desenvolvimento se necessário
      }
    }
  }, [])

  // Buscar patch notes da API
  const {
    data: patchNotesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['patch-notes'],
    queryFn: () => patchNotesService.listar({ pageSize: 50 }),
    retry: 1,
  })

  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleSuccess = () => {
    void refetch()
  }

  if (isLoading) {
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const patchNotes = patchNotesResponse?.items ?? []

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Notas de Atualização
              </CardTitle>
              <CardDescription>
                Acompanhe as novidades e melhorias do sistema
              </CardDescription>
            </div>
            {(() => {
              return isAdmin ? (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 dark:text-white"
                >
                  <Plus className="size-4" />
                  Novo Update
                </Button>
              ) : null
            })()}
          </div>
        </CardHeader>
        <CardContent>
          {patchNotes.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <FileText className="mx-auto mb-2 size-12 opacity-50" />
              <p className="text-sm">Nenhuma atualização disponível</p>
            </div>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full">
                {patchNotes.map((note) => (
                  <AccordionItem key={note.id} value={note.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <FileText className="size-4 text-gray-500" />
                          <span className="font-semibold">{note.versao}</span>
                          <Badge variant={getBadgeVariant(note.titulo)}>
                            {note.titulo}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatarData(note.dataPublicacao)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 px-4">
                        {/* Agrupar items por tipo */}
                        {(() => {
                          const novidades = note.items.filter(
                            (item) => item.tipo === PatchNoteTipo.Feature
                          )
                          const correcoes = note.items.filter(
                            (item) => item.tipo === PatchNoteTipo.Fix
                          )
                          const melhorias = note.items.filter(
                            (item) => item.tipo === PatchNoteTipo.Improvement
                          )

                          return (
                            <>
                              {/* Novidades */}
                              {novidades.length > 0 && (
                                <div>
                                  <h3 className="mb-3 text-lg font-bold text-foreground">
                                    Novidades
                                  </h3>
                                  <ul className="space-y-2">
                                    {novidades.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="mt-1.5 size-2 flex-shrink-0 rotate-45 bg-blue-500" />
                                        <span>{item.mensagem}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Correções */}
                              {correcoes.length > 0 && (
                                <div>
                                  <h3 className="mb-3 text-lg font-bold text-foreground">
                                    Correções
                                  </h3>
                                  <ul className="space-y-2">
                                    {correcoes.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="mt-1.5 size-2 flex-shrink-0 rotate-45 bg-blue-500" />
                                        <span>{item.mensagem}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Melhorias */}
                              {melhorias.length > 0 && (
                                <div>
                                  <h3 className="mb-3 text-lg font-bold text-foreground">
                                    Melhorias
                                  </h3>
                                  <ul className="space-y-2">
                                    {melhorias.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="mt-1.5 size-2 flex-shrink-0 rotate-45 bg-blue-500" />
                                        <span>{item.mensagem}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {patchNotes.length > 0 && (
                <div className="mt-6 rounded-lg border border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Versão atual:</strong> {patchNotes[0].versao} (
                    {formatarData(patchNotes[0].dataPublicacao)})
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CriarPatchNoteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />
    </>
  )
}
