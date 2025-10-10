import type { DocumentoContrato } from '@/modules/Contratos/types/contrato'

export const DOCUMENTOS_MOCK: DocumentoContrato[] = [
  // Documento obrigatório - Edital (conferido)
  {
    id: 'doc-1',
    nome: 'Edital Pregão Eletrônico nº 001/2024',
    descricao:
      'Edital completo da licitação com todas as especificações técnicas',
    tipo: {
      id: 'edital',
      nome: 'Edital',
      icone: 'FileText',
      cor: 'blue',
      descricaoDetalhada:
        'Documento de licitação que estabelece as regras do processo',
    },
    categoria: 'obrigatorio',
    status: 'conferido',
    linkExterno: 'https://sistema-licitacao.gov.br/edital-001-2024.pdf',
    dataUpload: '2024-01-10T09:00:00Z',
    dataUltimaVerificacao: '2024-01-15T14:30:00Z',
    responsavel: 'Maria Santos',
    prioridade: 1,
  },

  // Documento obrigatório - Contrato (com pendência)
  {
    id: 'doc-2',
    nome: 'Contrato 001/2024 - Assinado',
    descricao: 'Contrato principal assinado pelas partes',
    tipo: {
      id: 'contrato',
      nome: 'Contrato Assinado',
      icone: 'FileCheck',
      cor: 'purple',
      descricaoDetalhada: 'Documento contratual assinado pelas partes',
    },
    categoria: 'obrigatorio',
    status: 'com_pendencia',
    linkExterno: 'https://contratos.prefeitura.gov.br/contrato-001-2024.pdf',
    dataUpload: '2024-02-01T08:00:00Z',
    dataUltimaVerificacao: '2024-02-10T09:15:00Z',
    responsavel: 'Ana Costa',
    observacoes: 'Necessário revisar cláusula 5.2 sobre prazo de entrega.',
    prioridade: 2,
  },

  // Documento obrigatório - Garantia (pendente)
  {
    id: 'doc-3',
    nome: 'Seguro Garantia 20% do Valor',
    descricao: 'Apólice de seguro garantia para execução do contrato',
    tipo: {
      id: 'garantia',
      nome: 'Garantia Contratual',
      icone: 'Shield',
      cor: 'orange',
      descricaoDetalhada: 'Garantia apresentada para execução do contrato',
    },
    categoria: 'obrigatorio',
    status: 'pendente',
    dataUpload: '2024-02-05T11:20:00Z',
    responsavel: 'Carlos Oliveira',
    observacoes: 'Aguardando envio da apólice pela fornecedora.',
    prioridade: 3,
  },

  // Documento opcional - Manual (conferido)
  {
    id: 'doc-4',
    nome: 'Manual Técnico dos Serviços',
    descricao: 'Documentação técnica detalhada dos serviços contratuais',
    tipo: {
      id: 'outros',
      nome: 'Outros Documentos',
      icone: 'File',
      cor: 'gray',
      descricaoDetalhada: 'Documentos diversos relacionados ao contrato',
    },
    categoria: 'opcional',
    status: 'conferido',
    linkExterno: 'https://fornecedor.com.br/manual-tecnico.pdf',
    dataUpload: '2024-02-12T16:20:00Z',
    dataUltimaVerificacao: '2024-02-15T10:00:00Z',
    responsavel: 'Pedro Alves',
    prioridade: 4,
  },
]

export const calcularEstatisticasDocumentos = (
  documentos: DocumentoContrato[],
) => {
  const total = documentos.length
  const conferidos = documentos.filter((d) => d.status === 'conferido').length
  const pendentes = documentos.filter((d) => d.status === 'pendente').length
  const comPendencia = documentos.filter(
    (d) => d.status === 'com_pendencia',
  ).length
  const obrigatorios = documentos.filter((d) => d.categoria === 'obrigatorio')
  const obrigatoriosPendentes = obrigatorios.filter(
    (d) => d.status !== 'conferido',
  ).length

  const percentualCompleto =
    total > 0 ? Math.round((conferidos / total) * 100) : 0

  return {
    total,
    conferidos,
    pendentes,
    comPendencia,
    percentualCompleto,
    obrigatoriosPendentes,
  }
}
