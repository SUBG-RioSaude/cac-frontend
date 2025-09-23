import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DateDisplay } from '@/components/ui/formatters'
import {
  ExternalLink,
  Edit,
  Check,
  Clock,
  AlertTriangle,
  X,
  Eye,
  Calendar,
  User,
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
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

import type {
  DocumentoContrato,
  StatusDocumento,
} from '@/modules/Contratos/types/contrato'

interface CardDocumentoProps {
  documento: DocumentoContrato
  onStatusChange?: (id: string, status: StatusDocumento) => void
  onLinkChange?: (id: string, link: string) => void
  onObservacoesChange?: (id: string, observacoes: string) => void
  className?: string
}

const getStatusInfo = (status: StatusDocumento) => {
  const config = {
    pendente: {
      icon: Clock,
      label: 'Pendente',
      description: 'Documento ainda não foi verificado',
      isConferido: false,
      hasPendencia: false,
    },
    em_analise: {
      icon: Eye,
      label: 'Em Análise',
      description: 'Documento está sendo analisado',
      isConferido: false,
      hasPendencia: false,
    },
    conferido: {
      icon: Check,
      label: 'Conferido',
      description: 'Documento verificado e aprovado',
      isConferido: true,
      hasPendencia: false,
    },
    com_pendencia: {
      icon: AlertTriangle,
      label: 'Com Pendência',
      description: 'Documento possui pendências a resolver',
      isConferido: false,
      hasPendencia: true,
    },
    rejeitado: {
      icon: X,
      label: 'Rejeitado',
      description: 'Documento foi rejeitado',
      isConferido: false,
      hasPendencia: true,
    },
  }

  return config[status]
}

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

export function CardDocumento({
  documento,
  onStatusChange,
  onLinkChange,
  onObservacoesChange,
  className,
}: CardDocumentoProps) {
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [novoLink, setNovoLink] = useState(documento.linkExterno || '')
  const [novasObservacoes, setNovasObservacoes] = useState(
    documento.observacoes || '',
  )

  const statusInfo = getStatusInfo(documento.status)
  const IconeTipo =
    tipoIcons[documento.tipo.icone as keyof typeof tipoIcons] || File

  const handleToggleConferido = (checked: boolean) => {
    if (checked) {
      onStatusChange?.(documento.id, 'conferido')
    } else {
      onStatusChange?.(documento.id, 'pendente')
    }
  }

  const handleMarcarPendencia = () => {
    onStatusChange?.(documento.id, 'com_pendencia')
  }

  const handleSalvarLink = () => {
    onLinkChange?.(documento.id, novoLink)
    setIsEditingLink(false)
  }

  const handleSalvarObservacoes = () => {
    onObservacoesChange?.(documento.id, novasObservacoes)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      role="article"
      tabIndex={0}
      aria-label={`Documento: ${documento.nome}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // Focar no primeiro botão interativo do card
          const botoes = e.currentTarget.querySelectorAll('button')
          if (botoes.length > 0) {
            ;(botoes[0] as HTMLElement).focus()
          }
        }
      }}
    >
      <Card className="border-border/50 h-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded-lg">
                <IconeTipo className="text-muted-foreground h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <CardTitle className="text-base leading-tight">
                  {documento.nome}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  {documento.descricao}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {/* Status com checkbox e pendência */}
              <div className="flex items-center gap-2">
                {onStatusChange && (
                  <Checkbox
                    checked={statusInfo.isConferido}
                    onCheckedChange={handleToggleConferido}
                    className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                    aria-label={`Marcar documento ${documento.nome} como conferido`}
                  />
                )}

                <Badge
                  variant="outline"
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    documento.status === 'conferido' &&
                      'border-green-500 text-green-700',
                    documento.status === 'pendente' &&
                      'border-amber-500 text-amber-700',
                    documento.status === 'com_pendencia' &&
                      'border-red-500 text-red-700',
                    documento.status === 'em_analise' &&
                      'border-blue-500 text-blue-700',
                    documento.status === 'rejeitado' &&
                      'border-gray-500 text-gray-700',
                  )}
                >
                  <statusInfo.icon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {documento.categoria === 'obrigatorio' && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}

                {/* Botão para marcar pendência */}
                {onStatusChange &&
                  !statusInfo.hasPendencia &&
                  documento.status !== 'conferido' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarcarPendencia}
                      className="h-6 px-2 text-xs text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      aria-label={`Marcar documento ${documento.nome} com pendência`}
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Pendência
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações básicas */}
          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Upload:{' '}
                <DateDisplay
                  value={documento.dataUpload}
                  options={{
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }}
                  fallback="Não definida"
                />
              </span>
            </div>

            {documento.responsavel && (
              <div className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Responsável: {documento.responsavel}</span>
              </div>
            )}

            {documento.dataUltimaVerificacao && (
              <div className="text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>
                  Última verificação:{' '}
                  <DateDisplay
                    value={documento.dataUltimaVerificacao}
                    options={{
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }}
                    fallback="Não definida"
                  />
                </span>
              </div>
            )}
          </div>

          {/* Link externo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Link do Documento</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingLink(!isEditingLink)}
                className="h-7 px-2"
                aria-label={`Editar link do documento ${documento.nome}`}
              >
                <Edit className="h-3 w-3" />
                <span className="sr-only">Editar link</span>
              </Button>
            </div>

            {isEditingLink ? (
              <div className="flex gap-2">
                <Input
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                  placeholder="https://exemplo.com/documento.pdf"
                  className="text-sm"
                  aria-label="URL do documento"
                />
                <Button
                  size="sm"
                  onClick={handleSalvarLink}
                  className="px-3"
                  aria-label="Salvar link"
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Salvar</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {documento.linkExterno ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 flex-1 justify-start text-xs"
                  >
                    <a
                      href={documento.linkExterno}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate"
                      aria-label={`Abrir documento ${documento.nome} em nova aba`}
                    >
                      <ExternalLink className="mr-2 h-3 w-3 flex-shrink-0" />
                      Visualizar Documento
                    </a>
                  </Button>
                ) : (
                  <div className="text-muted-foreground py-2 text-sm italic">
                    Nenhum link definido
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          {(documento.observacoes || onObservacoesChange) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              {onObservacoesChange ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto w-full justify-start p-2 text-left"
                    >
                      <div className="text-muted-foreground truncate text-xs">
                        {documento.observacoes ||
                          'Clique para adicionar observações...'}
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Observações - {documento.nome}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        value={novasObservacoes}
                        onChange={(e) => setNovasObservacoes(e.target.value)}
                        placeholder="Digite observações sobre este documento..."
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={handleSalvarObservacoes}
                        className="w-full"
                      >
                        Salvar Observações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="bg-muted/50 rounded-md p-2 text-sm">
                  {documento.observacoes}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
