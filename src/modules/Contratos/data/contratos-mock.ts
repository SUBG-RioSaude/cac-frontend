import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato'

// Importando dados do arquivo JSON consolidado
import contratosData from './contratos-data.json'

// Exportando dados tipados
export const contratosMock: Contrato[] = contratosData.contratos as Contrato[]
export const contratoDetalhadoMock: ContratoDetalhado =
  contratosData.contratoDetalhado as unknown as ContratoDetalhado

// Garantindo que unidadesMock tenha a estrutura correta
export const unidadesMock = {
  demandantes: [
    "Secretaria de Obras",
    "Secretaria de TI",
    "Secretaria de Saúde",
    "Procuradoria Geral",
    "Secretaria de Administração",
    "Secretaria de Segurança",
    "Secretaria de Transporte",
    "Secretaria de Educação",
    "Secretaria de Cultura",
    "Secretaria de Esporte",
    "Secretaria de Meio Ambiente",
    "Secretaria de Desenvolvimento Social"
  ],
  gestoras: [
    "Departamento de Compras",
    "Departamento de Contratos",
    "Departamento de Administração"
  ]
}

export const empresasMock = contratosData.empresas

// Função helper para obter dados atualizados
export const getContratosData = () => contratosData
