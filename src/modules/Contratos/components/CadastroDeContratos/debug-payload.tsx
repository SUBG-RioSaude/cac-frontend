import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Download, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface DebugPayloadProps {
  payload: Record<string, unknown>
  title?: string
  className?: string
}

export default function DebugPayload({
  payload,
  title = 'Debug Payload',
  className,
}: DebugPayloadProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopied(true)
      toast.success('Payload copiado para a área de transferência!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Erro ao copiar payload')
    }
  }

  const handleDownload = () => {
    const dataStr = JSON.stringify(payload, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payload-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Payload baixado com sucesso!')
  }

  if (!payload) {
    return null
  }

  return (
    <Card className={`border border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-800">
            <Badge
              variant="outline"
              className="border-orange-300 text-orange-600"
            >
              DEBUG
            </Badge>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
            >
              {isExpanded ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="max-h-96 overflow-auto rounded border bg-white p-4">
            <pre className="text-xs whitespace-pre-wrap text-gray-700">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          <div className="mt-3 text-xs text-orange-700">
            <p>
              <strong>Status:</strong>{' '}
              {copied ? 'Copiado!' : 'Pronto para copiar'}
            </p>
            <p>
              <strong>Tamanho:</strong> {JSON.stringify(payload).length}{' '}
              caracteres
            </p>
            <p>
              <strong>Timestamp:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
