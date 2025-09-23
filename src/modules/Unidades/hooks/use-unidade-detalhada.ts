import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!enabled || !id) {
      console.log('[DEBUG] Hook desabilitado ou ID vazio:', { enabled, id })
      return
    }

    const carregarUnidade = async () => {
      console.log('[DEBUG] Iniciando carregamento da unidade:', id)
      setCarregando(true)
      setErro(null)

      try {
        console.log('[DEBUG] Chamando API para buscar unidade:', id)
        const dados = await buscarUnidadePorId(id)
        console.log('[DEBUG] Dados recebidos:', dados)
        setUnidade(dados)
      } catch (error) {
        console.error('Erro ao carregar unidade:', error)
        setErro('Erro ao carregar dados da unidade')
      } finally {
        setCarregando(false)
      }
    }

    carregarUnidade()
  }, [id, enabled])

  const recarregar = () => {
    if (enabled && id) {
      setCarregando(true)
      setErro(null)
      buscarUnidadePorId(id)
        .then(setUnidade)
        .catch((error) => {
          console.error('Erro ao recarregar unidade:', error)
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
