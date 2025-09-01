# Como Usar o Serviço de Criação de Contratos

## 📋 Estrutura da API

A API espera o seguinte payload para criação de contratos:

```json
{
  "numeroContrato": "string",
  "processoSei": "string",
  "processoRio": "string", 
  "processoLegado": "string",
  "categoriaObjeto": "string",
  "descricaoObjeto": "string",
  "tipoContratacao": "string",
  "tipoContrato": "string",
  "unidadeDemandanteId": "uuid",
  "unidadeGestoraId": "uuid",
  "contratacao": "string",
  "vigenciaInicial": "2025-01-16T19:13:54.017Z",
  "vigenciaFinal": "1945-09-13T00:55:25.003Z",
  "prazoInicialMeses": 8280,
  "valorGlobal": 7805.663214263896,
  "formaPagamento": "string",
  "tipoTermoReferencia": "string",
  "termoReferencia": "string",
  "vinculacaoPCA": "string",
  "empresaId": "uuid",
  "ativo": false,
  "unidadesVinculadas": [
    {
      "unidadeSaudeId": "uuid",
      "valorAtribuido": 2094.0117994095144,
      "vigenciaInicialUnidade": "2017-11-13T18:42:47.405Z",
      "vigenciaFinalUnidade": "2017-04-17T03:09:13.997Z",
      "observacoes": "string"
    }
  ],
  "funcionarios": [
    {
      "funcionarioId": "uuid",
      "tipoGerencia": 2
    }
  ]
}
```

## 🚀 Como Usar no Componente

### 1. Importar o Hook

```typescript
import { useCriarContrato } from '@/modules/Contratos/hooks/use-contratos-mutations'
import type { CriarContratoPayload } from '@/modules/Contratos/types/contrato'
```

### 2. Usar o Hook

```typescript
const criarContratoMutation = useCriarContrato()

const handleSubmit = async (dadosFormulario: DadosContrato) => {
  try {
    // Mapear dados do formulário para API
    const payload: CriarContratoPayload = {
      numeroContrato: dadosFormulario.numeroContrato,
      processoSei: dadosFormulario.processos.find(p => p.tipo === 'sei')?.valor,
      processoRio: dadosFormulario.processos.find(p => p.tipo === 'rio')?.valor,
      processoLegado: dadosFormulario.processos.find(p => p.tipo === 'fisico')?.valor,
      categoriaObjeto: dadosFormulario.categoriaObjeto,
      descricaoObjeto: dadosFormulario.descricaoObjeto,
      tipoContratacao: dadosFormulario.tipoContratacao,
      tipoContrato: dadosFormulario.tipoContrato,
      unidadeDemandanteId: dadosFormulario.unidadeDemandanteId || '',
      unidadeGestoraId: dadosFormulario.unidadeGestoraId || '',
      contratacao: dadosFormulario.contratacao,
      vigenciaInicial: dadosFormulario.vigenciaInicial,
      vigenciaFinal: dadosFormulario.vigenciaFinal,
      prazoInicialMeses: 0, // Será calculado automaticamente
      valorGlobal: parseFloat(dadosFormulario.valorGlobal.replace(/[^\d,]/g, '').replace(',', '.')),
      formaPagamento: dadosFormulario.formaPagamento,
      tipoTermoReferencia: dadosFormulario.tipoTermoReferencia,
      termoReferencia: dadosFormulario.termoReferencia,
      vinculacaoPCA: dadosFormulario.vinculacaoPCA,
      empresaId: 'uuid-da-empresa', // Preencher com ID real
      ativo: true,
      unidadesVinculadas: [], // Preencher com unidades selecionadas
      funcionarios: [] // Preencher com funcionários atribuídos
    }

    // Criar contrato
    await criarContratoMutation.mutateAsync(payload)
    
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
  }
}
```

## 🔧 Funcionalidades Automáticas

### Conversão de Datas
- O serviço converte automaticamente datas do formato `YYYY-MM-DD` para ISO string
- Exemplo: `"2025-01-16"` → `"2025-01-16T00:00:00.000Z"`

### Cálculo de Prazo
- O prazo em meses é calculado automaticamente entre vigência inicial e final
- Fórmula: `Math.ceil(diferencaDias / 30)`

### Conversão de Valores
- Valores em formato brasileiro (`R$ 1.234,56`) são convertidos para número
- Exemplo: `"R$ 1.234,56"` → `1234.56`

### Mapeamento de Funcionários
- `tipoGerencia: 1` = Fiscal
- `tipoGerencia: 2` = Gestor

## 📝 Exemplo Completo

```typescript
// Componente de criação de contrato
export default function CriarContrato() {
  const criarContratoMutation = useCriarContrato()
  
  const handleSubmit = async (dados: DadosContrato) => {
    const payload: CriarContratoPayload = {
      numeroContrato: dados.numeroContrato,
      processoSei: dados.processos.find(p => p.tipo === 'sei')?.valor,
      processoRio: dados.processos.find(p => p.tipo === 'rio')?.valor,
      processoLegado: dados.processos.find(p => p.tipo === 'fisico')?.valor,
      categoriaObjeto: dados.categoriaObjeto,
      descricaoObjeto: dados.descricaoObjeto,
      tipoContratacao: dados.tipoContratacao,
      tipoContrato: dados.tipoContrato,
      unidadeDemandanteId: dados.unidadeDemandanteId || '',
      unidadeGestoraId: dados.unidadeGestoraId || '',
      contratacao: dados.contratacao,
      vigenciaInicial: dados.vigenciaInicial,
      vigenciaFinal: dados.vigenciaFinal,
      prazoInicialMeses: 0, // Calculado automaticamente
      valorGlobal: parseFloat(dados.valorGlobal.replace(/[^\d,]/g, '').replace(',', '.')),
      formaPagamento: dados.formaPagamento,
      tipoTermoReferencia: dados.tipoTermoReferencia,
      termoReferencia: dados.termoReferencia,
      vinculacaoPCA: dados.vinculacaoPCA,
      empresaId: 'uuid-da-empresa',
      ativo: true,
      unidadesVinculadas: [],
      funcionarios: []
    }

    try {
      await criarContratoMutation.mutateAsync(payload)
      // Sucesso será tratado pelo hook (toast + redirecionamento)
    } catch (error) {
      // Erro será tratado pelo hook (toast de erro)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <button type="submit" disabled={criarContratoMutation.isPending}>
        {criarContratoMutation.isPending ? 'Criando...' : 'Criar Contrato'}
      </button>
    </form>
  )
}
```

## 🎯 Benefícios

- ✅ **Tipagem forte**: TypeScript garante estrutura correta
- ✅ **Conversões automáticas**: Datas e valores são convertidos automaticamente
- ✅ **Cálculos automáticos**: Prazo é calculado automaticamente
- ✅ **Tratamento de erros**: Toast e redirecionamento automáticos
- ✅ **Cache invalidation**: Queries são atualizadas automaticamente
- ✅ **Logs de debug**: Console logs para facilitar debugging

