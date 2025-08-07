import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContratosStore } from '@/modules/Contratos/store/contratos-store'
import type { Contrato } from '@/modules/types/contrato'

export function TabelaContratos() {
  const { 
    contratosFiltrados,
    paginacao,
    contratosSelecionados,
    setPaginacao,
    selecionarContrato,
    selecionarTodosContratos
  } = useContratosStore()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { 
        variant: 'default' as const, 
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 hover:bg-green-200'
      },
      vencendo: { 
        variant: 'secondary' as const, 
        label: 'Vencendo em Breve',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      },
      vencido: { 
        variant: 'destructive' as const, 
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 hover:bg-red-200'
      },
      suspenso: { 
        variant: 'outline' as const, 
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      },
      encerrado: { 
        variant: 'outline' as const, 
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleVisualizarContrato = (contrato: Contrato) => {
    console.log('Visualizar contrato:', contrato)
  }

  const handleEditarContrato = (contrato: Contrato) => {
    console.log('Editar contrato:', contrato)
  }

  // Paginação
  const inicio = (paginacao.pagina - 1) * paginacao.itensPorPagina
  const fim = inicio + paginacao.itensPorPagina
  const contratosPaginados = contratosFiltrados.slice(inicio, fim)

  const totalPaginas = Math.ceil(paginacao.total / paginacao.itensPorPagina)
  
  const paginaAnterior = () => {
    if (paginacao.pagina > 1) {
      setPaginacao({ ...paginacao, pagina: paginacao.pagina - 1 })
    }
  }

  const proximaPagina = () => {
    if (paginacao.pagina < totalPaginas) {
      setPaginacao({ ...paginacao, pagina: paginacao.pagina + 1 })
    }
  }

  const todosContratosSelecionados = contratosPaginados.length > 0 && 
    contratosPaginados.every(c => contratosSelecionados.includes(c.id))
  const algunsContratosSelecionados = contratosSelecionados.length > 0 && 
    !todosContratosSelecionados

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">
                Lista de Contratos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {paginacao.total} contratos encontrados
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-lg border bg-background/50 mx-6 mb-6 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={todosContratosSelecionados}
                      onCheckedChange={(checked) => selecionarTodosContratos(checked as boolean)}
                      ref={(el) => {
                        if (el) el.indeterminate = algunsContratosSelecionados
                      }}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Contrato</TableHead>
                  <TableHead className="font-semibold">Contratada</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Data Inicial</TableHead>
                  <TableHead className="font-semibold">Data Final</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {contratosPaginados.map((contrato, index) => (
                    <motion.tr
                      key={contrato.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={contratosSelecionados.includes(contrato.id)}
                          onCheckedChange={(checked) => 
                            selecionarContrato(contrato.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{contrato.numeroContrato}</div>
                          {contrato.numeroCCon && (
                            <div className="text-xs text-muted-foreground">
                              CCon: {contrato.numeroCCon}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {contrato.objeto}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm line-clamp-1">
                            {contrato.contratada.razaoSocial}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatarCNPJ(contrato.contratada.cnpj)}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {contrato.unidade}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">
                          {formatarMoeda(contrato.valor)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatarData(contrato.dataInicial)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatarData(contrato.dataFinal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contrato.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisualizarContrato(contrato)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title="Visualizar contrato"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarContrato(contrato)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title="Editar contrato"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                                title="Mais opções"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleVisualizarContrato(contrato)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditarContrato(contrato)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Paginação Moderna */}
          <div className="flex items-center justify-between px-6 pb-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {inicio + 1} a{' '}
              {Math.min(fim, paginacao.total)} de{' '}
              {paginacao.total} contratos
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={paginaAnterior}
                disabled={paginacao.pagina === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={paginacao.pagina === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaginacao({ ...paginacao, pagina: pageNum })}
                      className="w-9 h-9 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={proximaPagina}
                disabled={paginacao.pagina === totalPaginas}
                className="flex items-center gap-2"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
