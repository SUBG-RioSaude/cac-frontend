import { Plus, Minus, Edit3, AlertCircle, Info } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateDisplay } from '@/components/ui/formatters'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { BlocoClausulas as IBlocoClausulas } from '../../../../types/alteracoes-contratuais'

interface ContractInfo {
  numeroContrato?: string
  objeto?: string
  valorTotal?: number
  dataInicio?: string
  dataTermino?: string
}

interface BlocoClausulasProps {
  dados: Partial<IBlocoClausulas>
  onChange: (dados: IBlocoClausulas) => void
  contractInfo?: ContractInfo
  errors?: Record<string, string>
  disabled?: boolean
  required?: boolean
}

export const BlocoClausulas = ({
  dados = {},
  onChange,
  contractInfo,
  errors = {},
  disabled = false,
  required = false,
}: BlocoClausulasProps) => {
  const [activeTab, setActiveTab] = useState('excluidas')

  const handleFieldChange = useCallback(
    (field: keyof IBlocoClausulas, value: string) => {
      const novosDados = {
        ...dados,
        [field]: value || undefined,
      }

      // Remove campos vazios para não poluir o objeto
      Object.keys(novosDados).forEach((key) => {
        if (!novosDados[key as keyof IBlocoClausulas]) {
          delete novosDados[key as keyof IBlocoClausulas]
        }
      })

      onChange(novosDados)
    },
    [dados, onChange],
  )

  const handleLimparTudo = useCallback(() => {
    onChange({})
  }, [onChange])

  // Contar cláusulas preenchidas
  const clausulasPreenchidas = Object.values(dados).filter(Boolean).length

  // Templates/exemplos comuns
  const templates = {
    excluidas: [
      'CLÁUSULA X - [especificar qual cláusula] fica suprimida do presente contrato.',
      'Fica revogada a Cláusula X que trata de [assunto específico].',
    ],
    incluidas: [
      'CLÁUSULA X - [TÍTULO]: [conteúdo completo da nova cláusula]',
      'Fica acrescida ao contrato a seguinte cláusula: [nova disposição]',
    ],
    alteradas: [
      'CLÁUSULA X - Onde se lê "[texto original]", leia-se "[novo texto]".',
      'A Cláusula X passa a vigorar com a seguinte redação: [nova redação completa]',
    ],
  }

  const inserirTemplate = useCallback(
    (field: keyof IBlocoClausulas, template: string) => {
      const valorAtual = dados[field] ?? ''
      const novoValor = valorAtual ? `${valorAtual}\n\n${template}` : template
      handleFieldChange(field, novoValor)
    },
    [dados, handleFieldChange],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={clausulasPreenchidas > 0 ? 'default' : 'secondary'}>
            {clausulasPreenchidas} campo{clausulasPreenchidas !== 1 ? 's' : ''}{' '}
            preenchido{clausulasPreenchidas !== 1 ? 's' : ''}
          </Badge>
          {required && clausulasPreenchidas === 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Obrigatório
            </Badge>
          )}
        </div>

        {clausulasPreenchidas > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimparTudo}
            disabled={disabled}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Minus className="mr-1 h-4 w-4" />
            Limpar tudo
          </Button>
        )}
      </div>

      {/* Contexto do Contrato */}
      {contractInfo && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <div className="mb-3">
              <h4 className="flex items-center gap-2 font-medium text-purple-900">
                <Info className="h-4 w-4" />
                Informações do Contrato
              </h4>
              <p className="mt-1 text-xs text-purple-600">
                Contexto base para redação das cláusulas de alteração
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <Label className="text-xs text-purple-600">
                  Número do Contrato
                </Label>
                <p className="font-mono font-medium text-purple-900">
                  {contractInfo.numeroContrato ?? 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-purple-600">
                  Período de Vigência
                </Label>
                <p className="font-medium text-purple-900">
                  {contractInfo.dataInicio && contractInfo.dataTermino ? (
                    <>
                      <DateDisplay value={contractInfo.dataInicio} /> -{' '}
                      <DateDisplay value={contractInfo.dataTermino} />
                    </>
                  ) : (
                    'Não informado'
                  )}
                </p>
              </div>
            </div>
            {contractInfo.objeto && (
              <div className="mt-3 border-t border-purple-200 pt-3">
                <Label className="text-xs text-purple-600">
                  Objeto do Contrato
                </Label>
                <p className="mt-1 line-clamp-2 text-sm text-purple-800">
                  {contractInfo.objeto}
                </p>
              </div>
            )}
            {contractInfo.valorTotal && contractInfo.valorTotal > 0 && (
              <div className="mt-2">
                <Label className="text-xs text-purple-600">Valor Total</Label>
                <p className="font-medium text-purple-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(contractInfo.valorTotal)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Abas para organizar os tipos de cláusulas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="excluidas" className="flex items-center gap-2">
            <Minus className="h-4 w-4" />
            <span className="hidden sm:inline">Excluídas</span>
          </TabsTrigger>
          <TabsTrigger value="incluidas" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Incluídas</span>
          </TabsTrigger>
          <TabsTrigger value="alteradas" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline">Alteradas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="excluidas" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <Minus className="h-4 w-4" />
                Cláusulas Excluídas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Especifique as cláusulas que serão removidas do contrato
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clausulas-excluidas">
                  Cláusulas a serem excluídas
                </Label>
                <Textarea
                  id="clausulas-excluidas"
                  value={dados.clausulasExcluidas ?? ''}
                  onChange={(e) =>
                    handleFieldChange('clausulasExcluidas', e.target.value)
                  }
                  disabled={disabled}
                  rows={4}
                  className={cn(
                    'min-h-[100px]',
                    errors.clausulasExcluidas && 'border-red-500',
                  )}
                  placeholder="Ex: CLÁUSULA VII - Fica suprimida a cláusula que trata de..."
                />
                {errors.clausulasExcluidas && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.clausulasExcluidas}
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Exemplos rápidos:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {templates.excluidas.map((template, index) => (
                    <Button
                      key={`excluida-${template}`}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        inserirTemplate('clausulasExcluidas', template)
                      }
                      disabled={disabled}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Modelo {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incluidas" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-green-700">
                <Plus className="h-4 w-4" />
                Cláusulas Incluídas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Especifique as novas cláusulas que serão adicionadas ao contrato
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clausulas-incluidas">
                  Novas cláusulas a serem incluídas
                </Label>
                <Textarea
                  id="clausulas-incluidas"
                  value={dados.clausulasIncluidas ?? ''}
                  onChange={(e) =>
                    handleFieldChange('clausulasIncluidas', e.target.value)
                  }
                  disabled={disabled}
                  rows={6}
                  className={cn(
                    'min-h-[120px]',
                    errors.clausulasIncluidas && 'border-red-500',
                  )}
                  placeholder="Ex: CLÁUSULA X - DOS NOVOS PROCEDIMENTOS: A contratada deverá..."
                />
                {errors.clausulasIncluidas && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.clausulasIncluidas}
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Exemplos rápidos:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {templates.incluidas.map((template, index) => (
                    <Button
                      key={`incluida-${template}`}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        inserirTemplate('clausulasIncluidas', template)
                      }
                      disabled={disabled}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Modelo {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alteradas" className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                <Edit3 className="h-4 w-4" />
                Cláusulas Alteradas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Especifique as cláusulas existentes que terão seu conteúdo
                modificado
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clausulas-alteradas">
                  Cláusulas a serem alteradas
                </Label>
                <Textarea
                  id="clausulas-alteradas"
                  value={dados.clausulasAlteradas ?? ''}
                  onChange={(e) =>
                    handleFieldChange('clausulasAlteradas', e.target.value)
                  }
                  disabled={disabled}
                  rows={5}
                  className={cn(
                    'min-h-[110px]',
                    errors.clausulasAlteradas && 'border-red-500',
                  )}
                  placeholder="Ex: CLÁUSULA V - Onde se lê 'valor original', leia-se 'novo valor'..."
                />
                {errors.clausulasAlteradas && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.clausulasAlteradas}
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Exemplos rápidos:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {templates.alteradas.map((template, index) => (
                    <Button
                      key={`alterada-${template}`}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        inserirTemplate('clausulasAlteradas', template)
                      }
                      disabled={disabled}
                      className="h-auto px-2 py-1 text-xs"
                    >
                      Modelo {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações adicionais */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-800">
            <h4 className="mb-1 font-medium">
              Dicas para redação de cláusulas:
            </h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Use numeração sequencial (CLÁUSULA X, CLÁUSULA Y, etc.)</li>
              <li>• Seja específico sobre qual cláusula está sendo alterada</li>
              <li>
                • Para alterações, cite claramente o texto original e o novo
              </li>
              <li>• Mantenha linguagem jurídica formal e precisa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
