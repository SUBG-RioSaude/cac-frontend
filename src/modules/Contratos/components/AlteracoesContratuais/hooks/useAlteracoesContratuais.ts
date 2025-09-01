import { useState, useCallback, useMemo } from 'react'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualResponse,
  AlertaLimiteLegal,
  BlocoValor
} from '../../../types/alteracoes-contratuais'
import {
  StatusAlteracao,
  OperacaoValor,
  OperacaoVigencia,
  getBlocosObrigatorios,
  getLimiteLegal
} from '../../../types/alteracoes-contratuais'
import { 
  useCriarAlteracaoContratual,
  useAtualizarAlteracaoContratual
  // useResumoAlteracao - DESABILITADO: endpoint não implementado na API
} from '../../../hooks/useAlteracoesContratuaisApi'

interface UseAlteracoesContratuaisProps {
  contratoId: string
  valorOriginal?: number
  alteracaoId?: string // Para edição
  initialData?: Partial<AlteracaoContratualForm>
  onSaved?: (alteracao: AlteracaoContratualResponse) => void
  onSubmitted?: (alteracao: AlteracaoContratualResponse) => void
  onLimiteLegalAlert?: (alerta: AlertaLimiteLegal, alteracaoId: string) => void
}

export function useAlteracoesContratuais({
  contratoId,
  // valorOriginal = 0, // Não utilizado no momento
  alteracaoId,
  initialData,
  onSaved,
  onSubmitted,
  onLimiteLegalAlert
}: UseAlteracoesContratuaisProps) {
  // Estado principal
  const [dados, setDados] = useState<Partial<AlteracaoContratualForm>>(() => ({
    contratoId,
    tiposAlteracao: [],
    dadosBasicos: {
      justificativa: '',
      fundamentoLegal: '',
      observacoes: ''
    },
    dataEfeito: '', // Data de efeito obrigatória
    blocos: {},
    status: StatusAlteracao.Rascunho,
    ...initialData
  }))

  // Estados de UI
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [alertaLimiteLegal, setAlertaLimiteLegal] = useState<AlertaLimiteLegal | null>(null)
  const [confirmacaoLimiteLegal, setConfirmacaoLimiteLegal] = useState(false)

  // Mutations da API
  const criarMutation = useCriarAlteracaoContratual({
    onSuccess: (result) => {
      if (result.status === 202 && result.alertaLimiteLegal) {
        // Alerta de limite legal - chamar callback
        setAlertaLimiteLegal(result.alertaLimiteLegal)
        onLimiteLegalAlert?.(result.alertaLimiteLegal, result.alteracao.id)
      } else {
        // Sucesso normal
        onSaved?.(result.alteracao)
      }
    }
  })

  const atualizarMutation = useAtualizarAlteracaoContratual({
    onSuccess: (alteracao) => {
      onSaved?.(alteracao)
    }
  })

  // Query para resumo (preview) - DESABILITADO: endpoint não implementado na API
  // const { data: resumo, isLoading: loadingResumo } = useResumoAlteracao(
  //   contratoId,
  //   dados as AlteracaoContratualForm,
  //   {
  //     enabled: Boolean(
  //       dados.tiposAlteracao?.length && 
  //       dados.dadosBasicos?.justificativa &&
  //       dados.dadosBasicos.justificativa.length >= 10
  //     )
  //   }
  // )
  const resumo = null
  const loadingResumo = false

  // Loading state combinado
  const isLoading = criarMutation.isPending || atualizarMutation.isPending || loadingResumo

  // Blocos obrigatórios baseados nos tipos selecionados
  const blocosObrigatorios = useMemo(() => {
    return getBlocosObrigatorios(dados.tiposAlteracao || [])
  }, [dados.tiposAlteracao])

  // Limite legal aplicável
  const limiteLegal = useMemo(() => {
    return getLimiteLegal(dados.tiposAlteracao || [])
  }, [dados.tiposAlteracao])

  // Atualizar dados
  const atualizarDados = useCallback((novosDados: Partial<AlteracaoContratualForm>) => {
    setDados((prev: Partial<AlteracaoContratualForm>) => ({ ...prev, ...novosDados }))
    
    // Limpar erros relacionados aos campos atualizados
    const novosErrors = { ...errors }
    Object.keys(novosDados).forEach(key => {
      delete novosErrors[key]
      // Limpar erros de subcampos também
      Object.keys(novosErrors).forEach(errorKey => {
        if (errorKey.startsWith(`${key}.`)) {
          delete novosErrors[errorKey]
        }
      })
    })
    setErrors(novosErrors)
  }, [errors])

  // Validar campos obrigatórios
  const validarCamposObrigatorios = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {}

    console.log('🔍 Iniciando validação de campos obrigatórios')
    console.log('🔍 Dados completos:', dados)
    console.log('🔍 Estrutura dos blocos:', dados.blocos)
    console.log('🔍 Tipos alteração:', dados.tiposAlteracao)
    console.log('🔍 Data efeito:', dados.dataEfeito)

    // Validar campos básicos
    if (!dados.tiposAlteracao || dados.tiposAlteracao.length === 0) {
      novosErrors.tiposAlteracao = 'Selecione ao menos um tipo de alteração'
      console.log('❌ Tipos de alteração:', dados.tiposAlteracao)
    } else {
      console.log('✅ Tipos de alteração OK:', dados.tiposAlteracao)
    }

    if (!dados.dadosBasicos?.justificativa || dados.dadosBasicos.justificativa.trim().length < 10) {
      novosErrors['dadosBasicos.justificativa'] = 'Justificativa deve ter pelo menos 10 caracteres'
      console.log('❌ Justificativa:', dados.dadosBasicos?.justificativa?.length, 'caracteres')
    } else {
      console.log('✅ Justificativa OK:', dados.dadosBasicos?.justificativa?.length, 'caracteres')
    }

    if (!dados.dataEfeito || dados.dataEfeito === '') {
      novosErrors['dataEfeito'] = 'Data de efeito é obrigatória'
      console.log('❌ Data de efeito:', dados.dataEfeito)
    } else {
      console.log('✅ Data de efeito OK:', dados.dataEfeito)
    }

    // Validar blocos obrigatórios
    if (dados.tiposAlteracao && dados.tiposAlteracao.length > 0) {
      const blocosObrigatorios = getBlocosObrigatorios(dados.tiposAlteracao)
      console.log('🔧 Blocos obrigatórios:', Array.from(blocosObrigatorios))
      console.log('🔧 Blocos disponíveis:', dados.blocos)

      // Validar bloco vigência
      if (blocosObrigatorios.has('vigencia')) {
        console.log('🔍 Validando bloco VIGÊNCIA...')
        console.log('   - dados.blocos?.vigencia:', dados.blocos?.vigencia)
        if (!dados.blocos?.vigencia) {
          console.log('   ❌ Bloco vigência não encontrado')
          novosErrors['blocos.vigencia.operacao'] = 'Bloco Vigência é obrigatório para os tipos selecionados'
        } else {
          const vigencia = dados.blocos.vigencia
          if (vigencia.operacao === undefined) {
            novosErrors['blocos.vigencia.operacao'] = 'Operação de vigência é obrigatória'
          }

          // Validações específicas por operação
          if (vigencia.operacao !== undefined) {
            const operacao = vigencia.operacao
            
            if (operacao === OperacaoVigencia.Substituir) {
              if (!vigencia.novaDataFinal) {
                novosErrors['blocos.vigencia.novaDataFinal'] = 'Nova data final é obrigatória'
              }
            } else if ((operacao === OperacaoVigencia.SuspenderDeterminado || operacao === OperacaoVigencia.SuspenderIndeterminado)) {
              // Para suspensão determinada, validar período
              if (operacao === OperacaoVigencia.SuspenderDeterminado) {
                // Adicionar validações específicas se necessário
              }
            }
          }
        }
      }

      // Validar bloco valor
      if (blocosObrigatorios.has('valor')) {
        console.log('🔍 Validando bloco VALOR...')
        if (!dados.blocos?.valor) {
          novosErrors['blocos.valor.operacao'] = 'Bloco Valor é obrigatório para os tipos selecionados'
          console.log('❌ Bloco valor ausente')
        } else {
          const valor = dados.blocos.valor as BlocoValor
          console.log('🔧 Dados do bloco valor:', valor)
          
          if (valor.operacao === undefined) {
            novosErrors['blocos.valor.operacao'] = 'Operação de valor é obrigatória'
            console.log('❌ Operação não definida')
          } else {
            console.log('✅ Operação definida:', valor.operacao)
          }

          // Validações específicas por operação
          if (valor.operacao !== undefined) {
            const operacao = valor.operacao
            console.log('🔧 Validando operação:', operacao, '(Substituir =', OperacaoValor.Substituir, ')')
            
            if (operacao === OperacaoValor.Substituir) {
              // Para substituir, precisa do novo valor global
              if (!valor.novoValorGlobal || valor.novoValorGlobal <= 0) {
                novosErrors['blocos.valor.novoValorGlobal'] = 'Novo valor global é obrigatório e deve ser maior que zero'
                console.log('❌ Novo valor global:', valor.novoValorGlobal)
              } else {
                console.log('✅ Novo valor global OK:', valor.novoValorGlobal)
              }
            } else {
              // Para acrescentar/diminuir, precisa de valor de ajuste OU percentual
              const temValorAjuste = valor.valorAjuste && valor.valorAjuste > 0
              const temPercentual = valor.percentualAjuste && valor.percentualAjuste > 0
              
              console.log('🔧 Validação Valor Ajuste:')
              console.log('   - valorAjuste:', valor.valorAjuste, '(tipo:', typeof valor.valorAjuste, ')')
              console.log('   - percentualAjuste:', valor.percentualAjuste, '(tipo:', typeof valor.percentualAjuste, ')')
              console.log('   - temValorAjuste:', temValorAjuste)
              console.log('   - temPercentual:', temPercentual)
              
              if (!temValorAjuste && !temPercentual) {
                novosErrors['blocos.valor.valorAjuste'] = 'Informe o valor de ajuste ou percentual'
                console.log('❌ Erro: Nenhum valor informado (ajuste ou percentual)')
                console.log('❌ Dados completos do valor:', JSON.stringify(valor, null, 2))
              } else {
                console.log('✅ Valor informado:', temValorAjuste ? 'ajuste' : 'percentual')
              }
            }
          }
        }
      }

      // Validar bloco fornecedores
      if (blocosObrigatorios.has('fornecedores')) {
        if (!dados.blocos?.fornecedores) {
          novosErrors['blocos.fornecedores'] = 'Bloco Fornecedores é obrigatório para os tipos selecionados'
        } else {
          const fornecedores = dados.blocos.fornecedores
          // Check if we have any fornecedor operations
          const hasVinculados = fornecedores.fornecedoresVinculados && fornecedores.fornecedoresVinculados.length > 0
          const hasDesvinculados = fornecedores.fornecedoresDesvinculados && fornecedores.fornecedoresDesvinculados.length > 0
          const hasNovoFornecedor = fornecedores.novoFornecedorPrincipal && fornecedores.novoFornecedorPrincipal.trim() !== ''

          if (!hasVinculados && !hasDesvinculados && !hasNovoFornecedor) {
            novosErrors['blocos.fornecedores'] = 'Deve especificar pelo menos uma alteração em fornecedores'
          }
        }
      }

      // Validar bloco unidades
      if (blocosObrigatorios.has('unidades')) {
        if (!dados.blocos?.unidades) {
          novosErrors['blocos.unidades'] = 'Bloco Unidades é obrigatório para os tipos selecionados'
        } else {
          const unidades = dados.blocos.unidades

          // Check if we have any unidades operations
          const hasVinculadas = unidades.unidadesVinculadas && unidades.unidadesVinculadas.length > 0
          const hasDesvinculadas = unidades.unidadesDesvinculadas && unidades.unidadesDesvinculadas.length > 0

          if (!hasVinculadas && !hasDesvinculadas) {
            novosErrors['blocos.unidades'] = 'Deve especificar pelo menos uma alteração em unidades'
          }
        }
      }

      // Validar bloco cláusulas
      if (blocosObrigatorios.has('clausulas')) {
        if (!dados.blocos?.clausulas) {
          novosErrors['blocos.clausulas.clausulasAlteradas'] = 'Bloco Cláusulas é obrigatório para os tipos selecionados'
        } else {
          const clausulas = dados.blocos.clausulas
          if (!clausulas.clausulasAlteradas || clausulas.clausulasAlteradas.length === 0) {
            novosErrors['blocos.clausulas.clausulasAlteradas'] = 'Deve haver pelo menos uma cláusula alterada'
          }
        }
      }
    }

    setErrors(novosErrors)
    const isValid = Object.keys(novosErrors).length === 0
    
    console.log('📊 Resultado da validação:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO')
    console.log('📊 Total de erros:', Object.keys(novosErrors).length)
    if (!isValid) {
      console.log('📊 Lista completa de erros encontrados:')
      Object.entries(novosErrors).forEach(([campo, erro], index) => {
        console.log(`   ${index + 1}. ${campo}: ${erro}`)
      })
    }
    
    return isValid
  }, [dados])

  // DESABILITADO: Detectar alerta de limite legal do resumo da API
  // useEffect(() => {
  //   if (resumo?.alertaLimiteLegal) {
  //     setAlertaLimiteLegal(resumo.alertaLimiteLegal)
  //   } else {
  //     setAlertaLimiteLegal(null)
  //   }
  // }, [resumo])

  // Validar campos sem modificar o estado (para uso interno)
  const validarCamposSemEstado = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {}

    // Validar campos básicos
    if (!dados.tiposAlteracao || dados.tiposAlteracao.length === 0) {
      novosErrors.tiposAlteracao = 'Selecione ao menos um tipo de alteração'
    }

    if (!dados.dadosBasicos?.justificativa || dados.dadosBasicos.justificativa.trim().length < 10) {
      novosErrors['dadosBasicos.justificativa'] = 'Justificativa deve ter pelo menos 10 caracteres'
    }

    if (!dados.dataEfeito || dados.dataEfeito === '') {
      novosErrors['dataEfeito'] = 'Data de efeito é obrigatória'
    }

    // Validar blocos obrigatórios
    if (dados.tiposAlteracao && dados.tiposAlteracao.length > 0) {
      const blocosObrigatorios = getBlocosObrigatorios(dados.tiposAlteracao)

      // Validar bloco vigência
      if (blocosObrigatorios.has('vigencia')) {
        if (!dados.blocos?.vigencia) {
          novosErrors['blocos.vigencia.operacao'] = 'Bloco Vigência é obrigatório para os tipos selecionados'
        } else {
          const vigencia = dados.blocos.vigencia
          if (vigencia.operacao === undefined) {
            novosErrors['blocos.vigencia.operacao'] = 'Operação de vigência é obrigatória'
          }

          // Validações específicas por operação
          if (vigencia.operacao !== undefined) {
            const operacao = vigencia.operacao
            
            if (operacao === OperacaoVigencia.Substituir) {
              if (!vigencia.novaDataFinal) {
                novosErrors['blocos.vigencia.novaDataFinal'] = 'Nova data final é obrigatória'
              }
            }
          }
        }
      }

      // Validar bloco valor
      if (blocosObrigatorios.has('valor')) {
        if (!dados.blocos?.valor) {
          novosErrors['blocos.valor.operacao'] = 'Bloco Valor é obrigatório para os tipos selecionados'
        } else {
          const valor = dados.blocos.valor as BlocoValor
          
          if (valor.operacao === undefined) {
            novosErrors['blocos.valor.operacao'] = 'Operação de valor é obrigatória'
          } else {
            const operacao = valor.operacao
            
            if (operacao === OperacaoValor.Substituir) {
              if (!valor.novoValorGlobal || valor.novoValorGlobal <= 0) {
                novosErrors['blocos.valor.novoValorGlobal'] = 'Novo valor global é obrigatório e deve ser maior que zero'
              }
            } else {
              const temValorAjuste = valor.valorAjuste && valor.valorAjuste > 0
              const temPercentual = valor.percentualAjuste && valor.percentualAjuste > 0
              
              if (!temValorAjuste && !temPercentual) {
                novosErrors['blocos.valor.valorAjuste'] = 'Informe o valor de ajuste ou percentual'
              }
            }
          }
        }
      }

      // Validar bloco fornecedores
      if (blocosObrigatorios.has('fornecedores')) {
        if (!dados.blocos?.fornecedores) {
          novosErrors['blocos.fornecedores'] = 'Bloco Fornecedores é obrigatório para os tipos selecionados'
        } else {
          const fornecedores = dados.blocos.fornecedores
          // Check if we have any fornecedor operations
          const hasVinculados = fornecedores.fornecedoresVinculados && fornecedores.fornecedoresVinculados.length > 0
          const hasDesvinculados = fornecedores.fornecedoresDesvinculados && fornecedores.fornecedoresDesvinculados.length > 0
          const hasNovoFornecedor = fornecedores.novoFornecedorPrincipal && fornecedores.novoFornecedorPrincipal.trim() !== ''

          if (!hasVinculados && !hasDesvinculados && !hasNovoFornecedor) {
            novosErrors['blocos.fornecedores'] = 'Deve especificar pelo menos uma alteração em fornecedores'
          }
        }
      }

      // Validar bloco unidades
      if (blocosObrigatorios.has('unidades')) {
        if (!dados.blocos?.unidades) {
          novosErrors['blocos.unidades'] = 'Bloco Unidades é obrigatório para os tipos selecionados'
        } else {
          const unidades = dados.blocos.unidades

          // Check if we have any unidades operations
          const hasVinculadas = unidades.unidadesVinculadas && unidades.unidadesVinculadas.length > 0
          const hasDesvinculadas = unidades.unidadesDesvinculadas && unidades.unidadesDesvinculadas.length > 0

          if (!hasVinculadas && !hasDesvinculadas) {
            novosErrors['blocos.unidades'] = 'Deve especificar pelo menos uma alteração em unidades'
          }
        }
      }

      // Validar bloco cláusulas
      if (blocosObrigatorios.has('clausulas')) {
        if (!dados.blocos?.clausulas) {
          novosErrors['blocos.clausulas.clausulasAlteradas'] = 'Bloco Cláusulas é obrigatório para os tipos selecionados'
        } else {
          const clausulas = dados.blocos.clausulas
          if (!clausulas.clausulasAlteradas || clausulas.clausulasAlteradas.length === 0) {
            novosErrors['blocos.clausulas.clausulasAlteradas'] = 'Deve haver pelo menos uma cláusula alterada'
          }
        }
      }
    }

    return Object.keys(novosErrors).length === 0
  }, [dados])

  // Validar se pode submeter
  const podeSubmeter = useMemo(() => {
    const camposValidos = validarCamposSemEstado()
    const limiteConfirmado = !alertaLimiteLegal || confirmacaoLimiteLegal
    return camposValidos && limiteConfirmado && !isLoading
  }, [validarCamposSemEstado, alertaLimiteLegal, confirmacaoLimiteLegal, isLoading])

  // Salvar como rascunho ou atualizar
  const salvarRascunho = useCallback(async () => {
    const dadosCompletos = {
      ...dados,
      status: StatusAlteracao.Rascunho
    } as AlteracaoContratualForm

    if (alteracaoId) {
      // Atualizar existente
      await atualizarMutation.mutateAsync({
        id: alteracaoId,
        dados: dadosCompletos
      })
    } else {
      // Criar novo
      await criarMutation.mutateAsync({
        contratoId,
        dados: dadosCompletos
      })
    }
  }, [dados, alteracaoId, contratoId, criarMutation, atualizarMutation])

  // Submeter para aprovação
  const submeterParaAprovacao = useCallback(async () => {
    if (!podeSubmeter) {
      // Forçar validação para mostrar erros
      validarCamposObrigatorios()
      return
    }

    const dadosCompletos = {
      ...dados,
      status: StatusAlteracao.AguardandoAprovacao
    } as AlteracaoContratualForm

    if (alteracaoId) {
      // Atualizar e submeter existente
      const alteracaoAtualizada = await atualizarMutation.mutateAsync({
        id: alteracaoId,
        dados: dadosCompletos
      })
      onSubmitted?.(alteracaoAtualizada)
    } else {
      // Criar e submeter novo
      const result = await criarMutation.mutateAsync({
        contratoId,
        dados: dadosCompletos
      })
      
      if (result.status === 201) {
        onSubmitted?.(result.alteracao)
      }
      // Se for 202, o alerta será tratado pelo callback onLimiteLegalAlert
    }
  }, [dados, podeSubmeter, alteracaoId, contratoId, criarMutation, atualizarMutation, onSubmitted, validarCamposObrigatorios])

  // Confirmar limite legal
  const confirmarLimiteLegal = useCallback(() => {
    setConfirmacaoLimiteLegal(true)
  }, [])

  // Resetar formulário
  const resetarFormulario = useCallback(() => {
    setDados({
      contratoId,
      tiposAlteracao: [],
      dadosBasicos: {
        justificativa: '',
        fundamentoLegal: '',
        observacoes: ''
      },
      blocos: {},
      status: StatusAlteracao.Rascunho
    })
    setErrors({})
    setAlertaLimiteLegal(null)
    setConfirmacaoLimiteLegal(false)
  }, [contratoId])

  return {
    // Estado
    dados,
    isLoading,
    errors,
    alertaLimiteLegal,
    confirmacaoLimiteLegal,
    
    // Computed
    blocosObrigatorios,
    limiteLegal,
    podeSubmeter,
    resumo, // Resumo da API
    
    // Mutations
    criarMutation,
    atualizarMutation,
    
    // Actions
    atualizarDados,
    validarCamposObrigatorios,
    salvarRascunho,
    submeterParaAprovacao,
    confirmarLimiteLegal,
    resetarFormulario
  }
}