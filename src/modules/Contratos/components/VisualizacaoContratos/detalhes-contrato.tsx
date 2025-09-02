import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Hash,
  User,
  Edit,
  AlertTriangle,
} from 'lucide-react'
import type { ContratoDetalhado } from '@/modules/Contratos/types/contrato'
import { useEmpresa } from '@/modules/Empresas/hooks/use-empresas'
import { useUnidadesByIds } from '@/modules/Unidades/hooks/use-unidades'

interface DetalhesContratoProps {
  contrato: ContratoDetalhado
}

export function DetalhesContrato({ contrato }: DetalhesContratoProps) {
  const [subabaAtiva, setSubabaAtiva] = useState('visao-geral')
  const [editandoCampo, setEditandoCampo] = useState<string | null>(null)

  // Buscar dados completos da empresa
  const { 
    data: empresaData, 
    isLoading: empresaLoading, 
    error: empresaError 
  } = useEmpresa(contrato.empresaId, { enabled: !!contrato.empresaId })

  // Coletar IDs das unidades para busca
  const unidadesIds = [
    contrato.unidadeDemandante, 
    contrato.unidadeGestora,
    ...(contrato.unidadesVinculadas?.map(u => u.unidadeId) || [])
  ].filter(Boolean)

  // Buscar dados completos das unidades
  const { 
    data: unidadesData, 
    isLoading: unidadesLoading, 
    error: unidadesError 
  } = useUnidadesByIds(unidadesIds, { enabled: unidadesIds.length > 0 })

  // Helper para obter nome da unidade
  const getUnidadeNome = (unidadeId: string | null | undefined) => {
    if (!unidadeId) return 'Não informado'
    if (unidadesLoading) return 'Carregando...'
    return unidadesData?.[unidadeId]?.nomeUnidade || unidadeId
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }

  const formatarCEP = (cep: string) => {
    return cep.replace(/^(\d{5})(\d{3})/, '$1-$2')
  }

  const isValidOriginalDate = (dateString?: string) => {
    return dateString && !dateString.startsWith('0001-01-01')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        label: 'Ativo',
        className: 'bg-green-100 text-green-800',
      },
      vencendo: {
        label: 'Vencendo em Breve',
        className: 'bg-yellow-100 text-yellow-800',
      },
      vencido: {
        label: 'Vencido',
        className: 'bg-red-100 text-red-800',
      },
      suspenso: {
        label: 'Suspenso',
        className: 'bg-gray-100 text-gray-800',
      },
      encerrado: {
        label: 'Encerrado',
        className: 'bg-blue-100 text-blue-800',
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getTipoContratacaoBadge = (tipo: string) => {
    return (
      <Badge variant={tipo === 'centralizado' ? 'default' : 'secondary'}>
        {tipo === 'centralizado' ? 'Centralizado' : 'Descentralizado'}
      </Badge>
    )
  }

  const handleEditarCampo = (campo: string) => {
    setEditandoCampo(editandoCampo === campo ? null : campo)
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={subabaAtiva}
        onValueChange={setSubabaAtiva}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="visao-geral" className="text-xs sm:text-sm">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fornecedor" className="text-xs sm:text-sm">
            Fornecedor
          </TabsTrigger>
          <TabsTrigger value="unidades" className="text-xs sm:text-sm">
            Unidades
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={subabaAtiva}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Dados Básicos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Dados Básicos
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('dados-basicos')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Número do Contrato
                        </p>
                        <p className="font-semibold">
                          {contrato.numeroContrato}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo Rio
                          </p>
                          <p className="font-semibold">
                            {contrato.processoRio || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo SEI
                          </p>
                          <p className="font-semibold">
                            {contrato.processoSei || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo Legado
                          </p>
                          <p className="font-semibold">
                            {contrato.processoLegado || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Categoria do Objeto
                      </p>
                      <p className="font-medium">{contrato.categoriaObjeto}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Descrição do Objeto
                      </p>
                      <p className="font-medium">{contrato.objeto}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Tipo de Contratação
                        </p>
                        <div className="mt-1">
                          {getTipoContratacaoBadge(contrato.tipoContratacao || '')}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(contrato.status || '')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vigência e Valores */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Vigência e Valores
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('vigencia-valores')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Data de Início
                        </p>
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {formatarData(contrato.dataInicio)}
                          </p>
                          {isValidOriginalDate(contrato.vigenciaOriginalInicial) && (
                            <p className="text-sm text-gray-500">
                              Original: {formatarData(contrato.vigenciaOriginalInicial!)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Data de Término
                        </p>
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {formatarData(contrato.dataTermino)}
                          </p>
                          {isValidOriginalDate(contrato.vigenciaOriginalFinal) && (
                            <p className="text-sm text-gray-500">
                              Original: {formatarData(contrato.vigenciaOriginalFinal!)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Prazo Inicial
                      </p>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {contrato.prazoInicialMeses} meses
                        </p>
                        {contrato.prazoOriginalMeses && 
                         contrato.prazoOriginalMeses > 0 && 
                         contrato.prazoOriginalMeses !== contrato.prazoInicialMeses && (
                          <p className="text-sm text-gray-500">
                            Original: {contrato.prazoOriginalMeses} meses
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Valor Total do Contrato
                      </p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-600">
                          {formatarMoeda(contrato.valorTotal)}
                        </p>
                        {contrato.valorGlobalOriginal && (
                          <p className="text-sm text-gray-500">
                            Original: {formatarMoeda(contrato.valorGlobalOriginal)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fiscais Administrativos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Fiscais Administrativos
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('fiscais')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contrato.responsaveis.fiscaisAdministrativos.map(
                      (fiscal) => (
                        <div key={fiscal.id} className="rounded-lg border p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{fiscal.nome}</h4>
                              <p className="text-muted-foreground text-sm">
                                {fiscal.cargo}
                              </p>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {fiscal.email}
                                </div>
                                {fiscal.telefone && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {fiscal.telefone}
                                  </div>
                                )}
                                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  Designado em{' '}
                                  {formatarData(fiscal.dataDesignacao)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                {/* Gestores */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Gestores do Contrato
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('gestores')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contrato.responsaveis.gestores.map((gestor) => (
                      <div key={gestor.id} className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{gestor.nome}</h4>
                            <p className="text-muted-foreground text-sm">
                              {gestor.cargo}
                            </p>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3" />
                                {gestor.email}
                              </div>
                              {gestor.telefone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {gestor.telefone}
                                </div>
                              )}
                              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Calendar className="h-3 w-3" />
                                Designado em{' '}
                                {formatarData(gestor.dataDesignacao)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Informações CCon */}
                {contrato.ccon && (
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Informações CCon
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarCampo('ccon')}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Número CCon
                          </p>
                          <p className="font-semibold">
                            {contrato.ccon.numero}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Data de Início
                          </p>
                          <p className="font-semibold">
                            {formatarData(contrato.ccon.dataInicio)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Data de Término
                          </p>
                          <p className="font-semibold">
                            {formatarData(contrato.ccon.dataTermino)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Fornecedor */}
            <TabsContent value="fornecedor" className="mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Dados da Empresa */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Dados da Empresa
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('dados-empresa')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {empresaError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Erro ao carregar dados da empresa. Mostrando dados básicos do contrato.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Razão Social
                      </p>
                      {empresaLoading ? (
                        <Skeleton className="h-7 w-3/4 mt-1" />
                      ) : (
                        <p className="text-lg font-semibold">
                          {empresaData?.razaoSocial || contrato.fornecedor.razaoSocial}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">CNPJ</p>
                        {empresaLoading ? (
                          <Skeleton className="h-6 w-full mt-1" />
                        ) : (
                          <p className="font-semibold">
                            {formatarCNPJ(empresaData?.cnpj || contrato.fornecedor.cnpj)}
                          </p>
                        )}
                      </div>
                      {(empresaData?.inscricaoEstadual || contrato.fornecedor.inscricaoEstadual || empresaLoading) && (
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Inscrição Estadual
                          </p>
                          {empresaLoading ? (
                            <Skeleton className="h-6 w-full mt-1" />
                          ) : (
                            <p className="font-semibold">
                              {empresaData?.inscricaoEstadual || contrato.fornecedor.inscricaoEstadual}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {(empresaData?.inscricaoMunicipal || contrato.fornecedor.inscricaoMunicipal || empresaLoading) && (
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Inscrição Municipal
                        </p>
                        {empresaLoading ? (
                          <Skeleton className="h-6 w-3/4 mt-1" />
                        ) : (
                          <p className="font-semibold">
                            {empresaData?.inscricaoMunicipal || contrato.fornecedor.inscricaoMunicipal}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contatos */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contatos
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('contatos')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {empresaLoading ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (empresaData?.contatos && empresaData.contatos.length > 0) ? (
                      empresaData.contatos.map((contato, index) => {
                        // Detectar se é email ou telefone baseado no tipo ou valor
                        const isEmail = contato.tipo?.toLowerCase().includes('email') || 
                                       contato.valor?.includes('@')
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              {isEmail ? (
                                <Mail className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Phone className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{contato.valor}</p>
                              <p className="text-muted-foreground text-sm">
                                {contato.nome && (
                                  <span className="capitalize">{contato.nome}</span>
                                )}
                                {contato.nome && contato.tipo && ' - '}
                                {contato.tipo && (
                                  <span className="capitalize">{contato.tipo}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : contrato.fornecedor.contatos.length > 0 ? (
                      contrato.fornecedor.contatos.map((contato, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            {contato.tipo === 'email' ? (
                              <Mail className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Phone className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contato.valor}</p>
                            <p className="text-muted-foreground text-sm capitalize">
                              {contato.tipo}
                              {contato.principal && ' (Principal)'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        Nenhum contato cadastrado
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Endereço */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('endereco')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {empresaLoading ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className={i === 1 ? "sm:col-span-2" : ""}>
                            <Skeleton className="h-4 w-16 mb-1" />
                            <Skeleton className="h-6 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground text-sm">CEP</p>
                          <p className="font-semibold">
                            {formatarCEP(empresaData?.endereco?.cep || contrato.fornecedor.endereco.cep)}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground text-sm">
                            Logradouro
                          </p>
                          <p className="font-semibold">
                            {empresaData?.endereco?.logradouro || contrato.fornecedor.endereco.logradouro}
                            {(empresaData?.endereco?.numero || contrato.fornecedor.endereco.numero) &&
                              `, ${empresaData?.endereco?.numero || contrato.fornecedor.endereco.numero}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Bairro</p>
                          <p className="font-semibold">
                            {empresaData?.endereco?.bairro || contrato.fornecedor.endereco.bairro}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Cidade</p>
                          <p className="font-semibold">
                            {empresaData?.endereco?.cidade || contrato.fornecedor.endereco.cidade}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">UF</p>
                          <p className="font-semibold">
                            {empresaData?.endereco?.uf || contrato.fornecedor.endereco.uf}
                          </p>
                        </div>
                        {(empresaData?.endereco?.complemento || contrato.fornecedor.endereco.complemento) && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-sm">
                              Complemento
                            </p>
                            <p className="font-semibold">
                              {empresaData?.endereco?.complemento || contrato.fornecedor.endereco.complemento}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Unidades */}
            <TabsContent value="unidades" className="mt-0">
              <div className="space-y-6">
                {unidadesError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erro ao carregar dados das unidades. Mostrando informações básicas disponíveis.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Unidades Principais */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Unidade Demandante
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarCampo('unidade-demandante')}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {unidadesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-7 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-semibold">
                            {getUnidadeNome(contrato.unidadeDemandante)}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Responsável pela demanda do contrato
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Unidade Gestora
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarCampo('unidade-gestora')}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {unidadesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-7 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-semibold">
                            {getUnidadeNome(contrato.unidadeGestora)}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Responsável pela gestão do contrato
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Unidades Vinculadas */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Unidades Vinculadas
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarCampo('unidades-vinculadas')}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {unidadesLoading ? (
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="rounded-lg border p-4">
                              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-6 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="text-right space-y-1">
                                  <Skeleton className="h-7 w-24" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                              </div>
                              <div className="mt-3">
                                <Skeleton className="h-2 w-full rounded-full" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : contrato.unidadesVinculadas && contrato.unidadesVinculadas.length > 0 ? (
                        contrato.unidadesVinculadas.map((unidade, index) => {
                          const nomeUnidade = getUnidadeNome(unidade.unidadeId)
                          const percentualValor = ((unidade.valorAtribuido / contrato.valorTotal) * 100).toFixed(1)
                          
                          return (
                            <div key={index} className="rounded-lg border p-4">
                              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{nomeUnidade}</h4>
                                  <p className="text-muted-foreground text-sm">
                                    {percentualValor}% do valor total
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">
                                    {formatarMoeda(unidade.valorAtribuido)}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    Valor Atribuído
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{ width: `${percentualValor}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : contrato.unidades.vinculadas.length > 0 ? (
                        contrato.unidades.vinculadas.map((unidade, index) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                              <div className="flex-1">
                                <h4 className="font-semibold">{unidade.nome}</h4>
                                <p className="text-muted-foreground text-sm">
                                  {unidade.percentualValor}% do valor total
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  {formatarMoeda(unidade.valorTotalMensal)}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  Valor Total Mensal
                                </p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-blue-600"
                                  style={{ width: `${unidade.percentualValor}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground">
                          Nenhuma unidade vinculada encontrada
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
