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
  X,
  AlertTriangle,
} from 'lucide-react'
import type { ContratoDetalhado, Endereco } from '@/modules/Contratos/types/contrato'
import { useEmpresa } from '@/modules/Empresas/hooks/use-empresas'
import { useUnidadesByIds } from '@/modules/Unidades/hooks/use-unidades'
import { 
  EditableFieldWrapper,
  ConfirmEditModal,
  useFieldEditing
} from '@/modules/Contratos/components/EditableFields'
import { FuncionarioCard } from './FuncionarioCard'

interface DetalhesContratoProps {
  contrato: ContratoDetalhado
}

// Type para acessar campos que vêm da API mas não estão na interface ContratoDetalhado
type ContratoComIds = ContratoDetalhado & {
  unidadeDemandanteId?: string
  unidadeGestoraId?: string
}

export function DetalhesContrato({ contrato }: DetalhesContratoProps) {
  const [subabaAtiva, setSubabaAtiva] = useState('visao-geral')
  
  const {
    isEditing,
    isGroupEditing,
    pendingValue,
    isLoading,
    startEditing,
    startGroupEditing,
    cancelEditing,
    handleFieldSave,
    confirmSave,
    modalProps
  } = useFieldEditing({ contrato })

  // Buscar dados completos da empresa
  const { 
    data: empresaData, 
    isLoading: empresaLoading, 
    error: empresaError 
  } = useEmpresa(contrato.empresaId, { enabled: !!contrato.empresaId })

  // Coletar IDs das unidades para busca  
  const contratoComIds = contrato as ContratoComIds
  const unidadesIds = [
    contratoComIds.unidadeDemandanteId, 
    contratoComIds.unidadeGestoraId,
    ...(contrato.unidadesVinculadas?.map(u => u.unidadeSaudeId) || [])
  ].filter((id): id is string => Boolean(id))

  // Buscar dados completos das unidades usando hook otimizado
  const { 
    data: unidadesData, 
    isLoading: unidadesLoading, 
    error: unidadesError 
  } = useUnidadesByIds(unidadesIds, { enabled: unidadesIds.length > 0 })

  // Organizar funcionários por tipo a partir dos dados já disponíveis no contrato
  const funcionariosData = contrato.funcionarios || []
  
  // Separar fiscais e gestores
  const fiscaisFromAPI = funcionariosData.filter(f => f.tipoGerencia === 2 && f.ativo)
  const gestoresFromAPI = funcionariosData.filter(f => f.tipoGerencia === 1 && f.ativo)

  // Helper para obter nome da unidade
  const getUnidadeNome = (unidadeId: string | null | undefined) => {
    if (!unidadeId) return 'Não informado'
    if (unidadesLoading && !unidadesData[unidadeId]) return 'Carregando...'
    return unidadesData?.[unidadeId]?.nome || unidadeId
  }

  // Helper para obter endereco de fornecedor
  const getEnderecoField = (field: keyof Endereco): string => {
    if (typeof contrato.fornecedor.endereco === 'string') return ''
    const endereco = contrato.fornecedor.endereco as Endereco
    return endereco[field] || ''
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

  const shouldShowOriginalDate = (originalDate?: string, currentDate?: string) => {
    if (!isValidOriginalDate(originalDate) || !currentDate) return false
    
    // Extrair apenas ano, mês, dia ignorando timezone para evitar problemas de fuso horário
    const originalObj = new Date(originalDate!)
    const currentObj = new Date(currentDate)
    
    // Para data original (pode ter timezone Z), usar UTC. Para data atual (sem timezone), usar local
    const originalYear = originalDate!.includes('Z') ? originalObj.getUTCFullYear() : originalObj.getFullYear()
    const originalMonth = originalDate!.includes('Z') ? originalObj.getUTCMonth() : originalObj.getMonth()
    const originalDay = originalDate!.includes('Z') ? originalObj.getUTCDate() : originalObj.getDate()
    
    const currentYear = currentObj.getFullYear()
    const currentMonth = currentObj.getMonth()
    const currentDay = currentObj.getDate()
    
    // Comparar ano, mês e dia
    return !(originalYear === currentYear && originalMonth === currentMonth && originalDay === currentDay)
  }

  const shouldShowOriginalValue = (originalValue?: number, currentValue?: number) => {
    return originalValue && currentValue && originalValue !== currentValue
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

  const handleEditarCampo = (grupo: string) => {
    if (isGroupEditing(grupo)) {
      cancelEditing()
    } else {
      startGroupEditing(grupo)
    }
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
                      className={`h-8 w-8 p-0 ${isGroupEditing('dados-basicos') ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : ''}`}
                    >
                      {isGroupEditing('dados-basicos') ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Número do Contrato
                        </p>
                        {isEditing('numeroContrato') ? (
                          <EditableFieldWrapper
                            fieldKey="numeroContrato"
                            value={pendingValue || contrato.numeroContrato}
                            onSave={(value) => handleFieldSave('numeroContrato', value)}
                            onCancel={cancelEditing}
                            isLoading={isLoading}
                          />
                        ) : (
                          <div 
                            className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                            onClick={() => startEditing('numeroContrato')}
                          >
                            {contrato.numeroContrato}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo Rio
                          </p>
                          {isEditing('processoRio') ? (
                            <EditableFieldWrapper
                              fieldKey="processoRio"
                              value={pendingValue || contrato.processoRio || ''}
                              onSave={(value) => handleFieldSave('processoRio', value)}
                              onCancel={cancelEditing}
                              isLoading={isLoading}
                            />
                          ) : (
                            <div 
                              className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                              onClick={() => startEditing('processoRio')}
                            >
                              {contrato.processoRio || 'Não informado'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo SEI
                          </p>
                          {isEditing('processoSei') ? (
                            <EditableFieldWrapper
                              fieldKey="processoSei"
                              value={pendingValue || contrato.processoSei || ''}
                              onSave={(value) => handleFieldSave('processoSei', value)}
                              onCancel={cancelEditing}
                              isLoading={isLoading}
                            />
                          ) : (
                            <div 
                              className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                              onClick={() => startEditing('processoSei')}
                            >
                              {contrato.processoSei || 'Não informado'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Processo Legado
                          </p>
                          {isEditing('processoLegado') ? (
                            <EditableFieldWrapper
                              fieldKey="processoLegado"
                              value={pendingValue || contrato.processoLegado || ''}
                              onSave={(value) => handleFieldSave('processoLegado', value)}
                              onCancel={cancelEditing}
                              isLoading={isLoading}
                            />
                          ) : (
                            <div 
                              className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                              onClick={() => startEditing('processoLegado')}
                            >
                              {contrato.processoLegado || 'Não informado'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-sm">
                        Categoria do Objeto
                      </p>
                      {isEditing('categoriaObjeto') ? (
                        <EditableFieldWrapper
                          fieldKey="categoriaObjeto"
                          value={pendingValue || contrato.categoriaObjeto}
                          onSave={(value) => handleFieldSave('categoriaObjeto', value)}
                          onCancel={cancelEditing}
                          isLoading={isLoading}
                        />
                      ) : (
                        <div 
                          className="font-medium cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                          onClick={() => startEditing('categoriaObjeto')}
                        >
                          {contrato.categoriaObjeto}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Descrição do Objeto
                      </p>
                      {isEditing('objeto') ? (
                        <EditableFieldWrapper
                          fieldKey="objeto"
                          value={pendingValue || contrato.objeto}
                          onSave={(value) => handleFieldSave('objeto', value)}
                          onCancel={cancelEditing}
                          isLoading={isLoading}
                        />
                      ) : (
                        <div 
                          className="font-medium cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                          onClick={() => startEditing('objeto')}
                        >
                          {contrato.objeto}
                        </div>
                      )}
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
                      className={`h-8 w-8 p-0 ${isGroupEditing('vigencia-valores') ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : ''}`}
                    >
                      {isGroupEditing('vigencia-valores') ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Data de Início
                        </p>
                        <div className="space-y-1">
                          {isEditing('dataInicio') ? (
                            <EditableFieldWrapper
                              fieldKey="dataInicio"
                              value={pendingValue || contrato.dataInicio}
                              onSave={(value) => handleFieldSave('dataInicio', value)}
                              onCancel={cancelEditing}
                              isLoading={isLoading}
                            />
                          ) : (
                            <div 
                              className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                              onClick={() => startEditing('dataInicio')}
                            >
                              {formatarData(contrato.dataInicio)}
                            </div>
                          )}
                          {shouldShowOriginalDate(contrato.vigenciaOriginalInicial, contrato.dataInicio) && (
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
                          {isEditing('dataTermino') ? (
                            <EditableFieldWrapper
                              fieldKey="dataTermino"
                              value={pendingValue || contrato.dataTermino}
                              onSave={(value) => handleFieldSave('dataTermino', value)}
                              onCancel={cancelEditing}
                              isLoading={isLoading}
                            />
                          ) : (
                            <div 
                              className="font-semibold cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                              onClick={() => startEditing('dataTermino')}
                            >
                              {formatarData(contrato.dataTermino)}
                            </div>
                          )}
                          {shouldShowOriginalDate(contrato.vigenciaOriginalFinal, contrato.dataTermino) && (
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
                        {isEditing('valorTotal') ? (
                          <EditableFieldWrapper
                            fieldKey="valorTotal"
                            value={pendingValue || contrato.valorTotal}
                            onSave={(value) => handleFieldSave('valorTotal', value)}
                            onCancel={cancelEditing}
                            isLoading={isLoading}
                          />
                        ) : (
                          <div 
                            className="text-2xl font-bold text-green-600 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1"
                            onClick={() => startEditing('valorTotal')}
                          >
                            {formatarMoeda(contrato.valorTotal)}
                          </div>
                        )}
                        {shouldShowOriginalValue(contrato.valorGlobalOriginal, contrato.valorTotal) && (
                          <p className="text-sm text-gray-500">
                            Original: {formatarMoeda(contrato.valorGlobalOriginal!)}
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
                    {fiscaisFromAPI.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum fiscal administrativo designado</p>
                      </div>
                    ) : (
                      fiscaisFromAPI.map((fiscal) => (
                        <FuncionarioCard
                          key={fiscal.id}
                          contratoFuncionario={fiscal}
                          variant="fiscal"
                          isLoading={false}
                        />
                      ))
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
                    {gestoresFromAPI.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum gestor designado</p>
                      </div>
                    ) : (
                      gestoresFromAPI.map((gestor) => (
                        <FuncionarioCard
                          key={gestor.id}
                          contratoFuncionario={gestor}
                          variant="gestor"
                          isLoading={false}
                        />
                      ))
                    )}
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
                    {!!empresaError && (
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
                            {formatarCEP(empresaData?.cep || getEnderecoField('cep'))}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground text-sm">
                            Logradouro
                          </p>
                          <p className="font-semibold">
                            {empresaData?.endereco || getEnderecoField('logradouro')}
                            {getEnderecoField('numero') &&
                              `, ${getEnderecoField('numero')}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Bairro</p>
                          <p className="font-semibold">
                            {empresaData?.bairro || getEnderecoField('bairro')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Cidade</p>
                          <p className="font-semibold">
                            {empresaData?.cidade || getEnderecoField('cidade')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">UF</p>
                          <p className="font-semibold">
                            {empresaData?.estado || getEnderecoField('uf')}
                          </p>
                        </div>
                        {getEnderecoField('complemento') && (
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground text-sm">
                              Complemento
                            </p>
                            <p className="font-semibold">
                              {getEnderecoField('complemento')}
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
                            {getUnidadeNome(contratoComIds.unidadeDemandanteId)}
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
                            {getUnidadeNome(contratoComIds.unidadeGestoraId)}
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
                          const nomeUnidade = getUnidadeNome(unidade.unidadeSaudeId)
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
      
      {/* Modal de confirmação */}
      {modalProps && (
        <ConfirmEditModal
          isOpen={modalProps.isOpen}
          onClose={cancelEditing}
          onConfirm={async () => await confirmSave()}
          fieldLabel={modalProps.fieldLabel}
          oldValue={modalProps.oldValue || ''}
          newValue={modalProps.newValue || ''}
          isLoading={isLoading}
          isCritical={modalProps.isCritical}
          formatValue={(value) => {
            if (modalProps.fieldName === 'valorTotal') {
              return formatarMoeda(value as number)
            }
            if (modalProps.fieldName === 'dataInicio' || modalProps.fieldName === 'dataTermino') {
              return formatarData(value as string)
            }
            return String(value)
          }}
        />
      )}
    </div>
  )
}
