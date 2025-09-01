import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  DollarSign, 
  Building, 
  Calendar, 
  AlertCircle,
  FileText,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/modules/Contratos/hooks/useToast'
import { 
  listarEmpenhosPorContrato,
  criarEmpenho,
  atualizarEmpenho,
  excluirEmpenho,
  validarNumeroEmpenho,
  validarValor,
  validarLimiteContrato,
  calcularEstatisticas
} from '../../services/empenhos-service'
import { currencyUtils } from '@/lib/utils'
import type { 
  Empenho, 
  EmpenhoForm, 
  ValidacaoEmpenho,
  ContratoUnidadeSaudeDto 
} from '../../types/contrato'

interface TabEmpenhosProps {
  contratoId: string
  valorTotalContrato: number
  unidadesVinculadas?: ContratoUnidadeSaudeDto[]
}

interface EstadoFormulario {
  aberto: boolean
  editando: boolean
  empenhoId?: string
  dados: EmpenhoForm
  validacao: ValidacaoEmpenho
}

export function TabEmpenhos({ contratoId, valorTotalContrato, unidadesVinculadas = [] }: TabEmpenhosProps) {
  const toast = useToast()
  const [empenhos, setEmpenhos] = useState<Empenho[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formulario, setFormulario] = useState<EstadoFormulario>({
    aberto: false,
    editando: false,
    dados: {
      unidadeSaudeId: '',
      numeroEmpenho: '',
      valor: '',
      dataEmpenho: new Date().toISOString().split('T')[0],
      observacao: ''
    },
    validacao: {
      numeroEmpenho: { valido: true },
      valor: { valido: true },
      limite: { valido: true }
    }
  })

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    return calcularEstatisticas(empenhos, valorTotalContrato)
  }, [empenhos, valorTotalContrato])

  const carregarEmpenhos = useCallback(async () => {
    try {
      setCarregando(true)
      const dados = await listarEmpenhosPorContrato(contratoId)
      setEmpenhos(dados)
    } catch (error) {
      console.error('Erro ao carregar empenhos:', error)
      toast.error('Não foi possível carregar os empenhos')
    } finally {
      setCarregando(false)
    }
  }, [contratoId, toast])

  // Carregar empenhos
  useEffect(() => {
    carregarEmpenhos()
  }, [carregarEmpenhos])

  const abrirFormulario = (empenho?: Empenho) => {
    if (empenho) {
      // Editar empenho existente
      setFormulario({
        aberto: true,
        editando: true,
        empenhoId: empenho.id,
        dados: {
          id: empenho.id,
          unidadeSaudeId: empenho.unidadeSaudeId,
          numeroEmpenho: empenho.numeroEmpenho,
          valor: empenho.valor.toString(),
          dataEmpenho: empenho.dataEmpenho.split('T')[0],
          observacao: empenho.observacao || ''
        },
        validacao: {
          numeroEmpenho: { valido: true },
          valor: { valido: true },
          limite: { valido: true }
        }
      })
    } else {
      // Novo empenho
      setFormulario({
        aberto: true,
        editando: false,
        dados: {
          unidadeSaudeId: '',
          numeroEmpenho: '',
          valor: '',
          dataEmpenho: new Date().toISOString().split('T')[0],
          observacao: ''
        },
        validacao: {
          numeroEmpenho: { valido: true },
          valor: { valido: true },
          limite: { valido: true }
        }
      })
    }
  }

  const fecharFormulario = () => {
    setFormulario(prev => ({ ...prev, aberto: false }))
  }

  const atualizarCampo = (campo: keyof EmpenhoForm, valor: string | number | undefined) => {
    setFormulario(prev => ({
      ...prev,
      dados: { ...prev.dados, [campo]: valor }
    }))

    // Validação em tempo real
    if (campo === 'numeroEmpenho' && typeof valor === 'string') {
      const validacao = validarNumeroEmpenho(valor)
      setFormulario(prev => ({
        ...prev,
        validacao: { ...prev.validacao, numeroEmpenho: validacao }
      }))
    }

    if (campo === 'valor' && valor !== undefined) {
      const validacaoValor = validarValor(valor)
      const valorNumerico = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor
      
      let validacaoLimite = { valido: true }
      if (validacaoValor.valido && !isNaN(valorNumerico)) {
        validacaoLimite = validarLimiteContrato(
          empenhos,
          valorNumerico,
          valorTotalContrato,
          formulario.empenhoId
        )
      }

      setFormulario(prev => ({
        ...prev,
        validacao: { 
          ...prev.validacao, 
          valor: validacaoValor,
          limite: validacaoLimite
        }
      }))
    }
  }

  const salvarEmpenho = async () => {
    try {
      const { dados } = formulario

      // Validações finais
      const validacaoNumero = validarNumeroEmpenho(dados.numeroEmpenho)
      const validacaoValor = validarValor(dados.valor)
      
      const valorNumerico = typeof dados.valor === 'string' 
        ? parseFloat(dados.valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
        : dados.valor

      const validacaoLimite = validarLimiteContrato(
        empenhos,
        valorNumerico,
        valorTotalContrato,
        formulario.empenhoId
      )

      if (!validacaoNumero.valido || !validacaoValor.valido || !validacaoLimite.valido) {
        setFormulario(prev => ({
          ...prev,
          validacao: {
            numeroEmpenho: validacaoNumero,
            valor: validacaoValor,
            limite: validacaoLimite
          }
        }))
        return
      }

      if (formulario.editando && formulario.empenhoId) {
        // Atualizar empenho existente
        await atualizarEmpenho(formulario.empenhoId, {
          valor: valorNumerico,
          dataEmpenho: dados.dataEmpenho,
          observacao: dados.observacao
        })
        
        toast.success('Empenho atualizado com sucesso')
      } else {
        // Criar novo empenho
        await criarEmpenho({
          contratoId,
          unidadeSaudeId: dados.unidadeSaudeId,
          numeroEmpenho: dados.numeroEmpenho,
          valor: valorNumerico,
          dataEmpenho: dados.dataEmpenho,
          observacao: dados.observacao
        })

        toast.success('Empenho criado com sucesso')
      }

      fecharFormulario()
      await carregarEmpenhos()
    } catch (error) {
      console.error('Erro ao salvar empenho:', error)
      toast.error('Não foi possível salvar o empenho')
    }
  }

  const excluirEmpenhoHandler = async (id: string) => {
    try {
      await excluirEmpenho(id)
      toast.success('Empenho excluído com sucesso')
      await carregarEmpenhos()
    } catch (error) {
      console.error('Erro ao excluir empenho:', error)
      toast.error('Não foi possível excluir o empenho')
    }
  }

  const obterNomeUnidade = (unidadeId: string) => {
    const unidade = unidadesVinculadas.find(u => u.id === unidadeId)
    return unidade?.nomeUnidade || 'Unidade não encontrada'
  }

  const formularioValido = () => {
    const { validacao, dados } = formulario
    return (
      validacao.numeroEmpenho.valido &&
      validacao.valor.valido &&
      validacao.limite.valido &&
      dados.unidadeSaudeId &&
      dados.numeroEmpenho &&
      dados.valor
    )
  }

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo e Estatísticas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card de Resumo Financeiro */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {currencyUtils.formatar(estatisticas.valorTotalEmpenhado)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Empenhado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {currencyUtils.formatar(estatisticas.valorDisponivel)}
                </p>
                <p className="text-sm text-muted-foreground">Disponível</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {estatisticas.percentualEmpenhado.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Percentual</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso dos Empenhos</span>
                <span>{estatisticas.percentualEmpenhado.toFixed(1)}%</span>
              </div>
              <Progress value={estatisticas.percentualEmpenhado} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Card de Estatísticas Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total de Empenhos</span>
                <Badge variant="outline">{estatisticas.totalEmpenhos}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Unidades com Empenho</span>
                <Badge variant="outline">{estatisticas.unidadesComEmpenho}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor Total do Contrato</span>
                <span className="text-sm font-medium">
                  {currencyUtils.formatar(valorTotalContrato)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empenhos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Empenhos Registrados
            </CardTitle>
            <Button onClick={() => abrirFormulario()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Empenho
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {empenhos.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum empenho registrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro empenho deste contrato
              </p>
              <Button onClick={() => abrirFormulario()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Empenho
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {empenhos.map((empenho, index) => (
                <motion.div
                  key={empenho.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {empenho.numeroEmpenho}
                        </Badge>
                        <span className="text-lg font-bold text-green-600">
                          {currencyUtils.formatar(empenho.valor)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{obterNomeUnidade(empenho.unidadeSaudeId)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(empenho.dataEmpenho).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {empenho.observacao && (
                        <p className="text-sm text-muted-foreground italic">
                          {empenho.observacao}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirFormulario(empenho)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => excluirEmpenhoHandler(empenho.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <AnimatePresence>
        {formulario.aberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => e.target === e.currentTarget && fecharFormulario()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {formulario.editando ? 'Editar Empenho' : 'Novo Empenho'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={fecharFormulario}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Unidade */}
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Select
                      value={formulario.dados.unidadeSaudeId}
                      onValueChange={(value) => atualizarCampo('unidadeSaudeId', value)}
                      disabled={formulario.editando}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesVinculadas.map((unidade) => (
                          <SelectItem key={unidade.id} value={unidade.id}>
                            {unidade.nomeUnidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número do Empenho */}
                  <div className="space-y-2">
                    <Label htmlFor="numeroEmpenho">Número da Nota de Empenho *</Label>
                    <Input
                      id="numeroEmpenho"
                      value={formulario.dados.numeroEmpenho}
                      onChange={(e) => atualizarCampo('numeroEmpenho', e.target.value)}
                      placeholder="Ex: 2025NE000123"
                      className={`font-mono ${!formulario.validacao.numeroEmpenho.valido ? 'border-red-500' : ''}`}
                      disabled={formulario.editando}
                    />
                    {!formulario.validacao.numeroEmpenho.valido && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{formulario.validacao.numeroEmpenho.erro}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Formato: AAAANE999999 (Ano + "NE" + 6 dígitos)
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor Empenhado *</Label>
                    <Input
                      id="valor"
                      value={formulario.dados.valor}
                      onChange={(e) => atualizarCampo('valor', e.target.value)}
                      placeholder="0,00"
                      className={`${(!formulario.validacao.valor.valido || !formulario.validacao.limite.valido) ? 'border-red-500' : ''}`}
                    />
                    {!formulario.validacao.valor.valido && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{formulario.validacao.valor.erro}</span>
                      </div>
                    )}
                    {!formulario.validacao.limite.valido && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{formulario.validacao.limite.erro}</span>
                      </div>
                    )}
                  </div>

                  {/* Data do Empenho */}
                  <div className="space-y-2">
                    <Label htmlFor="dataEmpenho">Data do Empenho *</Label>
                    <Input
                      id="dataEmpenho"
                      type="date"
                      value={formulario.dados.dataEmpenho}
                      onChange={(e) => atualizarCampo('dataEmpenho', e.target.value)}
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacao">Observações</Label>
                    <Textarea
                      id="observacao"
                      value={formulario.dados.observacao}
                      onChange={(e) => atualizarCampo('observacao', e.target.value)}
                      placeholder="Observações sobre o empenho..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={fecharFormulario}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={salvarEmpenho}
                    disabled={!formularioValido()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {formulario.editando ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}