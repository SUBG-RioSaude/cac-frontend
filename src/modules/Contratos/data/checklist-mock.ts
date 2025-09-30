import type { ChecklistData, DocumentoChecklist } from '@/modules/Contratos/types/contrato'

export const CHECKLIST_MOCK: ChecklistData = {
  termoReferencia: {
    entregue: true,
    link: 'https://sistema-licitacao.gov.br/termo-referencia-001-2024.pdf',
    dataEntrega: '2024-01-10T09:00:00Z',
  },
  homologacao: {
    entregue: true,
    dataEntrega: '2024-01-15T14:30:00Z',
  },
  ataRegistroPrecos: {
    entregue: false,
  },
  garantiaContratual: {
    entregue: true,
    link: 'https://seguradora.com.br/garantia-contrato-001.pdf',
    dataEntrega: '2024-01-20T10:15:00Z',
  },
  contrato: {
    entregue: true,
    link: 'https://contratos.prefeitura.gov.br/contrato-001-2024-assinado.pdf',
    dataEntrega: '2024-02-01T08:30:00Z',
  },
  publicacaoPncp: {
    entregue: true,
    link: 'https://pncp.gov.br/contratos/publicacao-001-2024',
    dataEntrega: '2024-01-22T16:45:00Z',
  },
  publicacaoExtrato: {
    entregue: false,
  },
}

export const calcularProgressoChecklist = (checklist: ChecklistData) => {
  const documentos = Object.values(checklist) as DocumentoChecklist[]
  const total = documentos.length
  const entregues = documentos.filter((doc) => doc.entregue).length
  const pendentes = documentos.filter((doc) => !doc.entregue).length

  const percentual = total > 0 ? Math.round((entregues / total) * 100) : 0

  return {
    total,
    entregues,
    pendentes,
    percentual,
  }
}
