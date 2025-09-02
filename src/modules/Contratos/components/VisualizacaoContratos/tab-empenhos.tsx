import { useState, useMemo, useCallback, useEffect } from 'react'
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
  Save, 
  X, 
  DollarSign, 
  Building, 
  Calendar, 
  AlertCircle,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { useEmpenhosWithRetry, useUnidadeNome } from '../../hooks/use-empenhos-with-retry'
import { getUnidadeById } from '@/modules/Unidades/services/unidades-service'
import { 
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
  empenhosIniciais?: Empenho[] // Dados de empenhos já disponíveis
}

interface EstadoFormulario {
  aberto: boolean
  dados: EmpenhoForm
  validacao: ValidacaoEmpenho
}

interface EstadoModalConfirmacao {
  aberto: boolean
  empenhoId?: string
  numeroEmpenho?: string
}

// Hook para buscar nomes das unidades em lote
function useUnidadesNomes(unidadesVinculadas: ContratoUnidadeSaudeDto[]) {
  const [nomesUnidades, setNomesUnidades] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const buscarNomesUnidades = async () => {
      if (!unidadesVinculadas.length) return

      console.log('🔍 Hook Debug - Iniciando busca de nomes:', unidadesVinculadas.length, 'unidades')
      
      try {
        setCarregando(true)
        const nomes: Record<string, string> = {}

        // Buscar nomes apenas para unidades que não têm nomeUnidade
        const unidadesSemNome = unidadesVinculadas.filter(u => !u.nomeUnidade)
        console.log('🔍 Hook Debug - Unidades sem nome:', unidadesSemNome.length)
        
        for (const unidade of unidadesSemNome) {
          try {
            console.log('🔍 Hook Debug - Buscando unidade:', unidade.unidadeSaudeId)
            const unidadeData = await getUnidadeById(unidade.unidadeSaudeId)
            console.log('🔍 Hook Debug - Unidade encontrada:', unidadeData)
            nomes[unidade.unidadeSaudeId] = unidadeData.nome || `Unidade ${unidade.unidadeSaudeId}`
          } catch (error) {
            console.error(`Erro ao buscar unidade ${unidade.unidadeSaudeId}:`, error)
            nomes[unidade.unidadeSaudeId] = `Unidade ${unidade.unidadeSaudeId}`
          }
        }

        // Adicionar nomes das unidades que já têm nomeUnidade
        unidadesVinculadas.forEach(u => {
          if (u.nomeUnidade) {
            console.log('🔍 Hook Debug - Unidade com nome já disponível:', u.unidadeSaudeId, u.nomeUnidade)
            nomes[u.unidadeSaudeId] = u.nomeUnidade
          }
        })

        console.log('🔍 Hook Debug - Nomes finais:', nomes)
        setNomesUnidades(nomes)
      } catch (error) {
        console.error('Erro ao buscar nomes das unidades:', error)
      } finally {
        setCarregando(false)
      }
    }

    buscarNomesUnidades()
  }, [unidadesVinculadas])

  return { nomesUnidades, carregando }
}

// Componente para exibir nome da unidade
function NomeUnidade({ unidadeId }: { unidadeId: string }) {
  const { nomeUnidade, carregando } = useUnidadeNome(unidadeId)
  
  if (carregando) {
    return <span className="text-muted-foreground">Carregando...</span>
  }
  
  return <span>{nomeUnidade || `Unidade ${unidadeId}`}</span>
}

