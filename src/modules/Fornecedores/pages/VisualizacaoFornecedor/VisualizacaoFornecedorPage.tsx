import { useParams } from 'react-router-dom';
import { useEmpresa } from '@/modules/Fornecedores/hooks/use-empresas';
import { useContratosPorEmpresa } from '@/modules/Contratos/hooks/use-contratos-empresa';
import { FornecedorHeader } from '@/modules/Fornecedores/components/VisualizacaoFornecedor/fornecedor-header'
import { FornecedorTabs } from '@/modules/Fornecedores/components/VisualizacaoFornecedor/FornecedorTabs'
import { Skeleton } from '@/components/ui/skeleton';

export default function VisualizacaoFornecedorPage() {
  const { fornecedorId } = useParams<{ fornecedorId: string }>();
  const { data: fornecedor, isLoading, isError } = useEmpresa(fornecedorId!);
  
  // Buscar contratos do fornecedor
  const { 
    data: contratosData, 
    isLoading: isLoadingContratos 
  } = useContratosPorEmpresa(
    fornecedor?.id || '',
    {},
    { enabled: !!fornecedor?.id }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !fornecedor) {
    return <div>Erro ao carregar os dados do fornecedor.</div>;
  }

  const contratos = contratosData?.dados || []

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
  );
}