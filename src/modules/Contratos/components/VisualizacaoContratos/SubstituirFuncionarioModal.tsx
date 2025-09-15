/**
 * ==========================================
 * MODAL DE SUBSTITUIÇÃO DE FUNCIONÁRIO
 * ==========================================
 * Modal para substituir funcionário vinculado ao contrato
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DatePicker } from '@/components/ui/date-picker'
import {
  User,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Building,
  Hash,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { BuscaFuncionarioField } from './BuscaFuncionarioField'
import { useSubstituirFuncionarioContrato } from '../../hooks/use-contratos-funcionarios'
import { getTipoGerenciaLabel } from '../../services/contratos-funcionarios-service'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'
import type { ContratoFuncionario } from '../../types/contrato'
import { cn } from '@/lib/utils'

// ========== INTERFACES ==========

interface SubstituirFuncionarioModalProps {
  aberto: boolean
  onFechar: () => void
  contratoId: string
  funcionarioAtual: ContratoFuncionario & {
    funcionarioNome?: string
    funcionarioId: string
  }
  tipoGerencia: 1 | 2 // 1=Fiscal, 2=Gestor
  funcionarioCompleto?: FuncionarioApi // Dados completos se disponível
}

// ========== COMPONENTE ==========

export function SubstituirFuncionarioModal({
  aberto,
  onFechar,
  contratoId,
  funcionarioAtual,
  tipoGerencia,
  funcionarioCompleto
}: SubstituirFuncionarioModalProps) {
  const [funcionarioNovo, setFuncionarioNovo] = useState<FuncionarioApi | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [etapaConfirmacao, setEtapaConfirmacao] = useState(false)
  const [opcaoData, setOpcaoData] = useState<'hoje' | 'personalizada'>('hoje')
  const [dataInicio, setDataInicio] = useState<Date>(new Date())

  const substituirMutation = useSubstituirFuncionarioContrato()

  const tipoLabel = getTipoGerenciaLabel(tipoGerencia)

  // Reset do modal quando fechar
  const handleFechar = () => {
    setFuncionarioNovo(null)
    setObservacoes('')
    setEtapaConfirmacao(false)
    setOpcaoData('hoje')
    setDataInicio(new Date())
    substituirMutation.reset()
    onFechar()
  }

  // Avançar para confirmação
  const handleAvancarParaConfirmacao = () => {
    if (!funcionarioNovo) return
    setEtapaConfirmacao(true)
  }

  // Voltar para seleção
  const handleVoltarParaSelecao = () => {
    setEtapaConfirmacao(false)
  }

  // Confirmar substituição
  const handleConfirmarSubstituicao = () => {
    if (!funcionarioNovo) return

    // Determinar a data de início
    const dataInicioFinal = opcaoData === 'hoje' ? new Date() : dataInicio

    substituirMutation.mutate(
      {
        contratoId,
        funcionarioAntigoId: funcionarioAtual.funcionarioId,
        funcionarioNovoId: funcionarioNovo.id,
        funcionarioNovoNome: funcionarioNovo.nomeCompleto,
        tipoGerencia,
        dataInicio: dataInicioFinal.toISOString().slice(0, 10), // Formato YYYY-MM-DD
        observacoes: observacoes.trim() || undefined
      },
      {
        onSuccess: () => {
          handleFechar()
        }
      }
    )
  }

  // Verificar se funcionário está inativo
  const funcionarioNovoInativo = funcionarioNovo && !funcionarioNovo.ativo

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Substituir {tipoLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Funcionário Atual */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {tipoLabel} Atual
            </Label>
            
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {funcionarioCompleto?.nomeCompleto || funcionarioAtual.funcionarioNome || 'Nome não informado'}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {funcionarioCompleto?.cargo || funcionarioAtual.funcionarioCargo || 'Cargo não informado'}
                  </p>
                  
                  {/* Informações adicionais se disponível */}
                  {funcionarioCompleto && (
                    <div className="flex items-center gap-2 mt-1">
                      {funcionarioCompleto.matricula && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {funcionarioCompleto.matricula}
                        </span>
                      )}
                      
                      {funcionarioCompleto.lotacaoSigla && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {funcionarioCompleto.lotacaoSigla}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!etapaConfirmacao ? (
            // ETAPA 1: Seleção do novo funcionário
            <>
              <BuscaFuncionarioField
                label={`Novo ${tipoLabel}`}
                placeholder={`Busque o funcionário que será o novo ${tipoLabel.toLowerCase()}...`}
                funcionarioSelecionado={funcionarioNovo}
                funcionariosExcluidos={[funcionarioAtual.funcionarioId]}
                onSelecionarFuncionario={setFuncionarioNovo}
                onLimparSelecao={() => setFuncionarioNovo(null)}
                required
              />

              {/* Alerta se funcionário inativo */}
              {funcionarioNovoInativo && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Atenção:</strong> Este funcionário está marcado como inativo no sistema.
                    Você pode prosseguir, mas recomendamos verificar o status antes de confirmar.
                  </AlertDescription>
                </Alert>
              )}

              {/* Seletor de data de início */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data de Início</Label>

                <RadioGroup
                  value={opcaoData}
                  onValueChange={(value) => setOpcaoData(value as 'hoje' | 'personalizada')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hoje" id="iniciar-hoje" />
                    <Label
                      htmlFor="iniciar-hoje"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Iniciar período hoje
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personalizada" id="data-personalizada" />
                    <Label
                      htmlFor="data-personalizada"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Escolher data específica
                    </Label>
                  </div>
                </RadioGroup>

                {opcaoData === 'personalizada' && (
                  <div className="space-y-2 ml-6">
                    <Label className="text-xs text-muted-foreground">
                      Selecione a data de início do período:
                    </Label>
                    <DatePicker
                      date={dataInicio}
                      onDateChange={(date) => setDataInicio(date || new Date())}
                      placeholder="Selecionar data de início"
                      className="w-full"
                    />
                  </div>
                )}

                {opcaoData === 'hoje' && (
                  <p className="text-xs text-muted-foreground ml-6">
                    O período de {tipoLabel.toLowerCase()} iniciará hoje ({new Date().toLocaleDateString('pt-BR')})
                  </p>
                )}
              </div>

              {/* Campo de observações */}
              <div>
                <Label htmlFor="observacoes" className="text-sm font-medium">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Motivo da substituição, observações sobre o novo funcionário, etc..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </>
          ) : (
            // ETAPA 2: Confirmação
            <>
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Confirmar Substituição
                </Label>
                
                <div className="space-y-4">
                  {/* Comparação visual */}
                  <div className="flex items-center gap-4">
                    {/* Funcionário atual */}
                    <div className="flex-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-medium text-red-800">Será removido</span>
                      </div>
                      <p className="font-medium text-sm">
                        {funcionarioCompleto?.nomeCompleto || funcionarioAtual.funcionarioNome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {funcionarioCompleto?.cargo || funcionarioAtual.funcionarioCargo}
                      </p>
                    </div>

                    {/* Seta */}
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                    {/* Funcionário novo */}
                    <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">Será adicionado</span>
                      </div>
                      <p className="font-medium text-sm">
                        {funcionarioNovo?.nomeCompleto}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {funcionarioNovo?.cargo}
                      </p>
                      
                      {/* Informações de contato do novo funcionário */}
                      {funcionarioNovo && (
                        <div className="mt-2 space-y-1">
                          {funcionarioNovo.emailInstitucional && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{funcionarioNovo.emailInstitucional}</span>
                            </div>
                          )}
                          
                          {funcionarioNovo.telefone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{funcionarioNovo.telefone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observações */}
                  {observacoes.trim() && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">Observações:</p>
                      <p className="text-sm text-blue-700">{observacoes}</p>
                    </div>
                  )}

                  {/* Aviso sobre a operação */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Esta operação irá remover o {tipoLabel.toLowerCase()} atual e adicionar o novo funcionário.
                      O processo é automático e não pode ser desfeito facilmente.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!etapaConfirmacao ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleFechar}
                disabled={substituirMutation.isPending}
              >
                Cancelar
              </Button>
              
              <Button
                type="button"
                onClick={handleAvancarParaConfirmacao}
                disabled={!funcionarioNovo || substituirMutation.isPending}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleVoltarParaSelecao}
                disabled={substituirMutation.isPending}
              >
                Voltar
              </Button>
              
              <Button
                type="button"
                onClick={handleConfirmarSubstituicao}
                disabled={substituirMutation.isPending || !funcionarioNovo}
                className={cn(
                  "min-w-32",
                  funcionarioNovoInativo && "bg-orange-600 hover:bg-orange-700"
                )}
              >
                {substituirMutation.isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                  </motion.div>
                ) : null}
                {substituirMutation.isPending ? 'Substituindo...' : 'Confirmar Substituição'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
