import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SISTEMA_FRONTEND_ID } from '@/config/sistemas'
import { createServiceLogger } from '@/lib/logger'

import { useAtualizarPermissoes } from '../hooks/use-atribuir-permissao'
import { usePermissoesSistema } from '../hooks/use-permissoes-sistema'

const logger = createServiceLogger('atribuir-permissao-form')

interface AtribuirPermissaoFormProps {
  usuarioId: string
  funcionarioId: string
  onSuccess: () => void
  permissoesExistentes?: {
    sistemaId: string
    sistemaNome: string
    permissoes: {
      id: number
      nome: string
    }[]
  }[]
}

export const AtribuirPermissaoForm = ({
  usuarioId,
  funcionarioId,
  onSuccess,
  permissoesExistentes,
}: AtribuirPermissaoFormProps) => {
  const [permissaoSelecionada, setPermissaoSelecionada] = useState<
    string | undefined
  >(undefined)

  const {
    data: permissoesData,
    isLoading: isLoadingPermissoes,
    error: erroPermissoes,
  } = usePermissoesSistema()

  const atualizarPermissoes = useAtualizarPermissoes()

  // Verificar se usuário já tem permissão no sistema atual
  const permissaoNoSistemaAtual = permissoesExistentes?.find(
    (p) => p.sistemaId === SISTEMA_FRONTEND_ID,
  )
  const temPermissao =
    permissaoNoSistemaAtual && permissaoNoSistemaAtual.permissoes.length > 0

  // Pré-selecionar permissão atual se usuário já tiver
  useEffect(() => {
    if (
      temPermissao &&
      permissaoNoSistemaAtual &&
      permissaoNoSistemaAtual.permissoes.length > 0
    ) {
      // Pega a primeira permissão (assumindo que usuário tem apenas uma)
      const [permissaoAtual] = permissaoNoSistemaAtual.permissoes
      setPermissaoSelecionada(permissaoAtual.id.toString())
    }
  }, [temPermissao, permissaoNoSistemaAtual])

  const handleSubmit = () => {
    if (!permissaoSelecionada) {
      toast.error('Selecione uma permissão', {
        description: 'É necessário selecionar uma permissão para continuar',
      })
      return
    }

    if (!permissoesData?.sistemaId) {
      toast.error('Erro ao obter ID do sistema', {
        description:
          'Não foi possível identificar o sistema. Recarregue a página.',
      })
      return
    }

    const permissaoId = Number(permissaoSelecionada)

    logger.info(
      {
        action: 'atualizar-permissoes',
        usuarioId,
        funcionarioId,
        permissaoId,
        sistemaId: permissoesData.sistemaId,
      },
      'Atualizando permissões do usuário (API v1.1)',
    )

    // Novo endpoint da API v1.1: PUT /api/usuarios/{usuarioId}/permissoes
    // Envia array de permissões (neste caso, apenas uma)
    atualizarPermissoes.mutate(
      {
        usuarioId,
        payload: {
          permissoes: [
            {
              sistemaId: permissoesData.sistemaId,
              permissaoId,
            },
          ],
        },
      },
      {
        onSuccess: () => {
          logger.info(
            {
              action: 'atualizar-permissoes',
              status: 'success',
              usuarioId,
              permissaoId,
            },
            'Permissões atualizadas com sucesso',
          )
          onSuccess()
        },
        onError: (erro) => {
          logger.error(
            {
              action: 'atualizar-permissoes',
              status: 'error',
              usuarioId,
              erro: erro instanceof Error ? erro.message : String(erro),
            },
            'Erro ao atualizar permissões',
          )
        },
      },
    )
  }

  // Estado de carregamento
  if (isLoadingPermissoes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atribuir Permissão</CardTitle>
          <CardDescription>
            Carregando permissões disponíveis...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado de erro
  if (erroPermissoes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atribuir Permissão</CardTitle>
          <CardDescription>Erro ao carregar permissões</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Erro ao carregar permissões</strong>
              <br />
              {erroPermissoes instanceof Error
                ? erroPermissoes.message
                : 'Erro desconhecido'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Estado de sucesso (permissões carregadas)
  const isPending = atualizarPermissoes.isPending ?? false
  const hasNoSelection = !permissaoSelecionada
  const isLoading = isLoadingPermissoes ?? false
   
  const isButtonDisabled = hasNoSelection || isPending || isLoading

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5" />
          Atribuir Permissão
        </CardTitle>
        <CardDescription>
          Selecione a permissão que será atribuída ao usuário no sistema{' '}
          <strong>{permissoesData?.sistema.nome ?? 'CAC'}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Aviso se usuário já tiver permissão */}
        {temPermissao && permissaoNoSistemaAtual ? (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Atenção:</strong> O usuário já tem uma permissão atribuída
              no sistema. Qualquer alteração feita pode alterar o tipo do acesso
              dentro do sistema.
              <br />
              <span className="mt-2 inline-block text-sm">
                Permissão atual:{' '}
                <strong>{permissaoNoSistemaAtual.permissoes[0]?.nome}</strong>
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Usuário não possui permissão neste sistema. Selecione uma permissão
              para atribuir.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações do Sistema */}
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Sistema:
            </Label>
            <p className="text-lg font-semibold">
              {permissoesData?.sistema.nome ?? 'CAC'}
            </p>
            {permissoesData?.sistema.descricao && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permissoesData.sistema.descricao}
              </p>
            )}
          </div>
        </div>

        {/* Select de Permissão */}
        <div className="space-y-3">
          <Label htmlFor="permissao-select" className="text-base font-semibold">
            Selecione a permissão:
          </Label>
          <Select
            value={permissaoSelecionada}
            onValueChange={setPermissaoSelecionada}
          >
            <SelectTrigger id="permissao-select" className="w-full">
              <SelectValue placeholder="Escolha uma permissão..." />
            </SelectTrigger>
            <SelectContent>
              {permissoesData?.permissoes.map((permissao) => (
                <SelectItem
                  key={permissao.id}
                  value={permissao.id.toString()}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{permissao.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nota sobre alteração de permissões */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Nota:</strong> A permissão pode ser alterada posteriormente
            através do módulo de gestão de usuários.
          </AlertDescription>
        </Alert>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className="bg-green-600 hover:bg-green-700"
          >
            {atualizarPermissoes.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Atribuindo...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                {temPermissao ? 'Atualizar Permissão' : 'Atribuir Permissão'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
