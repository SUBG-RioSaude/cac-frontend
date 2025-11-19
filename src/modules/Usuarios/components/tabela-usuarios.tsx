import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { Usuario } from '../types/usuario-api'

interface PaginacaoParams {
  pagina: number
  itensPorPagina: number
  total: number
}

interface OrdenacaoParams {
  coluna: 'nome' | 'email' | 'ultimoLogin' | 'ativo'
  direcao: 'asc' | 'desc'
}

interface TabelaUsuariosProps {
  usuarios: Usuario[]
  paginacao: PaginacaoParams
  onPaginacaoChange: (paginacao: PaginacaoParams) => void
  ordenacao: OrdenacaoParams
  onOrdenacao: (coluna: OrdenacaoParams['coluna']) => void
  isLoading?: boolean
}

export const TabelaUsuarios = ({
  usuarios,
  paginacao,
  onPaginacaoChange,
  ordenacao,
  onOrdenacao,
  isLoading = false,
}: TabelaUsuariosProps) => {
  const getIconeOrdenacao = (coluna: OrdenacaoParams['coluna']) => {
    if (ordenacao.coluna !== coluna) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return ordenacao.direcao === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const handleProximaPagina = () => {
    if (paginacao.pagina < Math.ceil(paginacao.total / paginacao.itensPorPagina)) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina + 1,
      })
    }
  }

  const handlePaginaAnterior = () => {
    if (paginacao.pagina > 1) {
      onPaginacaoChange({
        ...paginacao,
        pagina: paginacao.pagina - 1,
      })
    }
  }

  const formatarData = (data: Date | null | undefined): string => {
    if (!data) {
      return 'Nunca'
    }
    try {
      return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  const totalPaginas = Math.ceil(paginacao.total / paginacao.itensPorPagina)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onOrdenacao('nome')}
                  >
                    Nome
                    {getIconeOrdenacao('nome')}
                  </Button>
                </TableHead>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onOrdenacao('email')}
                  >
                    E-mail
                    {getIconeOrdenacao('email')}
                  </Button>
                </TableHead>
                <TableHead className="w-[200px]">Permissão Atribuída</TableHead>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onOrdenacao('ultimoLogin')}
                  >
                    Último Login
                    {getIconeOrdenacao('ultimoLogin')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => onOrdenacao('ativo')}
                  >
                    Status
                    {getIconeOrdenacao('ativo')}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.permissaoAtribuida ? (
                        <Badge variant="secondary">
                          {usuario.permissaoAtribuida}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Sem permissão
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {usuario.ultimoLogin ? (
                        <span className="text-sm">
                          {formatarData(usuario.ultimoLogin)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Nunca
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={usuario.ativo ? 'default' : 'secondary'}
                        className={
                          usuario.ativo
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                        }
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 cursor-pointer p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-600">
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {!isLoading && usuarios.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Mostrando {((paginacao.pagina - 1) * paginacao.itensPorPagina) + 1} a{' '}
              {Math.min(paginacao.pagina * paginacao.itensPorPagina, paginacao.total)} de{' '}
              {paginacao.total} usuários
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePaginaAnterior}
                disabled={paginacao.pagina === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-muted-foreground text-sm">
                Página {paginacao.pagina} de {totalPaginas}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleProximaPagina}
                disabled={paginacao.pagina >= totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

