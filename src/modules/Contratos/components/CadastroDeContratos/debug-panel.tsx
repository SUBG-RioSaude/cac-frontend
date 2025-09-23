/**
 * ==========================================
 * DEBUG PANEL PARA CADASTRO DE CONTRATOS
 * ==========================================
 * Painel de debug flutuante que acompanha todo o fluxo
 * de cadastro de contrato para facilitar testes e desenvolvimento
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Database,
  Send,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import type { DadosFornecedor } from './fornecedor-form'
import type { DadosContrato } from './contrato-form'
import type { DadosUnidades } from '@/modules/Contratos/types/unidades'
import type { DadosAtribuicao } from './atribuicao-fiscais-form'
import type { CriarContratoData } from '@/modules/Contratos/hooks/use-contratos-mutations'

interface DadosCompletos {
  fornecedor?: DadosFornecedor
  contrato?: DadosContrato
  unidades?: DadosUnidades
  atribuicao?: DadosAtribuicao
}

interface DebugPanelProps {
  dadosCompletos: DadosCompletos
  passoAtual: number
  onPreencherDadosMock: (passo: number) => void
  onLimparDados: () => void
  onExportarDados: () => void
  payloadFinal?: CriarContratoData | null
  apiLogs: Array<{
    id: string
    timestamp: string
    method: string
    url: string
    status: 'loading' | 'success' | 'error'
    duration?: number
    data?: unknown
    error?: string
  }>
  isGeneratingMock?: boolean
}

export default function DebugPanel({
  dadosCompletos,
  passoAtual,
  onPreencherDadosMock,
  onLimparDados,
  onExportarDados,
  payloadFinal,
  apiLogs,
  isGeneratingMock = false,
}: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('dados')

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const copyToClipboard = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1:
        return dadosCompletos.fornecedor ? 'completed' : 'pending'
      case 2:
        return dadosCompletos.contrato ? 'completed' : 'pending'
      case 3:
        return dadosCompletos.unidades ? 'completed' : 'pending'
      case 4:
        return dadosCompletos.atribuicao ? 'completed' : 'pending'
      default:
        return 'pending'
    }
  }

  const getStepName = (step: number) => {
    switch (step) {
      case 1:
        return 'Fornecedor'
      case 2:
        return 'Contrato'
      case 3:
        return 'Unidades'
      case 4:
        return 'Fiscais'
      default:
        return 'Desconhecido'
    }
  }

  const renderStepData = (step: number) => {
    switch (step) {
      case 1:
        return dadosCompletos.fornecedor || { message: 'Dados não preenchidos' }
      case 2:
        return dadosCompletos.contrato || { message: 'Dados não preenchidos' }
      case 3:
        return dadosCompletos.unidades || { message: 'Dados não preenchidos' }
      case 4:
        return dadosCompletos.atribuicao || { message: 'Dados não preenchidos' }
      default:
        return { message: 'Step inválido' }
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed right-4 bottom-4 z-50 bg-orange-500 text-white shadow-lg hover:bg-orange-600"
        size="sm"
      >
        <Bug className="mr-2 h-4 w-4" />
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-h-[90vh] w-96">
      <Card className="border-orange-200 bg-white shadow-xl">
        <CardHeader className="border-b bg-orange-50 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Bug className="h-4 w-4 text-orange-600" />
              Debug Panel - Cadastro de Contrato
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Step Progress */}
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((step) => {
              const status = getStepStatus(step)
              const isActive = step === passoAtual

              return (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-sm ${
                    isActive
                      ? 'bg-orange-400'
                      : status === 'completed'
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                  }`}
                />
              )
            })}
          </div>

          <div className="mt-1 text-xs text-gray-600">
            Step {passoAtual}/4 - {getStepName(passoAtual)}
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid h-8 w-full grid-cols-4">
                <TabsTrigger value="dados" className="text-xs">
                  <Database className="mr-1 h-3 w-3" />
                  Dados
                </TabsTrigger>
                <TabsTrigger value="api" className="text-xs">
                  <Send className="mr-1 h-3 w-3" />
                  API
                </TabsTrigger>
                <TabsTrigger value="payload" className="text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  Payload
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs">
                  <Zap className="mr-1 h-3 w-3" />
                  Tools
                </TabsTrigger>
              </TabsList>

              <div className="mt-3">
                <TabsContent value="dados" className="mt-0">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step}>
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              variant={
                                getStepStatus(step) === 'completed'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {step}. {getStepName(step)}
                            </Badge>
                            {getStepStatus(step) === 'completed' && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                            {JSON.stringify(renderStepData(step), null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="api" className="mt-0">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {apiLogs.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                          Nenhuma chamada de API registrada
                        </div>
                      ) : (
                        apiLogs
                          .slice(-10)
                          .reverse()
                          .map((log) => (
                            <div
                              key={log.id}
                              className="rounded border p-2 text-xs"
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <Badge
                                  variant={
                                    log.status === 'success'
                                      ? 'default'
                                      : log.status === 'error'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {log.method} {log.status}
                                </Badge>
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {log.duration ? `${log.duration}ms` : '...'}
                                </div>
                              </div>
                              <div className="text-gray-600">{log.url}</div>
                              {log.error && (
                                <div className="mt-1 text-red-500">
                                  {log.error}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="payload" className="mt-0">
                  <ScrollArea className="h-64">
                    {payloadFinal ? (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className="text-xs">Payload Final</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payloadFinal)}
                            className="h-6 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                          {JSON.stringify(payloadFinal, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-gray-500">
                        Payload será gerado no último step
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="tools" className="mt-0">
                  <div className="space-y-2">
                    <div className="mb-2 text-xs font-medium">
                      Preenchimento Automático
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((step) => (
                        <Button
                          key={step}
                          variant="outline"
                          size="sm"
                          onClick={() => onPreencherDadosMock(step)}
                          className="h-8 text-xs"
                          disabled={isGeneratingMock}
                        >
                          {isGeneratingMock && step === 2 ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              API
                            </>
                          ) : (
                            `Step ${step}`
                          )}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 mb-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          ;[1, 2, 3, 4].forEach((step) =>
                            onPreencherDadosMock(step),
                          )
                        }}
                        className="h-8 w-full bg-green-500 text-xs hover:bg-green-600"
                        disabled={isGeneratingMock}
                      >
                        {isGeneratingMock ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-1 h-3 w-3" />
                            Gerar Todos os Steps
                          </>
                        )}
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="mb-2 text-xs font-medium">Ações</div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onLimparDados}
                        className="h-8 w-full text-xs"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Limpar Tudo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onExportarDados}
                        className="h-8 w-full text-xs"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Exportar JSON
                      </Button>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-gray-500">
                      <div>
                        💡 <kbd>Ctrl+Shift+D</kbd> - Toggle Debug
                      </div>
                      <div>🔍 Logs salvos no localStorage</div>
                      <div>✅ CNPJ gerado com algoritmo válido</div>
                      <div>📮 CEP válido por estado brasileiro</div>
                      <div>🎲 Dados únicos baseados em timestamp</div>
                      <div>🚫 Prevenção de duplicatas no backend</div>
                      <div>🏥 Step 2 usa dados reais da API de unidades</div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
