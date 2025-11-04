/**
 * ==========================================
 * COMPONENTE DE VISÃO GERAL DO FORNECEDOR
 * ==========================================
 * Dashboard resumo com métricas e informações do fornecedor
 */

import { TrendingUp, Building, Phone } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { EmpresaResponse } from '@/modules/Empresas/types/empresa'

import { ContatosFornecedor } from './contatos-fornecedor'
import { EnderecoFornecedor } from './endereco-fornecedor'
import { FornecedorMetricas } from './fornecedor-metricas'
import { InformacoesFornecedor } from './informacoes-fornecedor'

interface FornecedorVisaoGeralProps {
  fornecedor: EmpresaResponse
  contratos: Contrato[]
  isLoading?: boolean
}

export const FornecedorVisaoGeral = ({
  fornecedor,
  contratos,
  isLoading,
}: FornecedorVisaoGeralProps) => {

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-5 w-5" />
          Métricas Principais
        </h3>
        <FornecedorMetricas contratos={contratos} isLoading={isLoading} />
      </div>

      {/* Informações da Empresa */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Building className="h-5 w-5" />
          Informações da Empresa
        </h3>
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-md mb-3 font-medium">Dados Principais</h4>
            <InformacoesFornecedor
              razaoSocial={fornecedor.razaoSocial}
              cnpj={fornecedor.cnpj}
              inscricaoEstadual={fornecedor.inscricaoEstadual}
              inscricaoMunicipal={fornecedor.inscricaoMunicipal}
            />
          </div>

          <div className="flex flex-1 flex-col">
            <h4 className="text-md mb-3 font-medium">Endereço</h4>
            <EnderecoFornecedor
              logradouro={fornecedor.endereco}
              numero={fornecedor.numero}
              complemento={fornecedor.complemento}
              bairro={fornecedor.bairro}
              cidade={fornecedor.cidade}
              estado={fornecedor.estado}
              cep={fornecedor.cep}
            />
          </div>
        </div>
      </div>

      {/* Contatos */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Phone className="h-5 w-5" />
          Informações de Contato
        </h3>
        {fornecedor.contatos.length > 0 ? (
          <ContatosFornecedor contatos={fornecedor.contatos} />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h4 className="mb-2 text-lg font-semibold">
                Nenhum contato cadastrado
              </h4>
              <p className="text-muted-foreground">
                Este fornecedor ainda não possui informações de contato no
                sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
