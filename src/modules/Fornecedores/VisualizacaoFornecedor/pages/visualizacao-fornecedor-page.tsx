import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { useContratosPorEmpresa } from '@/modules/Contratos/hooks/use-contratos-empresa'
import { useConsultarEmpresaPorCNPJ } from '@/modules/Empresas/hooks/use-empresas'

import { FornecedorHeader } from '../components/fornecedor-header'
import { FornecedorTabs } from '../components/fornecedor-tabs'

const VisualizacaoFornecedorPage = () => {
  const { fornecedorId } = useParams<{ fornecedorId: string }>()
  const {
    data: fornecedor,
    isLoading,
    isError,
  } = useConsultarEmpresaPorCNPJ(fornecedorId!)

  // Buscar contratos do fornecedor
  const { data: contratosData, isLoading: isLoadingContratos } =
    useContratosPorEmpresa(
      fornecedor?.id ?? '',
      {},
      { enabled: !!fornecedor?.id },
    )

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (isError || !fornecedor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Erro ao carregar dados
          </h2>
          <p className="text-muted-foreground mt-2">
            Não foi possível carregar os dados do fornecedor.
          </p>
        </div>
      </div>
    )
  }

  const contratos = contratosData?.dados ?? []

  return (
    <motion.div
      className="space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FornecedorHeader
        razaoSocial={fornecedor.razaoSocial}
        cnpj={fornecedor.cnpj}
        status={fornecedor.ativo ? 'Ativo' : 'Inativo'}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <FornecedorTabs
          fornecedor={fornecedor}
          contratos={contratos}
          isLoadingContratos={isLoadingContratos}
        />
      </motion.div>
    </motion.div>
  )
}

export default VisualizacaoFornecedorPage
