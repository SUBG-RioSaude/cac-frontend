import { useParams } from 'react-router-dom';
import LayoutPagina from '@/components/layout-pagina';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Imports comentados - para implementação futura com React Query
// import { useContratoDetalhado } from '@/modules/Contratos/store/contratos-store';
// import { DetalhesContrato } from '@/modules/Contratos/components/VisualizacaoContratos/detalhes-contrato';
// import { RegistroAlteracoes } from '@/modules/Contratos/components/VisualizacaoContratos/registro-alteracoes';
import { TabDocumentos } from '@/modules/Contratos/components/Documentos/tab-documentos';
import { Loading } from '@/components/ui/loading';

function ContratoDetailPage() {
  const { contratoId } = useParams<{ contratoId: string }>();

  const { data: contrato, isLoading, error } = useMemo(() => {
    // O uso de useMemo garante que os dados mocados não sejam recriados a cada renderização,
    // evitando que o estado da checklist seja resetado inesperadamente.
    const mockContrato = {
      id: contratoId!,
      numeroContrato: '123/2024',
      objeto: 'Desenvolvimento de um novo sistema de gestão',
      status: 'ativo' as const,
      documentos: [],
      alteracoes: [],
      documentosChecklist: {
        termoReferencia: { status: 'entregue' as const, dataEntrega: '2024-01-15' },
        homologacao: { status: 'entregue' as const, dataEntrega: '2024-01-20' },
        ataRegistroPrecos: { status: 'pendente' as const },
        garantiaContratual: { status: 'nao_aplicavel' as const },
        contrato: { status: 'pendente' as const },
        publicacaoPncp: { status: 'pendente' as const },
        publicacaoExtrato: { status: 'pendente' as const },
      }
    };
    return { data: mockContrato, isLoading: false, error: null };
  }, [contratoId]);

  if (isLoading) {
    return <Loading className="h-screen" />;
  }

  if (error || !contrato) {
    return <div>Erro ao carregar o contrato.</div>;
  }

  return (
    <LayoutPagina
      titulo={`Contrato ${contrato.numeroContrato}`}
      descricao={contrato.objeto}
    >
      <Tabs defaultValue="detalhes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="alteracoes">Registro de Alterações</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          {/* O componente DetalhesContrato receberia os dados necessários */}
          {/* <DetalhesContrato contrato={contrato} /> */}
          <p>Área para os detalhes do contrato.</p>
        </TabsContent>

        <TabsContent value="documentos">
          <TabDocumentos 
            contratoId={contrato.id} 
            checklistData={contrato.documentosChecklist} 
          />
        </TabsContent>

        <TabsContent value="alteracoes">
          {/* O componente RegistroAlteracoes receberia as alterações */}
          {/* <RegistroAlteracoes alteracoes={contrato.alteracoes} /> */}
          <p>Área para o registro de alterações.</p>
        </TabsContent>
      </Tabs>
    </LayoutPagina>
  );
}

export default ContratoDetailPage;