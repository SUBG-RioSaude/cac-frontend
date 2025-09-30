import { useState, useEffect } from 'react'

import { createHookLogger } from '@/lib/logger'

import { buscarUnidadePorId } from '../services/unidades-service'
import type { UnidadeDetalhada } from '../types/unidade-api'

interface UseUnidadeDetalhadaProps {
  id: string
  enabled?: boolean
}

export const useUnidadeDetalhada = ({
  id,
  enabled = true,
}: UseUnidadeDetalhadaProps) => {
  const [unidade, setUnidade] = useState<UnidadeDetalhada | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const logger = createHookLogger('useUnidadeDetalhada', 'Unidades')

  useEffect(() => {
    if (!enabled || !id) {
      logger.debug({ enabled, id }, 'Hook desabilitado ou ID vazio')
      return
    }

    const carregarUnidade = async () => {
      logger.debug({ unidadeId: id }, 'Iniciando carregamento da unidade')
      setCarregando(true)
      setErro(null)

      try {
        logger.debug({ unidadeId: id }, 'Chamando API para buscar unidade')
        const dados = await buscarUnidadePorId(id)
        logger.debug({ unidadeId: id, dados }, 'Dados recebidos da API')
        setUnidade(dados)
      } catch (error) {
        logger.error({
          error: error instanceof Error ? error.message : String(error),
          unidadeId: id
        }, 'Erro ao carregar unidade')
        setErro('Erro ao carregar dados da unidade')
      } finally {
        setCarregando(false)
      }
    }

    void carregarUnidade()
  }, [id, enabled, logger])

  const recarregar = () => {
    if (enabled && id) {
      setCarregando(true)
      setErro(null)
      buscarUnidadePorId(id)
        .then(setUnidade)
        .catch((error) => {
          logger.error({
            error: error instanceof Error ? error.message : String(error),
            unidadeId: id
          }, 'Erro ao recarregar unidade')
          setErro('Erro ao recarregar dados da unidade')
        })
        .finally(() => setCarregando(false))
    }
  }

  return {
    unidade,
    carregando,
    erro,
    recarregar,
  }
}
