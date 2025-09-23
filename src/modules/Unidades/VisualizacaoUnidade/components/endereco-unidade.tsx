import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation } from 'lucide-react'
import type { UnidadeSaudeApi } from '@/modules/Unidades/types/unidade-api'

interface EnderecoUnidadeProps {
  unidade: UnidadeSaudeApi
}

export function EnderecoUnidade({ unidade }: EnderecoUnidadeProps) {
  const temEndereco = unidade.endereco || unidade.bairro
  const temCoordenadas =
    unidade.latitude &&
    unidade.longitude &&
    unidade.latitude !== '0' &&
    unidade.longitude !== '0'

  return (
    <div className="space-y-6">
      {/* Informações de Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary h-5 w-5" />
            Informações de Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {temEndereco ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Endereço
                </label>
                <p className="font-medium">{unidade.endereco || 'N/A'}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Bairro
                </label>
                <p className="font-medium">{unidade.bairro || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <MapPin className="text-muted-foreground/50 mx-auto h-12 w-12" />
                <p className="text-muted-foreground mt-2 text-sm">
                  Informações de endereço não disponíveis
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coordenadas Geográficas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="text-primary h-5 w-5" />
            Localização Geográfica
          </CardTitle>
        </CardHeader>
        <CardContent>
          {temCoordenadas ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Latitude
                </label>
                <p className="font-mono text-sm">{unidade.latitude}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Longitude
                </label>
                <p className="font-mono text-sm">{unidade.longitude}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <Navigation className="text-muted-foreground/50 mx-auto h-12 w-12" />
                <p className="text-muted-foreground mt-2 text-sm">
                  Coordenadas geográficas não disponíveis
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
