import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato-detalhado'

// Importando dados do arquivo JSON consolidado
import contratosData from './contratos-data.json'

// Exportando dados tipados
export const contratosMock: Contrato[] = contratosData.contratos as Contrato[]
export const contratoDetalhadoMock: ContratoDetalhado =
  contratosData.contratoDetalhado as ContratoDetalhado
export const unidadesMock: string[] = contratosData.unidades as unknown as string[]
export const empresasMock = contratosData.empresas

// Função helper para obter dados atualizados
export const getContratosData = () => contratosData