export function TabEmpenhos({ contratoId, valorTotalContrato, unidadesVinculadas = [], empenhosIniciais = [] }: TabEmpenhosProps) {
  // Se temos empenhos iniciais, usar eles diretamente
  const temEmpenhosIniciais = empenhosIniciais.length > 0
  
  const {
    empenhos,
    carregando,
    erro,
    carregarEmpenhos,
    salvarEmpenho: salvarEmpenhoHook,
    excluirEmpenho,
    limparErro
  } = useEmpenhosWithRetry(contratoId)
  
  // Hook para buscar nomes das unidades
  const { nomesUnidades, carregando: carregandoNomes } = useUnidadesNomes(unidadesVinculadas)
  
  // Debug temporário para verificar nomes
  console.log('🔍 Debug Nomes Unidades:', { 
    unidadesVinculadas: unidadesVinculadas.length,
    nomesUnidades,
    carregandoNomes 
  })
  
  // Estado para filtro de unidade
  const [filtroUnidade, setFiltroUnidade] = useState<string>('todas')
  
  // Usar empenhos iniciais se disponíveis, senão usar os do hook
  const empenhosExibidos = useMemo(() => {
    const empenhosBase = temEmpenhosIniciais ? empenhosIniciais : empenhos
    
    // Aplicar filtro por unidade se selecionado
    if (filtroUnidade && filtroUnidade !== 'todas') {
      return empenhosBase.filter(empenho => empenho.unidadeSaudeId === filtroUnidade)
    }
    
    return empenhosBase
  }, [temEmpenhosIniciais, empenhosIniciais, empenhos, filtroUnidade])
  
  // Obter nome da unidade selecionada no filtro
  const nomeUnidadeFiltro = useMemo(() => {
    if (!filtroUnidade || filtroUnidade === 'todas') return ''
    const unidade = unidadesVinculadas.find(u => u.unidadeSaudeId === filtroUnidade)
    return nomesUnidades[filtroUnidade] || unidade?.nomeUnidade || `Unidade ${filtroUnidade}`
  }, [filtroUnidade, unidadesVinculadas, nomesUnidades])

  const [formulario, setFormulario] = useState<EstadoFormulario>({
    aberto: false,
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

  const [modalConfirmacao, setModalConfirmacao] = useState<EstadoModalConfirmacao>({
    aberto: false
  })

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    return calcularEstatisticas(empenhosExibidos, valorTotalContrato)
  }, [empenhosExibidos, valorTotalContrato])

  const abrirFormulario = useCallback(() => {
    setFormulario({
      aberto: true,
      dados: {
        unidadeSaudeId: filtroUnidade && filtroUnidade !== 'todas' ? filtroUnidade : '', // Pré-selecionar unidade se há filtro
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
  }, [filtroUnidade])

  const fecharFormulario = useCallback(() => {
    setFormulario(prev => ({ ...prev, aberto: false }))
  }, [])

  const abrirModalConfirmacao = useCallback((empenho: Empenho) => {
    setModalConfirmacao({
      aberto: true,
      empenhoId: empenho.id,
      numeroEmpenho: empenho.numeroEmpenho
    })
  }, [])

  const fecharModalConfirmacao = useCallback(() => {
    setModalConfirmacao({ aberto: false })
  }, [])

  const confirmarExclusao = useCallback(async () => {
    if (modalConfirmacao.empenhoId) {
      try {
        await excluirEmpenho(modalConfirmacao.empenhoId)
        fecharModalConfirmacao()
      } catch (error) {
        console.error('Erro ao excluir empenho:', error)
        // O erro já é tratado pelo hook
      }
    }
  }, [modalConfirmacao.empenhoId, excluirEmpenho, fecharModalConfirmacao])

  const atualizarCampo = useCallback((campo: keyof EmpenhoForm, valor: string | number | undefined) => {
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
      // Para valor, aplicar formatação monetária se for string
      if (typeof valor === 'string') {
        const valorFormatado = currencyUtils.aplicarMascara(valor)
        setFormulario(prev => ({
          ...prev,
          dados: { ...prev.dados, valor: valorFormatado }
        }))
        
        // Validar o valor numérico
        const valorNumerico = currencyUtils.paraNumero(valorFormatado)
        const validacaoValor = validarValor(valorNumerico)
        
        let validacaoLimite = { valido: true }
        if (validacaoValor.valido && !isNaN(valorNumerico)) {
          validacaoLimite = validarLimiteContrato(
            empenhosExibidos,
            valorNumerico,
            valorTotalContrato
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
      } else {
        // Se for número, validar diretamente
        const validacaoValor = validarValor(valor)
        
        let validacaoLimite = { valido: true }
        if (validacaoValor.valido && !isNaN(valor)) {
          validacaoLimite = validarLimiteContrato(
            empenhosExibidos,
            valor,
            valorTotalContrato
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
  }, [empenhosExibidos, valorTotalContrato])

    const salvarEmpenhoHandler = useCallback(async () => {
    try {
      const { dados } = formulario

      // Validações finais
      const validacaoNumero = validarNumeroEmpenho(dados.numeroEmpenho)
      const valorNumerico = typeof dados.valor === 'string' 
        ? currencyUtils.paraNumero(dados.valor)
        : dados.valor
      const validacaoValor = validarValor(valorNumerico)

      const validacaoLimite = validarLimiteContrato(
        empenhosExibidos,
        valorNumerico,
        valorTotalContrato
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

      // Criar novo empenho
      await salvarEmpenhoHook({
        contratoId,
        unidadeSaudeId: dados.unidadeSaudeId,
        numeroEmpenho: dados.numeroEmpenho,
        valor: valorNumerico,
        dataEmpenho: dados.dataEmpenho,
        observacao: dados.observacao
      })

      // Limpar filtro se o empenho foi criado para uma unidade diferente
      if (filtroUnidade && filtroUnidade !== 'todas' && dados.unidadeSaudeId !== filtroUnidade) {
        setFiltroUnidade('todas')
      }

      fecharFormulario()
    } catch (error) {
      console.error('Erro ao salvar empenho:', error)
      // O erro já é tratado pelo hook
    }
  }, [formulario, empenhosExibidos, valorTotalContrato, contratoId, salvarEmpenhoHook, fecharFormulario, filtroUnidade])

  const formularioValido = useCallback(() => {
    const { validacao, dados } = formulario
    return (
      validacao.numeroEmpenho.valido &&
      validacao.valor.valido &&
      validacao.limite.valido &&
      dados.unidadeSaudeId &&
      dados.numeroEmpenho &&
      dados.valor
    )
  }, [formulario])

  const tentarNovamente = useCallback(() => {
    limparErro()
    carregarEmpenhos()
  }, [limparErro, carregarEmpenhos])

  if (carregando && !temEmpenhosIniciais) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Exibir erro 500 se houver
  if (erro && erro.includes('Erro 500')) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">
                Erro 500 - Servidor Indisponível
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              O servidor está enfrentando problemas técnicos após múltiplas tentativas de conexão. 
              Por favor, tente novamente em alguns minutos.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={tentarNovamente}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
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
                 <span className="text-sm text-muted-foreground">
                   {filtroUnidade && filtroUnidade !== 'todas' ? 'Empenhos da Unidade' : 'Total de Empenhos'}
                 </span>
                 <Badge variant="outline">{estatisticas.totalEmpenhos}</Badge>
               </div>
               <div className="flex justify-between">
                 <span className="text-sm text-muted-foreground">
                   {filtroUnidade && filtroUnidade !== 'todas' ? 'Valor da Unidade' : 'Unidades com Empenho'}
                 </span>
                 {filtroUnidade && filtroUnidade !== 'todas' ? (
                   <span className="text-sm font-medium">
                     {currencyUtils.formatar(estatisticas.valorTotalEmpenhado)}
                   </span>
                 ) : (
                   <Badge variant="outline">{estatisticas.unidadesComEmpenho}</Badge>
                 )}
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
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Empenhos Registrados
              </CardTitle>
                             {filtroUnidade && filtroUnidade !== 'todas' && (
                 <Badge variant="secondary" className="text-xs">
                   Filtrado: {nomeUnidadeFiltro}
                 </Badge>
               )}
            </div>
            <Button onClick={abrirFormulario}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Empenho
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtro por Unidade */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="filtroUnidade" className="text-sm font-medium">
                  Filtrar por Unidade
                </Label>
                <Select
                  value={filtroUnidade}
                  onValueChange={setFiltroUnidade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                                     <SelectContent>
                     <SelectItem value="todas">
                       Todas as unidades
                     </SelectItem>
                     {unidadesVinculadas.map((unidade) => (
                       <SelectItem key={unidade.unidadeSaudeId} value={unidade.unidadeSaudeId}>
                         {carregandoNomes ? 'Carregando...' : (nomesUnidades[unidade.unidadeSaudeId] || unidade.nomeUnidade || `Unidade ${unidade.unidadeSaudeId}`)}
                       </SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>
                             {filtroUnidade && filtroUnidade !== 'todas' && (
                 <div className="flex items-center gap-2">
                   <Badge variant="secondary" className="text-sm">
                     Filtrado: {nomeUnidadeFiltro}
                   </Badge>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setFiltroUnidade('todas')}
                     className="h-6 px-2"
                   >
                     <X className="h-3 w-3" />
                   </Button>
                 </div>
               )}
            </div>
          </div>
          {empenhosExibidos.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                             <h3 className="text-lg font-medium mb-2">
                 {filtroUnidade && filtroUnidade !== 'todas'
                   ? `Nenhum empenho encontrado para ${nomeUnidadeFiltro}`
                   : 'Nenhum empenho registrado'
                 }
               </h3>
               <p className="text-muted-foreground mb-4">
                 {filtroUnidade && filtroUnidade !== 'todas'
                   ? 'Esta unidade ainda não possui empenhos registrados'
                   : 'Comece adicionando o primeiro empenho deste contrato'
                 }
               </p>
               <Button onClick={abrirFormulario}>
                 <Plus className="h-4 w-4 mr-2" />
                 {filtroUnidade && filtroUnidade !== 'todas' ? 'Adicionar Empenho' : 'Adicionar Primeiro Empenho'}
               </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {empenhosExibidos.map((empenho, index) => (
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
                          <NomeUnidade unidadeId={empenho.unidadeSaudeId} />
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
                        onClick={() => abrirModalConfirmacao(empenho)}
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh]"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Novo Empenho
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
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder="Selecione a unidade">
                          {formulario.dados.unidadeSaudeId && (
                            <span>
                              {carregandoNomes ? 'Carregando...' : (nomesUnidades[formulario.dados.unidadeSaudeId] || unidadesVinculadas.find(u => u.unidadeSaudeId === formulario.dados.unidadeSaudeId)?.nomeUnidade || `Unidade ${formulario.dados.unidadeSaudeId}`)}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                                                                   <SelectContent className="z-[10000]">
                        {unidadesVinculadas.length === 0 ? (
                          <SelectItem value="" disabled>
                            Nenhuma unidade disponível
                          </SelectItem>
                        ) : (
                          unidadesVinculadas.map((unidade) => (
                            <SelectItem key={unidade.unidadeSaudeId} value={unidade.unidadeSaudeId}>
                              {carregandoNomes ? 'Carregando...' : (nomesUnidades[unidade.unidadeSaudeId] || unidade.nomeUnidade || `Unidade ${unidade.unidadeSaudeId}`)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                                         {filtroUnidade && filtroUnidade !== 'todas' && formulario.dados.unidadeSaudeId === filtroUnidade && (
                       <p className="text-xs text-blue-600">
                         ✓ Unidade pré-selecionada do filtro ativo
                       </p>
                     )}
                  </div>

                                     {/* Número da Nota Fiscal */}
                   <div className="space-y-2">
                     <Label htmlFor="numeroEmpenho">Número da Nota de Empenho *</Label>
                     <Input
                       id="numeroEmpenho"
                       value={formulario.dados.numeroEmpenho}
                       onChange={(e) => atualizarCampo('numeroEmpenho', e.target.value)}
                       placeholder="Ex: 2025NE000123"
                       className={`font-mono ${!formulario.validacao.numeroEmpenho.valido ? 'border-red-500' : ''}`}
                     />
                     {!formulario.validacao.numeroEmpenho.valido && (
                       <div className="flex items-center gap-1 text-red-600 text-sm">
                         <AlertCircle className="h-4 w-4" />
                         <span>{formulario.validacao.numeroEmpenho.erro}</span>
                       </div>
                     )}
                     <p className="text-xs text-muted-foreground">
                       Formato: AAAA + qualquer texto (ex: 2025NE000123, 2025NOTA001, etc.)
                     </p>
                   </div>

                   {/* Valor */}
                   <div className="space-y-2">
                     <Label htmlFor="valor">Valor Empenhado *</Label>
                     <Input
                       id="valor"
                       value={formulario.dados.valor}
                       onChange={(e) => atualizarCampo('valor', e.target.value)}
                       placeholder="R$ 0,00"
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
                     <p className="text-xs text-muted-foreground">
                       Valor mínimo: R$ 100,00 | Máximo: {currencyUtils.formatar(estatisticas.valorDisponivel)}
                     </p>
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
                    onClick={salvarEmpenhoHandler}
                    disabled={!formularioValido()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {modalConfirmacao.aberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => e.target === e.currentTarget && fecharModalConfirmacao()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold">
                    Confirmar Exclusão
                  </h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Tem certeza que deseja excluir o empenho <strong>{modalConfirmacao.numeroEmpenho}</strong>?
                  Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={fecharModalConfirmacao}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={confirmarExclusao}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
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