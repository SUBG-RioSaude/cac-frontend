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
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !fornecedor) {
    return <div>Erro ao carregar os dados do fornecedor.</div>
  }

  const contratos = contratosData?.dados ?? []

  return (
    <div className="space-y-6">
      <FornecedorHeader
        razaoSocial={fornecedor.razaoSocial}
        cnpj={fornecedor.cnpj}
        status={fornecedor.ativo ? 'Ativo' : 'Inativo'}
      />

      <FornecedorTabs
        fornecedor={fornecedor}
        contratos={contratos}
        isLoadingContratos={isLoadingContratos}
      />
    </div>
  )
}

export default VisualizacaoFornecedorPage
