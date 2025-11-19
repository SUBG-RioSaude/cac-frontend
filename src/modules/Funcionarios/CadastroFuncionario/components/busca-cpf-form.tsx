import { Search, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cpfUtils } from '@/lib/utils'
import type { FuncionarioApi } from '@/modules/Funcionarios/types/funcionario-api'

import { useBuscarFuncionarioCpf } from '../hooks/use-buscar-funcionario-cpf'

interface BuscaCpfFormProps {
  onFuncionarioEncontrado: (funcionario: FuncionarioApi) => void
  onCadastroManual: (cpf: string) => void
}

export const BuscaCpfForm = ({
  onFuncionarioEncontrado,
  onCadastroManual,
}: BuscaCpfFormProps) => {
  const [cpfInput, setCpfInput] = useState('')
  const [buscaRealizada, setBuscaRealizada] = useState(false)

  const {
    buscar,
    isLoading,
    encontrado,
    funcionario,
    erro,
    reset,
  } = useBuscarFuncionarioCpf()

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    const masked = cpfUtils.mask(value)
    setCpfInput(masked)
  }

  const handleBuscar = async () => {
    const cpfLimpo = cpfUtils.clean(cpfInput)

    // Validação de CPF
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      toast.error('CPF inválido', {
        description: 'Digite um CPF válido com 11 dígitos',
      })
      return
    }

    if (!cpfUtils.validate(cpfLimpo)) {
      toast.error('CPF inválido', {
        description: 'O CPF digitado não é válido',
      })
      return
    }

    // Busca funcionário (service faz 3 retries HTTP automaticamente)
    setBuscaRealizada(true)
    const resultado = await buscar(cpfLimpo)

    if (resultado.encontrado && resultado.funcionario) {
      toast.success('Funcionário encontrado!', {
        description: `${resultado.funcionario.nomeCompleto} - Matrícula: ${resultado.funcionario.matricula}`,
      })
      onFuncionarioEncontrado(resultado.funcionario)
    } else {
      // Não encontrado após 3 retries HTTP
      toast.warning('Funcionário não encontrado', {
        description:
          'Funcionário não encontrado na base após 3 tentativas. Por favor, preencha todos os dados manualmente.',
      })
      onCadastroManual(cpfLimpo) // Passa o CPF limpo para o cadastro manual
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !encontrado) {
      handleBuscar()
    }
  }

  const handleNovaBusca = () => {
    reset()
    setCpfInput('')
    setBuscaRealizada(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Funcionário</CardTitle>
        <CardDescription>
          Digite o CPF do funcionário para buscar na base de dados. O sistema fará 3 tentativas automáticas de busca.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF do Funcionário</Label>
          <div className="flex gap-2">
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={handleCpfChange}
              onKeyPress={handleKeyPress}
              maxLength={14}
              disabled={isLoading || encontrado}
              className="flex-1"
            />
            <Button
              onClick={handleBuscar}
              disabled={isLoading || encontrado || !cpfInput}
              size="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 size-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Indicador de busca em andamento */}
        {isLoading && (
          <Alert>
            <Loader2 className="size-4 animate-spin" />
            <AlertDescription>
              Buscando funcionário na base de dados (tentando até 3 vezes automaticamente)...
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback de sucesso */}
        {encontrado && funcionario && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Funcionário encontrado!</strong>
              <br />
              {funcionario.nomeCompleto} - Matrícula: {funcionario.matricula}
              <br />
              <span className="text-sm">
                Os campos serão preenchidos automaticamente
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback de não encontrado */}
        {buscaRealizada && !encontrado && !isLoading && erro && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="size-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Funcionário não encontrado</strong>
              <br />
              {erro}
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de nova busca */}
        {encontrado && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleNovaBusca} size="sm">
              Nova Busca
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
