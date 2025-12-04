import { Bell, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const NOTIFICATION_VOLUME_KEY = 'notification-volume'

export const NotificacoesSection = () => {
  const [volume, setVolume] = useState(50)

  // Carregar volume do localStorage ao montar o componente
  useEffect(() => {
    const savedVolume = localStorage.getItem(NOTIFICATION_VOLUME_KEY)
    if (savedVolume) {
      setVolume(Number(savedVolume))
    }
  }, [])

  // Salvar volume no localStorage quando alterar
  const handleVolumeChange = ([newVolume]: number[]) => {
    setVolume(newVolume)
    localStorage.setItem(NOTIFICATION_VOLUME_KEY, newVolume.toString())
  }

  // Testar som de notificação
  const handleTestarSom = () => {
    const audio = new Audio('/notification.mp3')
    audio.volume = volume / 100
    void audio.play().catch(() => {
      // Erro silencioso ao reproduzir som
    })
  }

  const isMuted = volume === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Ajuste o volume do som das notificações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controle de Volume */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Volume do Som</Label>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
              <span className="w-12 text-right font-medium">{volume}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <VolumeX className="size-5 text-gray-400" />
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <Volume2 className="size-5 text-gray-400" />
          </div>
        </div>

        {/* Botão de Teste */}
        <div className="flex justify-end">
          <Button
            onClick={handleTestarSom}
            variant="outline"
            className="gap-2"
            disabled={isMuted}
          >
            <Volume2 className="size-4" />
            Testar Som
          </Button>
        </div>

        {/* Aviso se estiver mutado */}
        {isMuted && (
          <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-3 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Atenção:</strong> O volume está em 0%. Você não ouvirá
              sons de notificação.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
