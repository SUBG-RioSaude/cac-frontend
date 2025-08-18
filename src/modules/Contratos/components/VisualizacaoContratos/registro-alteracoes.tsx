import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react'
import type { AlteracaoContrato } from '@/modules/Contratos/types/contrato-detalhado'

interface RegistroAlteracoesProps {
  alteracoes: AlteracaoContrato[]
}

export function RegistroAlteracoes({ alteracoes }: RegistroAlteracoesProps) {
  const formatarDataHora = (dataHora: string) => {
    return new Date(dataHora).toLocaleString('pt-BR')
  }

  const getIconeAlteracao = (tipo: string) => {
    const icones = {
      criacao: FileText,
      designacao_fiscais: Users,
      primeiro_pagamento: DollarSign,
      atualizacao_documentos: FileText,
      alteracao_valor: DollarSign,
      prorrogacao: Calendar,
    }

    const Icone = icones[tipo as keyof typeof icones] || Info
    return <Icone className="h-5 w-5" />
  }

  const getCorAlteracao = (tipo: string) => {
    const cores = {
      criacao: 'bg-blue-100 text-blue-600',
      designacao_fiscais: 'bg-green-100 text-green-600',
      primeiro_pagamento: 'bg-yellow-100 text-yellow-600',
      atualizacao_documentos: 'bg-purple-100 text-purple-600',
      alteracao_valor: 'bg-orange-100 text-orange-600',
      prorrogacao: 'bg-red-100 text-red-600',
    }

    return cores[tipo as keyof typeof cores] || 'bg-gray-100 text-gray-600'
  }

  const getTituloAlteracao = (tipo: string) => {
    const titulos = {
      criacao: 'Criação do Contrato',
      designacao_fiscais: 'Designação de Fiscais',
      primeiro_pagamento: 'Primeiro Pagamento',
      atualizacao_documentos: 'Atualização de Documentos',
      alteracao_valor: 'Alteração de Valor',
      prorrogacao: 'Prorrogação de Prazo',
    }

    return titulos[tipo as keyof typeof titulos] || 'Alteração'
  }

  const alteracoesOrdenadas = [...alteracoes].sort(
    (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
  )

  return (
    <div className="space-y-6">
      {/* Linha do Tempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha vertical */}
            <div className="bg-border absolute top-0 bottom-0 left-6 w-0.5"></div>

            <div className="space-y-6">
              {alteracoesOrdenadas.map((alteracao, index) => (
                <motion.div
                  key={alteracao.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Ícone na linha do tempo */}
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${getCorAlteracao(alteracao.tipo)} `}
                  >
                    {getIconeAlteracao(alteracao.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className="min-w-0 flex-1">
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                      <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <h3 className="text-base font-semibold">
                          {getTituloAlteracao(alteracao.tipo)}
                        </h3>
                        <Badge variant="outline" className="w-fit text-xs">
                          {formatarDataHora(alteracao.dataHora)}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-2 text-sm">
                        {alteracao.descricao}
                      </p>

                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Users className="h-3 w-3" />
                        <span>Por: {alteracao.responsavel}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etapas do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Etapas do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                etapa: 'Criação do Contrato',
                concluida: true,
                data: alteracoes.find((a) => a.tipo === 'criacao')?.dataHora,
              },
              {
                etapa: 'Designação de Fiscais',
                concluida: true,
                data: alteracoes.find((a) => a.tipo === 'designacao_fiscais')
                  ?.dataHora,
              },
              {
                etapa: 'Primeiro Pagamento',
                concluida: true,
                data: alteracoes.find((a) => a.tipo === 'primeiro_pagamento')
                  ?.dataHora,
              },
              {
                etapa: 'Atualização de Documentos',
                concluida: true,
                data: alteracoes.find(
                  (a) => a.tipo === 'atualizacao_documentos',
                )?.dataHora,
              },
            ].map((etapa, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg border p-4 text-center ${
                  etapa.concluida
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                } `}
              >
                <div
                  className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                    etapa.concluida
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  } `}
                >
                  {etapa.concluida ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <h4 className="mb-1 text-sm font-medium">{etapa.etapa}</h4>
                {etapa.data && (
                  <p className="text-muted-foreground text-xs">
                    {formatarDataHora(etapa.data)}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
