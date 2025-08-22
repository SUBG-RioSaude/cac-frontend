/**
 * Exemplos de uso dos hooks de contratos com React Query
 * Este arquivo demonstra as melhores práticas de implementação
 */

import React, { useState } from 'react'
import { useContratos, useCreateContrato, useUpdateContrato, useDeleteContrato, useToast } from '../hooks'
import type { ContratoParametros } from '../services/contratos-service'

// Exemplo 1: Lista de contratos com filtros
function ContratosListExample() {
  const [filtros, setFiltros] = useState<ContratoParametros>({
    pagina: 1,
    tamanhoPagina: 20
  })

  const { 
    data, 
    isLoading, 
    error, 
    isFetching, 
    refetch 
  } = useContratos(filtros, {
    keepPreviousData: true, // Mantém dados anteriores durante paginação
    refetchOnMount: true
  })

  if (isLoading) return <div>Carregando contratos...</div>
  if (error) return <div>Erro ao carregar contratos</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Contratos ({data?.totalRegistros})</h2>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isFetching ? 'Recarregando...' : 'Atualizar'}
        </button>
      </div>

      <div className="grid gap-4">
        {data?.dados.map(contrato => (
          <div key={contrato.id} className="border p-4 rounded">
            <h3>{contrato.numeroContrato}</h3>
            <p>{contrato.descricaoObjeto}</p>
            <p>Valor: R$ {contrato.valorGlobal.toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-between mt-4">
        <button 
          onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina! - 1 }))}
          disabled={filtros.pagina === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Anterior
        </button>
        <span>Página {filtros.pagina} de {data?.totalPaginas}</span>
        <button 
          onClick={() => setFiltros(prev => ({ ...prev, pagina: prev.pagina! + 1 }))}
          disabled={!data?.temProximaPagina}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}

// Exemplo 2: Formulário de criação de contrato
function CreateContratoExample() {
  const [formData, setFormData] = useState({
    numeroContrato: '',
    descricaoObjeto: '',
    valorGlobal: 0,
    vigenciaInicial: '',
    vigenciaFinal: '',
    prazoInicialMeses: 12,
    empresaId: '',
    ativo: true
  })

  const createMutation = useCreateContrato()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.numeroContrato || !formData.empresaId) {
      alert('Preencha os campos obrigatórios')
      return
    }

    // Executar mutation - toast e redirecionamento são automáticos
    createMutation.mutate({
      ...formData,
      vigenciaInicial: new Date(formData.vigenciaInicial).toISOString(),
      vigenciaFinal: new Date(formData.vigenciaFinal).toISOString()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Criar Novo Contrato</h2>
      
      <input
        type="text"
        placeholder="Número do Contrato *"
        value={formData.numeroContrato}
        onChange={(e) => setFormData(prev => ({ ...prev, numeroContrato: e.target.value }))}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Descrição do Objeto"
        value={formData.descricaoObjeto}
        onChange={(e) => setFormData(prev => ({ ...prev, descricaoObjeto: e.target.value }))}
        className="w-full border p-2 rounded"
        rows={3}
      />

      <input
        type="number"
        placeholder="Valor Global *"
        value={formData.valorGlobal || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, valorGlobal: Number(e.target.value) }))}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="date"
        value={formData.vigenciaInicial}
        onChange={(e) => setFormData(prev => ({ ...prev, vigenciaInicial: e.target.value }))}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="date"
        value={formData.vigenciaFinal}
        onChange={(e) => setFormData(prev => ({ ...prev, vigenciaFinal: e.target.value }))}
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="ID da Empresa *"
        value={formData.empresaId}
        onChange={(e) => setFormData(prev => ({ ...prev, empresaId: e.target.value }))}
        className="w-full border p-2 rounded"
        required
      />

      <button 
        type="submit" 
        disabled={createMutation.isPending}
        className="w-full bg-green-500 text-white p-2 rounded disabled:bg-gray-300"
      >
        {createMutation.isPending ? 'Criando...' : 'Criar Contrato'}
      </button>

      {createMutation.isError && (
        <div className="text-red-500 text-sm">
          Erro ao criar contrato. Verifique os dados e tente novamente.
        </div>
      )}
    </form>
  )
}

// Exemplo 3: Ações do contrato (atualizar, deletar, suspender)
function ContratoActionsExample({ contratoId }: { contratoId: string }) {
  const updateMutation = useUpdateContrato()
  const deleteMutation = useDeleteContrato()
  const { success } = useToast()

  const handleUpdate = () => {
    updateMutation.mutate({
      id: contratoId,
      // Apenas os campos que mudaram
      descricaoObjeto: 'Objeto atualizado',
      valorGlobal: 50000
    })
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja remover este contrato?')) {
      deleteMutation.mutate(contratoId)
    }
  }

  const handleCustomAction = () => {
    // Exemplo de toast manual para ações customizadas
    success('Ação personalizada executada com sucesso!')
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleUpdate}
        disabled={updateMutation.isPending}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        {updateMutation.isPending ? 'Atualizando...' : 'Atualizar'}
      </button>

      <button 
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
      >
        {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
      </button>

      <button 
        onClick={handleCustomAction}
        className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
      >
        Ação Customizada
      </button>
    </div>
  )
}

// Exemplo 4: Como usar os hooks em diferentes cenários
function DifferentScenariosExample() {
  // Cenário 1: Lista sem cache (sempre fresh data)
  const freshContratos = useContratos({}, {
    refetchOnMount: true,
    enabled: true
  })

  // Cenário 2: Lista condicional (carrega apenas quando necessário)
  const [shouldLoadContratos, setShouldLoadContratos] = useState(false)
  const conditionalContratos = useContratos({}, {
    enabled: shouldLoadContratos
  })

  // Cenário 3: Lista com filtros complexos
  const filteredContratos = useContratos({
    filtroStatus: 'ativo',
    valorMinimo: 10000,
    dataInicialDe: '2024-01-01',
    termoPesquisa: 'equipamentos'
  })

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold">Contratos Fresh (sem cache)</h3>
        <p>Status: {freshContratos.isLoading ? 'Carregando...' : 'Pronto'}</p>
      </section>

      <section>
        <h3 className="font-bold">Contratos Condicionais</h3>
        <button 
          onClick={() => setShouldLoadContratos(!shouldLoadContratos)}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          {shouldLoadContratos ? 'Parar' : 'Carregar'} Contratos
        </button>
        <p>Status: {conditionalContratos.isLoading ? 'Carregando...' : 'Pronto'}</p>
      </section>

      <section>
        <h3 className="font-bold">Contratos Filtrados</h3>
        <p>Total encontrado: {filteredContratos.data?.totalRegistros || 0}</p>
      </section>
    </div>
  )
}

export {
  ContratosListExample,
  CreateContratoExample, 
  ContratoActionsExample,
  DifferentScenariosExample
}