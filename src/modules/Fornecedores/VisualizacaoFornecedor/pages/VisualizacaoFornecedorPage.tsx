import { useParams } from 'react-router-dom';
import { useConsultarEmpresaPorCNPJ } from '@/modules/Empresas/hooks/use-empresas';
import { FornecedorHeader } from '../components/fornecedor-header';
import { InformacoesFornecedor } from '../components/informacoes-fornecedor';
import { EnderecoFornecedor } from '../components/endereco-fornecedor';
import { ContatosFornecedor } from '../components/contatos-fornecedor';
import { Skeleton } from '@/components/ui/skeleton';

export default function VisualizacaoFornecedorPage() {
  const { fornecedorId } = useParams<{ fornecedorId: string }>();
  const { data: fornecedor, isLoading, isError } = useConsultarEmpresaPorCNPJ(fornecedorId!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !fornecedor) {
    return <div>Erro ao carregar os dados do fornecedor.</div>;
  }

  return (
    <div className="space-y-6">
      <FornecedorHeader
        razaoSocial={fornecedor.razaoSocial}
        cnpj={fornecedor.cnpj}
        status={fornecedor.ativo ? 'Ativo' : 'Inativo'}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <InformacoesFornecedor
            razaoSocial={fornecedor.razaoSocial}
            nomeFantasia={fornecedor.nomeFantasia}
            cnpj={fornecedor.cnpj}
            inscricaoEstadual={fornecedor.inscricaoEstadual}
            inscricaoMunicipal={fornecedor.inscricaoMunicipal}
            dataCadastro={new Date(fornecedor.dataCadastro).toLocaleDateString('pt-BR')}
            dataAtualizacao={new Date(fornecedor.dataAtualizacao).toLocaleDateString('pt-BR')}
          />
        </div>
        <div className="space-y-6">
          <EnderecoFornecedor
              logradouro={fornecedor.endereco}
              bairro={fornecedor.bairro}
              cidade={fornecedor.cidade}
              estado={fornecedor.estado}
              cep={fornecedor.cep}
            />
          {fornecedor.contatos && <ContatosFornecedor contatos={fornecedor.contatos} />}
        </div>
      </div>
    </div>
  );
}