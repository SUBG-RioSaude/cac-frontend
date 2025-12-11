/**
 * ==========================================
 * COMPONENTE: PREVIEW-PDF-VIEWER
 * ==========================================
 * Dialog para visualização prévia de PDF antes do download
 */

import { useState, useEffect } from 'react'
import { Download, Loader2, AlertTriangle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

import {
  DialogFullscreen,
  DialogFullscreenContent,
  DialogFullscreenClose,
} from '@/components/ui/dialog-fullscreen'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// ========== TIPOS ==========

interface PreviewPdfViewerProps {
  aberto: boolean
  onFechar: () => void
  urlPdf: string | null
  nomeArquivo?: string
  onBaixar?: () => void
  carregando?: boolean
}

// ========== COMPONENTE ==========

export const PreviewPdfViewer = ({
  aberto,
  onFechar,
  urlPdf,
  nomeArquivo = 'relatorio.pdf',
  onBaixar,
  carregando = false,
}: PreviewPdfViewerProps) => {
  const [zoom, setZoom] = useState(100)
  const [erro, setErro] = useState<string | null>(null)
  const [pdfCarregado, setPdfCarregado] = useState(false)

  // Reset ao abrir/fechar
  useEffect(() => {
    if (aberto) {
      setZoom(100)
      setErro(null)
      setPdfCarregado(false)
    }
  }, [aberto])

  // ========== HANDLERS ==========

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 25))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 25))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const handleIframeLoad = () => {
    setPdfCarregado(true)
  }

  const handleIframeError = () => {
    setErro('Erro ao carregar o PDF. Tente fazer o download.')
    setPdfCarregado(true)
  }

  const handleBaixar = () => {
    if (onBaixar) {
      onBaixar()
    } else if (urlPdf) {
      // Fallback: download direto via URL
      const link = document.createElement('a')
      link.href = urlPdf
      link.download = nomeArquivo
      link.click()
    }
  }

  // ========== RENDER ==========

  return (
    <DialogFullscreen open={aberto} onOpenChange={onFechar}>
      <DialogFullscreenContent>
        {/* Cabeçalho fixo com título e controles */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Visualização do Relatório</h2>
            <p className="text-sm text-muted-foreground">{nomeArquivo}</p>
          </div>

          {/* Controles de zoom */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50 || carregando}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200 || carregando}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              disabled={zoom === 100 || carregando}
              title="Resetar zoom para 100%"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              onClick={handleBaixar}
              disabled={!urlPdf || carregando}
              size="sm"
              className="bg-[#42b9eb] hover:bg-[#2a688f]"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
          </div>

          <DialogFullscreenClose />
        </div>

        {/* Área de conteúdo - ocupa todo espaço disponível */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {carregando ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Gerando prévia do PDF...</p>
              </div>
            </div>
          ) : erro ? (
            <div className="flex items-center justify-center h-full p-6">
              <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            </div>
          ) : urlPdf ? (
            <div className="h-full w-full flex items-start justify-center py-6 px-4">
              <div
                className="bg-white shadow-xl rounded-sm"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease-out',
                }}
              >
                {!pdfCarregado && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10 rounded-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                <iframe
                  src={`${urlPdf}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="border-0 rounded-sm"
                  style={{
                    width: '210mm',
                    height: '297mm',
                  }}
                  title="Preview do PDF"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertTriangle className="text-muted-foreground h-12 w-12 mx-auto" />
                <p className="text-muted-foreground mt-4">Nenhum PDF disponível</p>
              </div>
            </div>
          )}
        </div>
      </DialogFullscreenContent>
    </DialogFullscreen>
  )
}
