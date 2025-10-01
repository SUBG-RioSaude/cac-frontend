import {
  Search,
  UserPlus,
  X,
  Users,
  UserCheck,
  CheckCircle,
  Loader2,
  Link,
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useFuncionariosParaAtribuicao,
  useGetLotacoesAtivas,
  type Usuario,
  type UsuarioAtribuido,
  mapearFuncionariosParaUsuarios,
  filtrarFuncionariosParaFiscalizacao,
} from '@/modules/Funcionarios'

export interface DadosAtribuicao {
  usuariosAtribuidos: UsuarioAtribuido[]
}

// Estrutura para envio para a API (nova estrutura)
export interface FuncionarioAPI {
  funcionarioId: string
  tipoGerencia: 'Gestor' | 'Fiscal'
  observacoes?: string
}

interface AtribuicaoFiscaisFormProps {
  onSubmit: (dados: DadosAtribuicao) => void
  onFinishRequest: (dados: DadosAtribuicao) => void
  onPrevious: () => void
  dadosIniciais?: DadosAtribuicao
}

const AtribuicaoFiscaisForm = ({
  onFinishRequest,
  onPrevious,
  dadosIniciais,
}: AtribuicaoFiscaisFormProps) => {
  const [busca, setBusca] = useState('')
  const [lotacaoSelecionada, setLotacaoSelecionada] = useState<string>('')
  const [usuariosAtribuidos, setUsuariosAtribuidos] = useState<
    UsuarioAtribuido[]
  >(dadosIniciais?.usuariosAtribuidos ?? [])

  // Sincronizar com dadosIniciais quando mudarem (para suporte ao debug)
  useEffect(() => {
    const { usuariosAtribuidos: usuarios } = dadosIniciais
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (usuarios && usuarios.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setUsuariosAtribuidos(usuarios)
    }
  }, [dadosIniciais])

  // Buscar funcionários da API
  const {
    data: funcionariosApi,
    isLoading: carregandoFuncionarios,
    error: erroFuncionarios,
  } = useFuncionariosParaAtribuicao({
    nome: busca.length >= 2 ? busca : undefined,
    lotacao: lotacaoSelecionada || undefined,
    limit: 100,
  })

  // Buscar lotações para o filtro
  const { data: lotacoesResponse } = useGetLotacoesAtivas({
    tamanhoPagina: 50,
  })

  // Memoizar conversão de funcionários API para usuários
  const todosUsuarios = useMemo(() => {
    if (!funcionariosApi) return []

    // Filtrar apenas funcionários aptos para fiscalização
    const funcionariosAptos =
      filtrarFuncionariosParaFiscalizacao(funcionariosApi)

    // Converter para formato de usuário
    const usuarios = mapearFuncionariosParaUsuarios(funcionariosAptos)

    return usuarios
  }, [funcionariosApi])

  // Filtrar usuários disponíveis (que não estão atribuídos)
  const usuariosDisponiveis = useMemo(() => {
    return todosUsuarios.filter(
      (usuario) =>
        !usuariosAtribuidos.find((atribuido) => atribuido.id === usuario.id),
    )
  }, [todosUsuarios, usuariosAtribuidos])

  // Lista de lotações para o select (filtrando valores vazios)
  const lotacoes = useMemo(() => {
    const todasLotacoes = lotacoesResponse?.dados ?? []
    return todasLotacoes.filter(
      (lotacao) => lotacao.nome && lotacao.nome.trim().length > 0,
    )
  }, [lotacoesResponse])

  // Filtrar usuários por busca (já filtrado pela API, mas mantém compatibilidade)
  const usuariosFiltrados = useMemo(() => {
    if (!busca) return usuariosDisponiveis

    return usuariosDisponiveis.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.matricula.includes(busca),
    )
  }, [usuariosDisponiveis, busca])

  const handleAtribuirUsuario = (usuario: Usuario) => {
    const novoUsuario: UsuarioAtribuido = {
      ...usuario,
      tipo: null,
      observacoes: '',
    }
    setUsuariosAtribuidos((prev) => [...prev, novoUsuario])
  }

  const handleRemoverUsuario = (usuarioId: string) => {
    setUsuariosAtribuidos((prev) =>
      prev.filter((usuario) => usuario.id !== usuarioId),
    )
  }

  const handleTipoChange = (usuarioId: string, tipo: 'fiscal' | 'gestor') => {
    setUsuariosAtribuidos((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioId ? { ...usuario, tipo } : usuario,
      ),
    )
  }

  const handleObservacoesChange = (usuarioId: string, observacoes: string) => {
    setUsuariosAtribuidos((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioId ? { ...usuario, observacoes } : usuario,
      ),
    )
  }

  const handleUrlNomeacaoChange = (usuarioId: string, urlNomeacao: string) => {
    setUsuariosAtribuidos((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioId ? { ...usuario, urlNomeacao } : usuario,
      ),
    )
  }

  const handleSubmit = () => {
    // Permitir finalizar mesmo com tipo não definido (null)
    // Validar somente URL para aqueles com tipo definido fiscal/gestor
    const usuariosSemUrl = usuariosAtribuidos.filter(
      (usuario) =>
        (usuario.tipo === 'fiscal' || usuario.tipo === 'gestor') &&
        (!usuario.urlNomeacao || usuario.urlNomeacao.trim() === ''),
    )
    if (usuariosSemUrl.length > 0) {
      toast.error(
        'Todos os fiscais e gestores devem ter a URL da nomeação preenchida.',
        {
          description:
            'Verifique se todos os fiscais e gestores têm a URL da nomeação preenchida antes de continuar.',
        },
      )
      return
    }
    const dados: DadosAtribuicao = {
      usuariosAtribuidos,
    }
    onFinishRequest(dados)
  }

  const getTipoColor = (tipo: 'fiscal' | 'gestor' | null) => {
    switch (tipo) {
      case 'fiscal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'gestor':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-gray-600" />
              Usuários Disponíveis
              <Badge variant="secondary" className="ml-auto">
                {usuariosFiltrados.length}
              </Badge>
            </CardTitle>
            <div className="mt-3 space-y-3">
              {/* Busca por nome/matrícula */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por lotação */}
              <Select
                value={lotacaoSelecionada || 'all'}
                onValueChange={(value) =>
                  setLotacaoSelecionada(value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por lotação/departamento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lotações</SelectItem>
                  {lotacoes.map((lotacao) => (
                    <SelectItem key={lotacao.id} value={lotacao.nome}>
                      {lotacao.nome} {lotacao.sigla && `(${lotacao.sigla})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {/* Loading state */}
              {carregandoFuncionarios && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <span className="text-sm">Carregando funcionários...</span>
                </div>
              )}

              {/* Error state */}
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
              {erroFuncionarios && !carregandoFuncionarios && (
                <div className="py-8 text-center text-red-500">
                  <X className="mx-auto mb-3 h-12 w-12 text-red-300" />
                  <p className="text-sm font-medium">
                    Erro ao carregar funcionários
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Verifique sua conexão e tente novamente
                  </p>
                </div>
              )}

              {/* Lista de usuários */}
              {!carregandoFuncionarios &&
                !erroFuncionarios &&
                usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {usuario.matricula}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {usuario.cargo}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {usuario.departamento}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAtribuirUsuario(usuario)}
                      className="ml-2 h-8 border-blue-200 px-3 text-blue-600 hover:bg-blue-50"
                      aria-label={`Atribuir ${usuario.nome}`}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {/* Empty state */}
              {!carregandoFuncionarios &&
                !erroFuncionarios &&
                usuariosFiltrados.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <Search className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm">Nenhum funcionário encontrado</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {busca || lotacaoSelecionada
                        ? 'Tente ajustar os filtros de busca'
                        : 'Carregue a lista de funcionários ativos'}
                    </p>
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
              <div className="py-8 text-center text-gray-500">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm">Nenhum usuário atribuído ainda</p>
                <p className="mt-1 text-xs text-gray-400">
                  Selecione usuários da lista ao lado
                </p>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {usuariosAtribuidos.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {usuario.nome}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {usuario.matricula}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {usuario.cargo}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Select
                          value={usuario.tipo ?? ''}
                          onValueChange={(value) =>
                            handleTipoChange(
                              usuario.id,
                              value as 'fiscal' | 'gestor',
                            )
                          }
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
                          <Badge
                            className={`text-xs ${getTipoColor(usuario.tipo)}`}
                          >
                            {usuario.tipo === 'fiscal' ? 'Fiscal' : 'Gestor'}
                          </Badge>
                        )}
                      </div>
                      {/* Campo de observações */}
                      <div className="mt-2">
                        <Input
                          type="text"
                          placeholder="Observações (opcional)..."
                          value={usuario.observacoes ?? ''}
                          onChange={(e) =>
                            handleObservacoesChange(usuario.id, e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      {/* Campo URL da nomeação - para fiscais e gestores */}
                      {(usuario.tipo === 'fiscal' ||
                        usuario.tipo === 'gestor') && (
                        <div className="mt-2">
                          <div className="relative">
                            <Link className="absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
                            <Input
                              type="url"
                              placeholder="URL da nomeação *"
                              value={usuario.urlNomeacao ?? ''}
                              onChange={(e) =>
                                handleUrlNomeacaoChange(
                                  usuario.id,
                                  e.target.value,
                                )
                              }
                              className="h-8 pl-7 text-xs"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverUsuario(usuario.id)}
                      className="ml-2 h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
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

      <div className="flex justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="bg-transparent px-8 py-2.5 transition-all duration-200 hover:bg-gray-50"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-slate-700 px-8 py-2.5 shadow-lg shadow-slate-700/20 transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed"
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

export default AtribuicaoFiscaisForm
