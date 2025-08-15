import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { useState } from "react"

interface SearchAndFiltersUnidadesProps {
  termoPesquisa: string
  onTermoPesquisaChange: (termo: string) => void
}

export function SearchAndFiltersUnidades({
  termoPesquisa,
  onTermoPesquisaChange,
}: SearchAndFiltersUnidadesProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroSigla, setFiltroSigla] = useState<string>("")

  const limparFiltros = () => {
    setFiltroStatus("todos")
    setFiltroSigla("")
    onTermoPesquisaChange("")
  }

  const temFiltrosAtivos = (filtroStatus && filtroStatus !== "todos") || filtroSigla || termoPesquisa

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa principal */}
      <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={termoPesquisa}
                onChange={(e) => onTermoPesquisaChange(e.target.value)}
                className="pl-10 h-11 bg-background border-2 focus:border-primary transition-all duration-200"
                placeholder="Pesquisar por nome, sigla, UO, UG ou endereço..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 h-11"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {temFiltrosAtivos && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    !
                  </span>
                )}
              </Button>
              {temFiltrosAtivos && (
                <Button
                  variant="ghost"
                  onClick={limparFiltros}
                  className="flex items-center gap-2 h-11"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painel de filtros avançados */}
      {mostrarFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-sm border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sigla</label>
                  <Input
                    value={filtroSigla}
                    onChange={(e) => setFiltroSigla(e.target.value)}
                    placeholder="Ex: UBS, CAPS..."
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Unidade</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="ubs">UBS</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="caps">CAPS</SelectItem>
                      <SelectItem value="upa">UPA</SelectItem>
                      <SelectItem value="centro">Centro Especializado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      // Aqui você aplicaria os filtros avançados
                      console.log("Aplicar filtros:", { filtroStatus, filtroSigla })
                    }}
                    className="w-full"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}