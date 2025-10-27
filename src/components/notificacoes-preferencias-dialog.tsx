/**
 * Modal de preferências de notificações
 * Permite configurar tipos, sons e notificações nativas
 */

import { Volume2, VolumeX, Bell, BellOff, TestTube } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  usePreferenciasQuery,
  useAtualizarPreferenciaMutation,
} from '@/hooks/use-notificacoes-query'
import {
  solicitarPermissao,
  obterStatusPermissao,
  mostrarNotificacaoTeste,
  navegadorSuportaNotificacoes,
} from '@/lib/browser-notifications'
import {
  obterPreferenciasLocais,
  salvarPreferenciasLocais,
  tocarSomTeste,
  type PreferenciasLocais,
} from '@/lib/notification-sound'

// ============================================================================
// COMPONENTE
// ============================================================================

interface NotificacoesPreferenciasDialogProps {
  /**
   * Se o modal está aberto
   */
  aberto: boolean

  /**
   * Callback ao fechar o modal
   */
  aoFechar: () => void
}

export const NotificacoesPreferenciasDialog = ({
  aberto,
  aoFechar,
}: NotificacoesPreferenciasDialogProps) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [preferenciasLocais, setPreferenciasLocais] =
    useState<PreferenciasLocais>(obterPreferenciasLocais())

  const [permissaoNotificacoes, setPermissaoNotificacoes] =
    useState<NotificationPermission>('default')

  const [salvando, setSalvando] = useState(false)

  // ============================================================================
  // QUERIES E MUTATIONS
  // ============================================================================

  const { data: preferenciasAPI, isLoading: isLoadingPreferencias } =
    usePreferenciasQuery(aberto)

  const atualizarPreferenciaMutation = useAtualizarPreferenciaMutation()

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Carrega preferências locais ao abrir modal
   */
  useEffect(() => {
    if (aberto) {
      setPreferenciasLocais(obterPreferenciasLocais())
      setPermissaoNotificacoes(obterStatusPermissao())
    }
  }, [aberto])

  // ============================================================================
  // HANDLERS - PREFERÊNCIAS LOCAIS
  // ============================================================================

  /**
   * Alterna som de notificação
   */
  const handleToggleSom = (habilitado: boolean) => {
    const novasPreferencias = {
      ...preferenciasLocais,
      somHabilitado: habilitado,
    }
    setPreferenciasLocais(novasPreferencias)
    salvarPreferenciasLocais(novasPreferencias)

    toast.success(
      habilitado
        ? 'Som de notificação habilitado'
        : 'Som de notificação desabilitado',
    )
  }

  /**
   * Altera volume do som
   */
  const handleAlterarVolume = (valores: number[]) => {
    const [volume] = valores
    const novasPreferencias = {
      ...preferenciasLocais,
      volumeSom: volume,
    }
    setPreferenciasLocais(novasPreferencias)
    salvarPreferenciasLocais(novasPreferencias)
  }

  /**
   * Testa som de notificação
   */
  const handleTestarSom = async () => {
    try {
      await tocarSomTeste(preferenciasLocais.volumeSom)
      toast.success('Som de teste reproduzido')
    } catch (erro) {
      toast.error('Erro ao reproduzir som', {
        description:
          'Verifique se o arquivo de som existe em /public/sounds/notification.mp3',
      })
      console.error('Erro ao testar som:', erro)
    }
  }

  // ============================================================================
  // HANDLERS - NOTIFICAÇÕES NATIVAS
  // ============================================================================

  /**
   * Solicita permissão para notificações nativas
   */
  const handleSolicitarPermissao = async () => {
    const concedida = await solicitarPermissao()

    if (concedida) {
      setPermissaoNotificacoes('granted')
      const novasPreferencias = {
        ...preferenciasLocais,
        notificacoesNativasHabilitadas: true,
      }
      setPreferenciasLocais(novasPreferencias)
      salvarPreferenciasLocais(novasPreferencias)

      toast.success('Permissão concedida para notificações')
    } else {
      toast.error('Permissão negada para notificações', {
        description: 'Você pode habilitar nas configurações do navegador',
      })
    }
  }

  /**
   * Alterna notificações nativas
   */
  const handleToggleNotificacoesNativas = (habilitado: boolean) => {
    if (habilitado && permissaoNotificacoes !== 'granted') {
      // Precisa solicitar permissão primeiro
      handleSolicitarPermissao()
      return
    }

    const novasPreferencias = {
      ...preferenciasLocais,
      notificacoesNativasHabilitadas: habilitado,
    }
    setPreferenciasLocais(novasPreferencias)
    salvarPreferenciasLocais(novasPreferencias)

    toast.success(
      habilitado
        ? 'Notificações nativas habilitadas'
        : 'Notificações nativas desabilitadas',
    )
  }

  /**
   * Testa notificação nativa
   */
  const handleTestarNotificacao = () => {
    const notificacao = mostrarNotificacaoTeste()

    if (notificacao) {
      toast.success('Notificação de teste enviada')
    } else {
      toast.error('Não foi possível mostrar notificação', {
        description: 'Verifique se as permissões estão concedidas',
      })
    }
  }

  // ============================================================================
  // HANDLERS - PREFERÊNCIAS DA API
  // ============================================================================

  /**
   * Alterna preferência de tipo de notificação na API
   */
  const handleToggleTipoNotificacao = async (
    preferenciaId: string,
    habilitada: boolean,
  ) => {
    try {
      await atualizarPreferenciaMutation.mutateAsync({
        id: preferenciaId,
        habilitada,
      })
    } catch (erro) {
      console.error('Erro ao atualizar preferência:', erro)
    }
  }

  // ============================================================================
  // HANDLERS - MODAL
  // ============================================================================

  /**
   * Salva e fecha modal
   */
  const handleSalvar = () => {
    setSalvando(true)

    // Preferências locais já foram salvas em tempo real
    // Apenas fecha o modal

    setTimeout(() => {
      setSalvando(false)
      aoFechar()
      toast.success('Preferências salvas com sucesso')
    }, 300)
  }

  /**
   * Cancela e fecha modal
   */
  const handleCancelar = () => {
    // Recarrega preferências originais
    setPreferenciasLocais(obterPreferenciasLocais())
    aoFechar()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={aberto} onOpenChange={aoFechar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preferências de Notificações</DialogTitle>
          <DialogDescription>
            Configure como você deseja receber notificações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ========== SOM ========== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferenciasLocais.somHabilitado ? (
                  <Volume2 className="h-4 w-4 text-blue-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <Label htmlFor="som-toggle" className="text-sm font-medium">
                  Som de Notificação
                </Label>
              </div>
              <Switch
                id="som-toggle"
                checked={preferenciasLocais.somHabilitado}
                onCheckedChange={handleToggleSom}
              />
            </div>

            {preferenciasLocais.somHabilitado && (
              <div className="space-y-2 pl-6">
                <Label
                  htmlFor="volume-slider"
                  className="text-xs text-gray-600"
                >
                  Volume: {Math.round(preferenciasLocais.volumeSom * 100)}%
                </Label>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[preferenciasLocais.volumeSom]}
                  onValueChange={handleAlterarVolume}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestarSom}
                  className="w-full text-xs"
                >
                  <TestTube className="mr-1 h-3 w-3" />
                  Testar Som
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* ========== NOTIFICAÇÕES NATIVAS ========== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferenciasLocais.notificacoesNativasHabilitadas ? (
                  <Bell className="h-4 w-4 text-blue-600" />
                ) : (
                  <BellOff className="h-4 w-4 text-gray-400" />
                )}
                <Label
                  htmlFor="notificacoes-toggle"
                  className="text-sm font-medium"
                >
                  Notificações do Navegador
                </Label>
              </div>
              <Switch
                id="notificacoes-toggle"
                checked={preferenciasLocais.notificacoesNativasHabilitadas}
                onCheckedChange={handleToggleNotificacoesNativas}
                disabled={!navegadorSuportaNotificacoes()}
              />
            </div>

            {!navegadorSuportaNotificacoes() && (
              <p className="pl-6 text-xs text-gray-500">
                Seu navegador não suporta notificações nativas
              </p>
            )}

            {navegadorSuportaNotificacoes() &&
              permissaoNotificacoes === 'denied' && (
                <p className="pl-6 text-xs text-amber-600">
                  ⚠️ Permissão negada. Habilite nas configurações do navegador.
                </p>
              )}

            {navegadorSuportaNotificacoes() &&
              permissaoNotificacoes === 'default' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSolicitarPermissao}
                  className="ml-6 w-[calc(100%-1.5rem)] text-xs"
                >
                  Solicitar Permissão
                </Button>
              )}

            {preferenciasLocais.notificacoesNativasHabilitadas &&
              permissaoNotificacoes === 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestarNotificacao}
                  className="ml-6 w-[calc(100%-1.5rem)] text-xs"
                >
                  <TestTube className="mr-1 h-3 w-3" />
                  Testar Notificação
                </Button>
              )}
          </div>

          <Separator />

          {/* ========== TIPOS DE NOTIFICAÇÃO (API) ========== */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Tipos de Notificação</Label>

            {isLoadingPreferencias ? (
              <div className="space-y-2 pl-6">
                <div className="h-8 animate-pulse rounded bg-gray-100" />
                <div className="h-8 animate-pulse rounded bg-gray-100" />
                <div className="h-8 animate-pulse rounded bg-gray-100" />
              </div>
            ) : preferenciasAPI && preferenciasAPI.length > 0 ? (
              <div className="space-y-2 pl-6">
                {preferenciasAPI.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between"
                  >
                    <Label
                      htmlFor={`tipo-${pref.id}`}
                      className="text-xs text-gray-600"
                    >
                      {pref.tipoNotificacao}
                    </Label>
                    <Switch
                      id={`tipo-${pref.id}`}
                      checked={pref.habilitada}
                      onCheckedChange={(habilitada) =>
                        handleToggleTipoNotificacao(pref.id, habilitada)
                      }
                      disabled={atualizarPreferenciaMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="pl-6 text-xs text-gray-500">
                Nenhuma preferência configurada na API
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancelar}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
