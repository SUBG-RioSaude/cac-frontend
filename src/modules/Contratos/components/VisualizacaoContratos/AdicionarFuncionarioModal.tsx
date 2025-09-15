/**
 * ==========================================
 * MODAL DE ADIÇÃO DE FUNCIONÁRIO
 * ==========================================
 * Modal para adicionar novo funcionário (fiscal ou gestor) ao contrato
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
  Plus,
  AlertTriangle,
  RefreshCw,
  Building,
  Hash,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react'
import { BuscaFuncionarioField } from './BuscaFuncionarioField'
import { useAdicionarFuncionarioContrato } from '../../hooks/use-contratos-funcionarios'
import { getTipoGerenciaLabel } from '../../services/contratos-funcionarios-service'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'
import { cn } from '@/lib/utils'

// ========== INTERFACES ==========

interface AdicionarFuncionarioModalProps {
  aberto: boolean
  onFechar: () => void
  contratoId: string
  tipoGerencia: 1 | 2 // 1=Fiscal, 2=Gestor
  funcionariosExistentes?: string[] // IDs dos funcionários já vinculados
}

// ========== COMPONENTE ==========

export function AdicionarFuncionarioModal({
  aberto,
  onFechar,
  contratoId,
  tipoGerencia,
  funcionariosExistentes = []
}: AdicionarFuncionarioModalProps) {
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<FuncionarioApi | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [opcaoData, setOpcaoData] = useState<'hoje' | 'personalizada'>('hoje')
  const [dataInicio, setDataInicio] = useState<Date>(new Date())

  const adicionarMutation = useAdicionarFuncionarioContrato()

  const tipoLabel = getTipoGerenciaLabel(tipoGerencia)

  // Reset do modal quando fechar
  const handleFechar = () => {
    setFuncionarioSelecionado(null)
    setObservacoes('')
    setOpcaoData('hoje')
    setDataInicio(new Date())
    adicionarMutation.reset()
    onFechar()
  }

  // Confirmar adição
  const handleConfirmarAdicao = () => {
    if (!funcionarioSelecionado) return

    // Determinar a data de início
    const dataInicioFinal = opcaoData === 'hoje' ? new Date() : dataInicio

    adicionarMutation.mutate(
      {
        contratoId,
        funcionarioId: funcionarioSelecionado.id,
        tipoGerencia,
        dataInicio: dataInicioFinal.toISOString().slice(0, 10), // Formato YYYY-MM-DD
        observacoes: observacoes.trim() || undefined,
        funcionarioNome: funcionarioSelecionado.nomeCompleto
      },
      {
        onSuccess: () => {
          handleFechar()
        }
      }
    )
  }

  // Verificar se funcionário está inativo
  const funcionarioInativo = funcionarioSelecionado && !funcionarioSelecionado.ativo

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Adicionar {tipoLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do funcionário */}
          <BuscaFuncionarioField
            label={`Selecionar ${tipoLabel}`}
            placeholder={`Busque o funcionário que será o ${tipoLabel.toLowerCase()}...`}
            funcionarioSelecionado={funcionarioSelecionado}
            funcionariosExcluidos={funcionariosExistentes}
            onSelecionarFuncionario={setFuncionarioSelecionado}
            onLimparSelecao={() => setFuncionarioSelecionado(null)}
            required
          />

          {/* Alerta se funcionário inativo */}
          {funcionarioInativo && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Atenção:</strong> Este funcionário está marcado como inativo no sistema.
                Você pode prosseguir, mas recomendamos verificar o status antes de confirmar.
              </AlertDescription>
            </Alert>
          )}

          {/* Preview do funcionário selecionado */}
          {funcionarioSelecionado && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">
                    {funcionarioSelecionado.nomeCompleto}
                  </h4>
                  <p className="text-green-700 text-sm">
                    {funcionarioSelecionado.cargo}
                  </p>
                </div>
                <div className="text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="grid grid-cols-1 gap-2 text-sm text-green-700 sm:grid-cols-2">
                {funcionarioSelecionado.matricula && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    <span>Mat: {funcionarioSelecionado.matricula}</span>
                  </div>
                )}

                {funcionarioSelecionado.lotacaoSigla && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    <span>{funcionarioSelecionado.lotacaoSigla}</span>
                  </div>
                )}

                {funcionarioSelecionado.emailInstitucional && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{funcionarioSelecionado.emailInstitucional}</span>
                  </div>
                )}

                {funcionarioSelecionado.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{funcionarioSelecionado.telefone}</span>
                  </div>
                )}
              </div>
            </div>
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
              placeholder="Motivo da designação, observações sobre o funcionário, etc..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Aviso sobre a operação */}
          {funcionarioSelecionado && (
            <Alert>
              <Plus className="h-4 w-4" />
              <AlertDescription>
                O funcionário <strong>{funcionarioSelecionado.nomeCompleto}</strong> será
                adicionado como {tipoLabel.toLowerCase()} deste contrato.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleFechar}
            disabled={adicionarMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleConfirmarAdicao}
            disabled={!funcionarioSelecionado || adicionarMutation.isPending}
            className={cn(
              "min-w-32",
              funcionarioInativo && "bg-orange-600 hover:bg-orange-700"
            )}
          >
            {adicionarMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
              </motion.div>
            ) : null}
            {adicionarMutation.isPending ? 'Adicionando...' : `Adicionar ${tipoLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}