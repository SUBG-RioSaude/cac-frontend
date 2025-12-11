import { useState, useMemo } from 'react'
import { FileText, ChevronRight, Settings2, Loader2, CheckCircle2, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useContratos } from '@/modules/Contratos/hooks'
import type { TipoRelatorio } from '../../types/relatorio'
import { CONFIGURACAO_TIPOS_RELATORIO } from '../../config/relatorios-config'
import { SelecaoTipoRelatorio } from './selecao-tipo-relatorio'
import { SelecaoContratos } from './selecao-contratos'
import { useGerarRelatorio } from '../../hooks/use-gerar-relatorio'
import { PreviewPdfViewer } from '../PreviewRelatorio/preview-pdf-viewer'

/**
 * Formulário principal para geração de relatórios
 * Wizard com múltiplas etapas
 */
export const GerarRelatorioForm = () => {
  const [etapaAtual, setEtapaAtual] = useState<1 | 2 | 3>(1)
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelatorio>()
  const [contratosSelecionados, setContratosSelecionados] = useState<string[]>([])
  const [previewAberto, setPreviewAberto] = useState(false)

  // Buscar contratos da API
  const { data: contratosResponse, isLoading: carregandoContratos } = useContratos(
    {
      pagina: 1,
      tamanhoPagina: 100,
    },
    {
      enabled: etapaAtual >= 2,
    },
  )

  const contratos = contratosResponse?.dados ?? []
  const configuracaoTipo = tipoSelecionado
    ? CONFIGURACAO_TIPOS_RELATORIO[tipoSelecionado]
    : null

  // Hook de geração de relatório
  const { estado, gerarRelatorio, gerarPreview, baixarRelatorio, limparErro } = useGerarRelatorio({
    tipo: tipoSelecionado || 'execucao',
    idsContratos: contratosSelecionados,
    autoDownload: false, // Não baixa automaticamente quando há preview
    salvarHistorico: true,
    contratosBase: contratos, // Passa contratos já carregados da lista como fallback
  })

  // Navegação entre etapas
  const podeAvancar = () => {
    if (etapaAtual === 1) return !!tipoSelecionado
    if (etapaAtual === 2) return contratosSelecionados.length > 0
    return false
  }

  const handleAvancar = () => {
    if (podeAvancar()) {
      setEtapaAtual((prev) => Math.min(3, prev + 1) as typeof etapaAtual)
    }
  }

  const handleVoltar = () => {
    setEtapaAtual((prev) => Math.max(1, prev - 1) as typeof etapaAtual)
  }

  const handleGerar = async () => {
    await baixarRelatorio() // Força download
  }

  const handleVisualizarPreview = async () => {
    await gerarPreview()
    setPreviewAberto(true)
  }

  const handleFecharPreview = () => {
    setPreviewAberto(false)
  }

  const handleBaixarDoPreview = async () => {
    await baixarRelatorio()
  }

  return (
    <div className="space-y-6">
      {/* Indicador de progresso com cores CAC */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((etapa) => (
          <div key={etapa} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                etapa === etapaAtual
                  ? 'bg-[#2a688f] text-white shadow-lg scale-110'
                  : etapa < etapaAtual
                    ? 'bg-[#42b9eb] text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {etapa}
            </div>
            {etapa < 3 && (
              <div
                className={`mx-3 h-0.5 w-12 transition-colors duration-300 ${
                  etapa < etapaAtual ? 'bg-[#42b9eb]' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className={`text-sm font-medium transition-colors duration-300 ${
          etapaAtual === 1 ? 'text-[#2a688f]' : etapaAtual === 2 ? 'text-[#42b9eb]' : 'text-[#5ac8fa]'
        }`}>
          {etapaAtual === 1 && 'Etapa 1: Tipo de Relatório'}
          {etapaAtual === 2 && 'Etapa 2: Seleção de Contratos'}
          {etapaAtual === 3 && 'Etapa 3: Configurações e Geração'}
        </p>
      </div>

      <Separator />

      {/* Conteúdo das etapas */}
      <div>
        {/* Etapa 1: Seleção de Tipo */}
        {etapaAtual === 1 && (
          <SelecaoTipoRelatorio
            tipoSelecionado={tipoSelecionado}
            onSelecionarTipo={setTipoSelecionado}
          />
        )}

        {/* Etapa 2: Seleção de Contratos */}
        {etapaAtual === 2 && configuracaoTipo && (
          <SelecaoContratos
            contratos={contratos}
            contratosSelecionados={contratosSelecionados}
            onSelecionarContratos={setContratosSelecionados}
            maxContratos={configuracaoTipo.maxContratos}
            carregando={carregandoContratos}
          />
        )}

        {/* Etapa 3: Configurações e Preview */}
        {etapaAtual === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Configurações do Relatório</h3>
              <p className="text-muted-foreground text-sm">
                Revise as configurações e gere o relatório
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tipo de Relatório:</span>
                      <span className="text-sm">{configuracaoTipo?.nome}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Contratos Selecionados:</span>
                      <span className="text-sm">{contratosSelecionados.length}</span>
                    </div>
                    {estado.tamanhoEstimado > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tamanho Estimado:</span>
                        <span className="text-sm">
                          {(estado.tamanhoEstimado / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Progresso de geração */}
                  {estado.gerando && estado.progresso && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">{estado.progresso.mensagem}</span>
                      </div>
                      <Progress value={estado.progresso.progresso} className="h-2" />
                      <p className="text-muted-foreground text-xs">
                        {estado.progresso.progresso.toFixed(0)}% concluído
                      </p>
                    </div>
                  )}

                  {/* Sucesso */}
                  {!estado.gerando && estado.progresso?.etapa === 'concluido' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {estado.progresso.mensagem}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Erro */}
                  {estado.erro && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {estado.erro}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={limparErro}
                          className="ml-2"
                        >
                          Fechar
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Opções adicionais (futuro) */}
                  {!estado.gerando && !estado.erro && (
                    <div className="rounded-lg border-2 border-dashed p-6">
                      <div className="text-center">
                        <Settings2 className="text-muted-foreground mx-auto h-8 w-8" />
                        <p className="text-muted-foreground mt-2 text-sm">
                          Opções de personalização em desenvolvimento
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleVoltar}
          disabled={etapaAtual === 1}
        >
          Voltar
        </Button>

        <div className="flex gap-2">
          {etapaAtual < 3 ? (
            <Button className="bg-[#42b9eb] hover:bg-[#2a688f]"
              onClick={handleAvancar}
              disabled={!podeAvancar()}
            >
              Avançar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleVisualizarPreview}
                disabled={contratosSelecionados.length === 0 || estado.gerando}
              >
                {estado.gerando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Preview...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleGerar}
                disabled={contratosSelecionados.length === 0 || estado.gerando}
                className="bg-[#42b9eb] hover:bg-[#2a688f]"
              >
                {estado.gerando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Dialog de Preview */}
      <PreviewPdfViewer
        aberto={previewAberto}
        onFechar={handleFecharPreview}
        urlPdf={estado.urlPreview}
        nomeArquivo={`relatorio-${tipoSelecionado}-${new Date().toLocaleDateString('pt-BR')}.pdf`}
        onBaixar={handleBaixarDoPreview}
        carregando={estado.gerando}
      />
    </div>
  )
}
