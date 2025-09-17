/**
 * ==========================================
 * COMPONENTE DE VISÃO GERAL DO FORNECEDOR
 * ==========================================
 * Dashboard resumo com métricas e contratos mais relevantes
 */

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContratoStatusBadge, useContratoStatus } from '@/components/ui/status-badge'
import { CurrencyDisplay } from '@/components/ui/formatters'
import { 
  TrendingUp, 
  Eye, 
  Calendar,
  DollarSign,
  Building,
  Phone
} from 'lucide-react'
import { FornecedorMetricas } from './FornecedorMetricas'
import { InformacoesFornecedor } from './informacoes-fornecedor'
import { EnderecoFornecedor } from './endereco-fornecedor'
import { ContatosFornecedor } from './contatos-fornecedor'
import { VigenciaDisplay } from '@/modules/Contratos/components/ListaContratos/VigenciaDisplay'
import type { Contrato } from '@/modules/Contratos/types/contrato'
import type { EmpresaResponse } from '@/modules/Empresas/types/empresa'
import { useNavigate } from 'react-router-dom'

interface FornecedorVisaoGeralProps {
  fornecedor: EmpresaResponse
  contratos: Contrato[]
  isLoading?: boolean
}

export function FornecedorVisaoGeral({ fornecedor, contratos, isLoading }: FornecedorVisaoGeralProps) {
  const navigate = useNavigate()

  const contratosRelevantes = useMemo(() => {
    if (!contratos || contratos.length === 0) return []

    // Ordenar contratos por relevância: vencendo primeiro, depois por valor
    const contratosOrdenados = [...contratos].sort((a, b) => {
      const agora = new Date()
      const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      
      const aVencendo = a.vigenciaFinal && new Date(a.vigenciaFinal) <= em30Dias && new Date(a.vigenciaFinal) > agora
      const bVencendo = b.vigenciaFinal && new Date(b.vigenciaFinal) <= em30Dias && new Date(b.vigenciaFinal) > agora
      
      if (aVencendo && !bVencendo) return -1
      if (!aVencendo && bVencendo) return 1
      
      // Se ambos estão vencendo ou ambos não estão, ordenar por valor
      return (b.valorGlobal || 0) - (a.valorGlobal || 0)
    })

    return contratosOrdenados.slice(0, 5) // Mostrar apenas os 5 mais relevantes
  }, [contratos])



  const handleVisualizarContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Informações da Empresa */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informações da Empresa
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
          <div>
            <h4 className="text-md font-medium mb-3">Dados Principais</h4>
            <InformacoesFornecedor
              razaoSocial={fornecedor.razaoSocial}
              cnpj={fornecedor.cnpj}
              inscricaoEstadual={fornecedor.inscricaoEstadual}
              inscricaoMunicipal={fornecedor.inscricaoMunicipal}
            />
          </div>
          
          <div className='flex-1 flex flex-col '>
            <h4 className="text-md font-medium mb-3">Endereço</h4>
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
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Informações de Contato
        </h3>
        {fornecedor.contatos && fornecedor.contatos.length > 0 ? (
          <ContatosFornecedor contatos={fornecedor.contatos} />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum contato cadastrado</h4>
              <p className="text-muted-foreground">
                Este fornecedor ainda não possui informações de contato no sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Métricas principais */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Métricas Principais
        </h3>
        <FornecedorMetricas contratos={contratos} isLoading={isLoading} />
      </div>

      {/* Contratos mais relevantes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contratos Mais Relevantes
          </h3>
          {contratos && contratos.length > 5 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/fornecedor/${fornecedor.id}?tab=contratos`)}
            >
              Ver todos ({contratos.length})
            </Button>
          )}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : contratosRelevantes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h4>
              <p className="text-muted-foreground">
                Este fornecedor ainda não possui contratos cadastrados no sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {contratosRelevantes.map((contrato) => (
                  <ContratoRelevantItem 
                    key={contrato.id} 
                    contrato={contrato}
                    onVisualizar={handleVisualizarContrato}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Componente para renderizar item de contrato relevante
interface ContratoRelevantItemProps {
  contrato: Contrato
  onVisualizar: (contrato: Contrato) => void
}

function ContratoRelevantItem({ contrato, onVisualizar }: ContratoRelevantItemProps) {
  const contratoStatus = useContratoStatus(
    contrato.vigenciaInicial,
    contrato.vigenciaFinal,
    contrato.status
  )
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">
            {contrato.numeroContrato || 'Sem número'}
          </h4>
          <ContratoStatusBadge 
            status={contratoStatus} 
            showIcon={true}
            size="sm"
          />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {contrato.descricaoObjeto || 'Descrição não disponível'}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <CurrencyDisplay value={contrato.valorGlobal || 0} />
          </div>
          
          <div className="flex-1">
            <VigenciaDisplay
              vigenciaInicio={contrato.vigenciaInicial}
              vigenciaFim={contrato.vigenciaFinal}
              compact
            />
          </div>
        </div>
      </div>
      
      <div className="ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onVisualizar(contrato)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}