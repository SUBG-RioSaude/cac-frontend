import { motion } from 'framer-motion'
import { ExternalLink, FileText, Calendar, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateDisplay } from '@/components/ui/formatters'
import { ContratoStatusBadge } from '@/components/ui/status-badge'
import { currencyUtils } from '@/lib/utils'
import type { ContratoVinculado } from '@/modules/Unidades/ListaUnidades/types/unidade'
import { parseStatusContrato } from '@/types/status'

interface ListaContratosProps {
  contratos: ContratoVinculado[]
  unidadeNome: string
}

export const ListaContratos = ({ contratos }: ListaContratosProps) => {
  const navigate = useNavigate()

  const handleVisualizarContrato = (contratoId: number) => {
    navigate(`/contratos/${contratoId}`)
  }

  if (contratos.length === 0) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              Nenhum contrato vinculado
            </h3>
            <p className="text-muted-foreground text-sm">
              Esta unidade não possui contratos ativos no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contratos Vinculados ({contratos.length})
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Lista de contratos ativos nesta unidade
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {contratos.map((contrato, index) => (
            <motion.div
              key={contrato.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border-border hover:bg-muted/30 border-b p-4 transition-colors last:border-0"
            >
              {/* Header do contrato */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{contrato.numero}</h4>
                    <ContratoStatusBadge
                      status={parseStatusContrato(contrato.status)}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Valor: {currencyUtils.formatar(contrato.valor)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVisualizarContrato(Number(contrato.id))}
                  className="h-8 px-3 text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Abrir
                </Button>
              </div>

              {/* Objeto do contrato */}
              <div className="mb-3">
                <p className="text-foreground line-clamp-2 text-sm">
                  {contrato.objeto}
                </p>
              </div>

              {/* Informações do fornecedor e vigência */}
              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Fornecedor</p>
                    <p className="text-foreground line-clamp-1 font-medium">
                      {contrato.fornecedor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Vigência</p>
                    <p className="text-foreground font-medium">
                      <DateDisplay
                        value={contrato.vigenciaInicio}
                        format="custom"
                        options={{
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }}
                      />{' '}
                      -{' '}
                      <DateDisplay
                        value={contrato.vigenciaFim}
                        format="custom"
                        options={{
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
