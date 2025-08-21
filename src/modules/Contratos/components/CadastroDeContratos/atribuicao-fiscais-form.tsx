import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, X, Users, UserCheck, CheckCircle } from "lucide-react"
import { usuariosMock, type Usuario } from "@/modules/Contratos/data/usuarios-mock"

export interface UsuarioAtribuido extends Usuario {
  tipo: "fiscal" | "gestor" | null
}

export interface DadosAtribuicao {
  usuariosAtribuidos: UsuarioAtribuido[]
}

interface AtribuicaoFiscaisFormProps {
  onSubmit: (dados: DadosAtribuicao) => void
  onFinishRequest: (dados: DadosAtribuicao) => void
  onPrevious: () => void
  dadosIniciais?: DadosAtribuicao
}

export default function AtribuicaoFiscaisForm({
  onFinishRequest,
  onPrevious,
  dadosIniciais,
}: AtribuicaoFiscaisFormProps) {
  const [busca, setBusca] = useState("")
  const [usuariosAtribuidos, setUsuariosAtribuidos] = useState<UsuarioAtribuido[]>(
    dadosIniciais?.usuariosAtribuidos || [],
  )

  // Filtrar usuários disponíveis (que não estão atribuídos)
  const usuariosDisponiveis = usuariosMock.filter(
    (usuario) => !usuariosAtribuidos.find((atribuido) => atribuido.id === usuario.id),
  )

  // Filtrar usuários por busca
  const usuariosFiltrados = usuariosDisponiveis.filter(
    (usuario) => usuario.nome.toLowerCase().includes(busca.toLowerCase()) || usuario.matricula.includes(busca),
  )

  const handleAtribuirUsuario = (usuario: Usuario) => {
    const novoUsuario: UsuarioAtribuido = { ...usuario, tipo: null }
    setUsuariosAtribuidos((prev) => [...prev, novoUsuario])
  }

  const handleRemoverUsuario = (usuarioId: string) => {
    setUsuariosAtribuidos((prev) => prev.filter((usuario) => usuario.id !== usuarioId))
  }

  const handleTipoChange = (usuarioId: string, tipo: "fiscal" | "gestor") => {
    setUsuariosAtribuidos((prev) => prev.map((usuario) => (usuario.id === usuarioId ? { ...usuario, tipo } : usuario)))
  }

  const handleSubmit = () => {
    const dados: DadosAtribuicao = {
      usuariosAtribuidos,
    }
    onFinishRequest(dados)
  }

  const getTipoColor = (tipo: "fiscal" | "gestor" | null) => {
    switch (tipo) {
      case "fiscal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "gestor":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <Card className="border border-slate-200">
          <CardHeader className=" border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-gray-600" />
              Usuários Disponíveis
              <Badge variant="secondary" className="ml-auto">
                {usuariosFiltrados.length}
              </Badge>
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{usuario.nome}</p>
                      <Badge variant="outline" className="text-xs">
                        {usuario.matricula}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{usuario.cargo}</p>
                    <p className="text-xs text-gray-400 truncate">{usuario.departamento}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAtribuirUsuario(usuario)}
                    className="ml-2 h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                    aria-label={`Atribuir ${usuario.nome}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhum usuário encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">Tente ajustar os termos de busca</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Usuários Atribuídos ao Contrato
              <Badge variant="secondary" className="ml-auto">
                {usuariosAtribuidos.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {usuariosAtribuidos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhum usuário atribuído ainda</p>
                <p className="text-xs text-gray-400 mt-1">Selecione usuários da lista ao lado</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {usuariosAtribuidos.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{usuario.nome}</p>
                        <Badge variant="outline" className="text-xs">
                          {usuario.matricula}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{usuario.cargo}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Select
                          value={usuario.tipo || ""}
                          onValueChange={(value) => handleTipoChange(usuario.id, value as "fiscal" | "gestor")}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fiscal">Fiscal</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                          </SelectContent>
                        </Select>
                        {usuario.tipo && (
                          <Badge className={`text-xs ${getTipoColor(usuario.tipo)}`}>
                            {usuario.tipo === "fiscal" ? "Fiscal" : "Gestor"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverUsuario(usuario.id)}
                      className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remover ${usuario.nome}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8 py-2.5 bg-transparent transition-all duration-200 hover:bg-gray-50">
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-slate-700 hover:bg-slate-800 disabled:cursor-not-allowed px-8 py-2.5 shadow-lg shadow-slate-700/20 transition-all duration-200"
          disabled={usuariosAtribuidos.length === 0}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Finalizar Cadastro
          </div>
        </Button>
      </div>
    </div>
  )
}