/**
 * ==========================================
 * COMPONENTE: CARD-RELATORIO
 * ==========================================
 * Card individual de relatório para visualização mobile/alternativa
 */

import { FileText, Download, Eye, Trash2, MoreVertical, Calendar, HardDrive } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { RelatorioHistoricoListItem } from '../../types/historico'

// ========== TIPOS ==========

interface CardRelatorioProps {
  relatorio: RelatorioHistoricoListItem
  onBaixar: (id: string) => void
  onVisualizar?: (id: string) => void
  onExcluir: (id: string) => void
  desabilitado?: boolean
}

// ========== COMPONENTE ==========

export const CardRelatorio = ({
  relatorio,
  onBaixar,
  onVisualizar,
  onExcluir,
  desabilitado = false,
}: CardRelatorioProps) => {
  // ========== HANDLERS ==========

  const handleBaixar = () => {
    if (!desabilitado) {
      onBaixar(relatorio.id)
    }
  }

  const handleVisualizar = () => {
    if (!desabilitado && onVisualizar) {
      onVisualizar(relatorio.id)
    }
  }

  const handleExcluir = () => {
    if (!desabilitado) {
      onExcluir(relatorio.id)
    }
  }

  // ========== VARIANTE DE BADGE ==========

  const getVarianteBadgeTipo = (tipo: string): 'default' | 'secondary' | 'outline' => {
    switch (tipo.toLowerCase()) {
      case 'execução':
        return 'default'
      case 'desempenho':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // ========== RENDER ==========

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        desabilitado ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Ícone e Informações */}
          <div className="flex flex-1 gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <FileText className="h-5 w-5" />
            </div>

            <div className="flex-1 space-y-2">
              {/* Tipo e Nome */}
              <div className="space-y-1">
                <Badge variant={getVarianteBadgeTipo(relatorio.tipoNome)} className="text-xs">
                  {relatorio.tipoNome}
                </Badge>
                <p className="text-sm font-medium leading-none break-all">
                  {relatorio.nomeArquivo}
                </p>
              </div>

              {/* Metadados */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{relatorio.dataGeracaoFormatada}</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>
                    {relatorio.quantidadeContratos}{' '}
                    {relatorio.quantidadeContratos === 1 ? 'contrato' : 'contratos'}
                  </span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{relatorio.tamanhoFormatado}</span>
                </div>
              </div>

              {/* Ações principais (mobile) */}
              <div className="flex gap-2 pt-1 sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBaixar}
                  className="flex-1"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Baixar
                </Button>
                {onVisualizar && relatorio.podeReabrir && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisualizar}
                    className="flex-1"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Ver
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Menu de ações (desktop) */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBaixar}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </DropdownMenuItem>
                {onVisualizar && relatorio.podeReabrir && (
                  <DropdownMenuItem onClick={handleVisualizar}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExcluir} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão de excluir (mobile) */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExcluir}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
