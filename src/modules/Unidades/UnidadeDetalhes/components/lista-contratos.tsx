import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContratoStatusBadge } from "@/components/ui/status-badge"
import { parseStatusContrato } from "@/types/status"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Calendar, Building } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { currencyUtils } from "@/lib/utils"
import type { ContratoVinculado } from "@/modules/Unidades/ListaUnidades/types/unidade"
import { DateDisplay } from "@/components/ui/formatters"

interface ListaContratosProps {
  contratos: ContratoVinculado[]
  unidadeNome: string
}

export function ListaContratos({ contratos }: ListaContratosProps) {
  const navigate = useNavigate()



  const handleVisualizarContrato = (contratoId: number) => {
    navigate(`/contratos/${contratoId}`)
  }

  if (!contratos || contratos.length === 0) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum contrato vinculado</h3>
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
        <p className="text-sm text-muted-foreground">
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
              className="border-b border-border last:border-0 p-4 hover:bg-muted/30 transition-colors"
            >
              {/* Header do contrato */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{contrato.numero}</h4>
                    <ContratoStatusBadge status={parseStatusContrato(contrato.status)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor: {currencyUtils.formatar(contrato.valor)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVisualizarContrato(Number(contrato.id))}
                  className="h-8 px-3 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir
                </Button>
              </div>

              {/* Objeto do contrato */}
              <div className="mb-3">
                <p className="text-sm text-foreground line-clamp-2">
                  {contrato.objeto}
                </p>
              </div>

              {/* Informações do fornecedor e vigência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Fornecedor</p>
                    <p className="font-medium text-foreground line-clamp-1">
                      {contrato.fornecedor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Vigência</p>
                    <p className="font-medium text-foreground">
                      <DateDisplay value={contrato.vigenciaInicio} format="custom" options={{day: "2-digit", month: "2-digit", year: "numeric"}} /> - <DateDisplay value={contrato.vigenciaFim} format="custom" options={{day: "2-digit", month: "2-digit", year: "numeric"}} />
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