import { useState, useCallback, useMemo } from 'react'

import {
  useCriarAlteracaoContratual,
  useAtualizarAlteracaoContratual,
  // useResumoAlteracao - DESABILITADO: endpoint não implementado na API
} from '../../../hooks/useAlteracoesContratuaisApi'
import type {
  AlteracaoContratualForm,
  AlteracaoContratualResponse,
  AlertaLimiteLegal,
} from '../../../types/alteracoes-contratuais'
import {
  StatusAlteracao,
  OperacaoValor,
  OperacaoVigencia,
  getBlocosObrigatorios,
  getLimiteLegal,
} from '../../../types/alteracoes-contratuais'

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
  onLimiteLegalAlert,
}: UseAlteracoesContratuaisProps) {
  // Estado principal
  const [dados, setDados] = useState<Partial<AlteracaoContratualForm>>(() => ({
    contratoId,
    tiposAlteracao: [],
    dadosBasicos: {
      justificativa: '',
      fundamentoLegal: '',
      observacoes: '',
    },
    dataEfeito: '', // Data de efeito obrigatória
    blocos: {},
    status: StatusAlteracao.Rascunho,
    ...initialData,
  }))

  // Estados de UI
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [alertaLimiteLegal, setAlertaLimiteLegal] =
    useState<AlertaLimiteLegal | null>(null)
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
    },
  })

  const atualizarMutation = useAtualizarAlteracaoContratual({
    onSuccess: (alteracao) => {
      onSaved?.(alteracao)
    },
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
  const isLoading =
    criarMutation.isPending || atualizarMutation.isPending || loadingResumo

  // Blocos obrigatórios baseados nos tipos selecionados
  const blocosObrigatorios = useMemo(() => {
    return getBlocosObrigatorios(dados.tiposAlteracao ?? [])
  }, [dados.tiposAlteracao])

  // Limite legal aplicável
  const limiteLegal = useMemo(() => {
    return getLimiteLegal(dados.tiposAlteracao ?? [])
  }, [dados.tiposAlteracao])

  // Atualizar dados
  const atualizarDados = useCallback(
    (novosDados: Partial<AlteracaoContratualForm>) => {
      setDados((prev: Partial<AlteracaoContratualForm>) => ({
        ...prev,
        ...novosDados,
      }))

      // Limpar erros relacionados aos campos atualizados
      const novosErrors = { ...errors }
      Object.keys(novosDados).forEach((key) => {
        delete novosErrors[key]
        // Limpar erros de subcampos também
        Object.keys(novosErrors).forEach((errorKey) => {
          if (errorKey.startsWith(`${key}.`)) {
            delete novosErrors[errorKey]
          }
        })
      })
      setErrors(novosErrors)
    },
    [errors],
  )

  // Validar campos obrigatórios
  const validarCamposObrigatorios = useCallback((): boolean => {
    const novosErrors: Record<string, string> = {}

    // Validar campos básicos
    if (!dados.tiposAlteracao || dados.tiposAlteracao.length === 0) {
      novosErrors.tiposAlteracao = 'Selecione ao menos um tipo de alteração'
    }

    if (
      !dados.dadosBasicos?.justificativa ||
      dados.dadosBasicos.justificativa.trim().length < 10
    ) {
      novosErrors['dadosBasicos.justificativa'] =
        'Justificativa deve ter pelo menos 10 caracteres'
    }

    if (!dados.dataEfeito || dados.dataEfeito === '') {
      novosErrors.dataEfeito = 'Data de efeito é obrigatória'
    }

    // Validar blocos obrigatórios
    if (dados.tiposAlteracao && dados.tiposAlteracao.length > 0) {
      const blocosObrigatoriosValidacao = getBlocosObrigatorios(dados.tiposAlteracao)

      // Validar bloco vigência
      if (blocosObrigatoriosValidacao.has('vigencia')) {
        if (!dados.blocos?.vigencia) {
          novosErrors['blocos.vigencia.operacao'] =
            'Bloco Vigência é obrigatório para os tipos selecionados'
        } else {
          const {vigencia} = dados.blocos
          if (vigencia.operacao === undefined) {
            novosErrors['blocos.vigencia.operacao'] =
              'Operação de vigência é obrigatória'
          }

          // Validações específicas por operação
          if (vigencia.operacao !== undefined) {
            const {operacao} = vigencia

            if (operacao === OperacaoVigencia.Substituir) {
              if (!vigencia.novaDataFinal) {
                novosErrors['blocos.vigencia.novaDataFinal'] =
                  'Nova data final é obrigatória'
              }
            } else if (
              operacao === OperacaoVigencia.Acrescentar ||
              operacao === OperacaoVigencia.Diminuir ||
              operacao === OperacaoVigencia.SuspenderDeterminado
            ) {
              // Para operações com tempo, validar quantidade e unidade
              if (!vigencia.valorTempo || vigencia.valorTempo <= 0) {
                novosErrors['blocos.vigencia.valorTempo'] =
                  'Quantidade de tempo é obrigatória'
              }
              if (vigencia.tipoUnidade === undefined) {
                novosErrors['blocos.vigencia.tipoUnidade'] =
                  'Unidade de tempo deve ser selecionada'
              }
            } else if (operacao === OperacaoVigencia.SuspenderIndeterminado) {
              // Para suspensão indeterminada, não precisa validar tempo
            }
          }
        }
      }

      // Validar bloco valor
      if (blocosObrigatoriosValidacao.has('valor')) {
        if (!dados.blocos?.valor) {
          novosErrors['blocos.valor.operacao'] =
            'Bloco Valor é obrigatório para os tipos selecionados'
        } else {
          const {valor} = dados.blocos

          if (valor.operacao === undefined) {
            novosErrors['blocos.valor.operacao'] =
              'Operação de valor é obrigatória'
          }

          // Validações específicas por operação
          if (valor.operacao !== undefined) {
            const {operacao} = valor

            if (operacao === OperacaoValor.Substituir) {
              // Para substituir, precisa do novo valor global
              if (!valor.novoValorGlobal || valor.novoValorGlobal <= 0) {
                novosErrors['blocos.valor.novoValorGlobal'] =
                  'Novo valor global é obrigatório e deve ser maior que zero'
              }
            } else {
              // Para acrescentar/diminuir, precisa de valor de ajuste OU percentual
              const temValorAjuste = valor.valorAjuste && valor.valorAjuste > 0
              const temPercentual =
                valor.percentualAjuste && valor.percentualAjuste > 0

              if (!temValorAjuste && !temPercentual) {
                novosErrors['blocos.valor.valorAjuste'] =
                  'Informe o valor de ajuste ou percentual'
              }
            }
          }
        }
      }

      // Validar bloco fornecedores
      if (blocosObrigatoriosValidacao.has('fornecedores')) {
        if (!dados.blocos?.fornecedores) {
          novosErrors['blocos.fornecedores'] =
            'Bloco Fornecedores é obrigatório para os tipos selecionados'
        } else {
          const {fornecedores} = dados.blocos
          // Check if we have any fornecedor operations
          const hasVinculados =
            fornecedores.fornecedoresVinculados &&
            fornecedores.fornecedoresVinculados.length > 0
          const hasDesvinculados =
            fornecedores.fornecedoresDesvinculados &&
            fornecedores.fornecedoresDesvinculados.length > 0
          const hasNovoFornecedor =
            fornecedores.novoFornecedorPrincipal &&
            fornecedores.novoFornecedorPrincipal.trim() !== ''

          if (!hasVinculados && !hasDesvinculados && !hasNovoFornecedor) {
            novosErrors['blocos.fornecedores'] =
              'Deve especificar pelo menos uma alteração em fornecedores'
          }
        }
      }

      // Validar bloco unidades
      if (blocosObrigatoriosValidacao.has('unidades')) {
        if (!dados.blocos?.unidades) {
          novosErrors['blocos.unidades'] =
            'Bloco Unidades é obrigatório para os tipos selecionados'
        } else {
          const {unidades} = dados.blocos

          // Check if we have any unidades operations
          const hasVinculadas =
            unidades.unidadesVinculadas &&
            unidades.unidadesVinculadas.length > 0
          const hasDesvinculadas =
            unidades.unidadesDesvinculadas &&
            unidades.unidadesDesvinculadas.length > 0

          if (!hasVinculadas && !hasDesvinculadas) {
            novosErrors['blocos.unidades'] =
              'Deve especificar pelo menos uma alteração em unidades'
          }
        }
      }

      // Validar bloco cláusulas
      if (blocosObrigatoriosValidacao.has('clausulas')) {
        if (!dados.blocos?.clausulas) {
          novosErrors['blocos.clausulas.clausulasAlteradas'] =
            'Bloco Cláusulas é obrigatório para os tipos selecionados'
        } else {
          const {clausulas} = dados.blocos
          if (
            !clausulas.clausulasAlteradas ||
            clausulas.clausulasAlteradas.length === 0
          ) {
            novosErrors['blocos.clausulas.clausulasAlteradas'] =
              'Deve haver pelo menos uma cláusula alterada'
          }
        }
      }
    }

    setErrors(novosErrors)
    const isValid = Object.keys(novosErrors).length === 0

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

    if (
      !dados.dadosBasicos?.justificativa ||
      dados.dadosBasicos.justificativa.trim().length < 10
    ) {
      novosErrors['dadosBasicos.justificativa'] =
        'Justificativa deve ter pelo menos 10 caracteres'
    }

    if (!dados.dataEfeito || dados.dataEfeito === '') {
      novosErrors.dataEfeito = 'Data de efeito é obrigatória'
    }

    // Validar blocos obrigatórios
    if (dados.tiposAlteracao && dados.tiposAlteracao.length > 0) {
      const blocosObrigatoriosValidacao = getBlocosObrigatorios(dados.tiposAlteracao)

      // Validar bloco vigência
      if (blocosObrigatoriosValidacao.has('vigencia')) {
        if (!dados.blocos?.vigencia) {
          novosErrors['blocos.vigencia.operacao'] =
            'Bloco Vigência é obrigatório para os tipos selecionados'
        } else {
          const {vigencia} = dados.blocos
          if (vigencia.operacao === undefined) {
            novosErrors['blocos.vigencia.operacao'] =
              'Operação de vigência é obrigatória'
          }

          // Validações específicas por operação
          if (vigencia.operacao !== undefined) {
            const {operacao} = vigencia

            if (operacao === OperacaoVigencia.Substituir) {
              if (!vigencia.novaDataFinal) {
                novosErrors['blocos.vigencia.novaDataFinal'] =
                  'Nova data final é obrigatória'
              }
            } else if (
              operacao === OperacaoVigencia.Acrescentar ||
              operacao === OperacaoVigencia.Diminuir ||
              operacao === OperacaoVigencia.SuspenderDeterminado
            ) {
              // Para operações com tempo, validar quantidade e unidade
              if (!vigencia.valorTempo || vigencia.valorTempo <= 0) {
                novosErrors['blocos.vigencia.valorTempo'] =
                  'Quantidade de tempo é obrigatória'
              }
              if (vigencia.tipoUnidade === undefined) {
                novosErrors['blocos.vigencia.tipoUnidade'] =
                  'Unidade de tempo deve ser selecionada'
              }
            } else if (operacao === OperacaoVigencia.SuspenderIndeterminado) {
              // Para suspensão indeterminada, não precisa validar tempo
            }
          }
        }
      }

      // Validar bloco valor
      if (blocosObrigatoriosValidacao.has('valor')) {
        if (!dados.blocos?.valor) {
          novosErrors['blocos.valor.operacao'] =
            'Bloco Valor é obrigatório para os tipos selecionados'
        } else {
          const {valor} = dados.blocos

          if (valor.operacao === undefined) {
            novosErrors['blocos.valor.operacao'] =
              'Operação de valor é obrigatória'
          } else {
            const {operacao} = valor

            if (operacao === OperacaoValor.Substituir) {
              if (!valor.novoValorGlobal || valor.novoValorGlobal <= 0) {
                novosErrors['blocos.valor.novoValorGlobal'] =
                  'Novo valor global é obrigatório e deve ser maior que zero'
              }
            } else {
              const temValorAjuste = valor.valorAjuste && valor.valorAjuste > 0
              const temPercentual =
                valor.percentualAjuste && valor.percentualAjuste > 0

              if (!temValorAjuste && !temPercentual) {
                novosErrors['blocos.valor.valorAjuste'] =
                  'Informe o valor de ajuste ou percentual'
              }
            }
          }
        }
      }

      // Validar bloco fornecedores
      if (blocosObrigatoriosValidacao.has('fornecedores')) {
        if (!dados.blocos?.fornecedores) {
          novosErrors['blocos.fornecedores'] =
            'Bloco Fornecedores é obrigatório para os tipos selecionados'
        } else {
          const {fornecedores} = dados.blocos
          // Check if we have any fornecedor operations
          const hasVinculados =
            fornecedores.fornecedoresVinculados &&
            fornecedores.fornecedoresVinculados.length > 0
          const hasDesvinculados =
            fornecedores.fornecedoresDesvinculados &&
            fornecedores.fornecedoresDesvinculados.length > 0
          const hasNovoFornecedor =
            fornecedores.novoFornecedorPrincipal &&
            fornecedores.novoFornecedorPrincipal.trim() !== ''

          if (!hasVinculados && !hasDesvinculados && !hasNovoFornecedor) {
            novosErrors['blocos.fornecedores'] =
              'Deve especificar pelo menos uma alteração em fornecedores'
          }
        }
      }

      // Validar bloco unidades
      if (blocosObrigatoriosValidacao.has('unidades')) {
        if (!dados.blocos?.unidades) {
          novosErrors['blocos.unidades'] =
            'Bloco Unidades é obrigatório para os tipos selecionados'
        } else {
          const {unidades} = dados.blocos

          // Check if we have any unidades operations
          const hasVinculadas =
            unidades.unidadesVinculadas &&
            unidades.unidadesVinculadas.length > 0
          const hasDesvinculadas =
            unidades.unidadesDesvinculadas &&
            unidades.unidadesDesvinculadas.length > 0

          if (!hasVinculadas && !hasDesvinculadas) {
            novosErrors['blocos.unidades'] =
              'Deve especificar pelo menos uma alteração em unidades'
          }
        }
      }

      // Validar bloco cláusulas
      if (blocosObrigatoriosValidacao.has('clausulas')) {
        if (!dados.blocos?.clausulas) {
          novosErrors['blocos.clausulas.clausulasAlteradas'] =
            'Bloco Cláusulas é obrigatório para os tipos selecionados'
        } else {
          const {clausulas} = dados.blocos
          if (
            !clausulas.clausulasAlteradas ||
            clausulas.clausulasAlteradas.length === 0
          ) {
            novosErrors['blocos.clausulas.clausulasAlteradas'] =
              'Deve haver pelo menos uma cláusula alterada'
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
  }, [
    validarCamposSemEstado,
    alertaLimiteLegal,
    confirmacaoLimiteLegal,
    isLoading,
  ])

  // Salvar como rascunho ou atualizar
  const salvarRascunho = useCallback(async () => {
    const dadosCompletos = {
      ...dados,
      status: StatusAlteracao.Rascunho,
    } as AlteracaoContratualForm

    if (alteracaoId) {
      // Atualizar existente
      await atualizarMutation.mutateAsync({
        id: alteracaoId,
        dados: dadosCompletos,
      })
    } else {
      // Criar novo
      await criarMutation.mutateAsync({
        contratoId,
        dados: dadosCompletos,
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
      status: StatusAlteracao.AguardandoAprovacao,
    } as AlteracaoContratualForm

    if (alteracaoId) {
      // Atualizar e submeter existente
      const alteracaoAtualizada = await atualizarMutation.mutateAsync({
        id: alteracaoId,
        dados: dadosCompletos,
      })
      onSubmitted?.(alteracaoAtualizada)
    } else {
      // Criar e submeter novo
      const result = await criarMutation.mutateAsync({
        contratoId,
        dados: dadosCompletos,
      })

      if (result.status === 201) {
        onSubmitted?.(result.alteracao)
      }
      // Se for 202, o alerta será tratado pelo callback onLimiteLegalAlert
    }
  }, [
    dados,
    podeSubmeter,
    alteracaoId,
    contratoId,
    criarMutation,
    atualizarMutation,
    onSubmitted,
    validarCamposObrigatorios,
  ])

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
        observacoes: '',
      },
      dataEfeito: '',
      blocos: {},
      status: StatusAlteracao.Rascunho,
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
    resetarFormulario,
  }
}
