# 📋 Documentação Completa - Sistema de Alterações Contratuais (EGC-174)

## 🎯 Visão Geral

O Sistema de Alterações Contratuais permite modificar contratos existentes através de **11 tipos diferentes de alterações**, organizadas em **5 blocos dinâmicos**. O sistema implementa **validações de limite legal** automáticas e controle de fluxo de aprovação conforme a legislação brasileira.

---

## 🏗️ Arquitetura do Sistema

### **Conceitos Fundamentais**

1. **Alteração Contratual** = Documento que modifica um contrato existente
2. **Tipos de Alteração** = Lista de modificações sendo feitas (pode ser múltipla)
3. **Blocos Dinâmicos** = Grupos de campos que aparecem conforme os tipos selecionados
4. **Limite Legal** = Percentual máximo de alteração permitido por lei (25% ou 50%)
5. **Workflow de Aprovação** = Fluxo: Rascunho → Aprovação → Vigente

---

## 📝 Endpoint Principal

```http
POST /api/alteracoes-contratuais
Content-Type: application/json
```

---

## 🎛️ Tipos de Alteração Disponíveis

### **Enum: TipoAditivo**

```javascript
const TiposAlteracao = {
  Prazo: 1, // Alteração de vigência/prazo
  Valor: 2, // Alteração de valor global
  Qualitativo: 3, // Alteração de especificações
  Quantidade: 4, // Alteração de quantidades
  PrazoEValor: 5, // Combinação prazo + valor
  SubRogacao: 6, // Substituição de fornecedores
  Reajuste: 7, // Aplicação de índices
  Repactuacao: 8, // Recomposição de preços
  Reequilibrio: 9, // Reequilíbrio econômico
  RepactuacaoEReequilibrio: 10, // Combinação
  Rescisao: 11, // Encerramento antecipado
  Supressao: 12, // Redução de quantidades/valores
  Suspensao: 13, // Paralisação temporária
  Outros: 99, // Outros tipos
}
```

---

## 🧩 Blocos Dinâmicos

### **1. 💰 Bloco Valor**

**Obrigatório para**: `Quantidade`, `Valor`, `Supressao`, `Repactuacao`, `Reajuste`, `Reequilibrio`

```json
{
  "valor": {
    "operacao": 0, // 0=Acrescentar, 1=Diminuir, 2=Substituir
    "valorAjuste": 150000.0, // Valor a ser ajustado
    "percentualAjuste": 15.5, // Percentual do ajuste (opcional)
    "novoValorGlobal": 650000.0, // Novo valor total (opcional)
    "observacoes": "Reajuste IPCA 2024"
  }
}
```

### **2. ⏰ Bloco Vigência**

**Obrigatório para**: `Prazo`, `Suspensao`, `Rescisao`

```json
{
  "vigencia": {
    "operacao": 0, // 0=Acrescentar, 1=Diminuir, 2=Substituir
    "valorTempo": 6, // Quantidade de tempo
    "tipoUnidade": 1, // 0=Dias, 1=Meses, 2=Anos
    "novaDataFinal": "2025-06-30", // Nova data final (opcional)
    "observacoes": "Prorrogação necessária"
  }
}
```

### **3. 🏥 Bloco Unidades**

**Obrigatório para**: Quando há alteração de escopo territorial

```json
{
  "unidades": {
    "unidadesVinculadas": [
      "550e8400-e29b-41d4-a716-446655440020",
      "550e8400-e29b-41d4-a716-446655440021"
    ],
    "unidadesDesvinculadas": ["550e8400-e29b-41d4-a716-446655440019"],
    "observacoes": "Inclusão de 2 UBS, exclusão de 1 UPA"
  }
}
```

### **4. 🏢 Bloco Fornecedores**

**Obrigatório para**: `SubRogacao`

```json
{
  "fornecedores": {
    "fornecedoresVinculados": [
      {
        "empresaId": "550e8400-e29b-41d4-a716-446655440030",
        "percentualParticipacao": 60.0,
        "valorAtribuido": 300000.0,
        "observacoes": "Empresa principal"
      }
    ],
    "fornecedoresDesvinculados": ["550e8400-e29b-41d4-a716-446655440025"],
    "observacoes": "Sub-rogação por falência"
  }
}
```

### **5. 📄 Bloco Cláusulas**

**Recomendado para**: `Qualitativo`, alterações complexas

```json
{
  "clausulas": {
    "clausulasIncluidas": "CLÁUSULA X - Novos procedimentos...",
    "clausulasAlteradas": "CLÁUSULA V - Onde se lê... leia-se...",
    "clausulasExcluidas": "CLÁUSULA VIII - Parágrafo único removido"
  }
}
```

---

## ⚖️ Sistema de Limites Legais

### **Regras de Limite**

| Tipo de Alteração                                        | Limite Legal               | Observações                   |
| -------------------------------------------------------- | -------------------------- | ----------------------------- |
| `Quantidade`, `Valor`, `Supressao`                       | **25%**                    | Limite base                   |
| `Qualitativo`, `Reajuste`, `Repactuacao`, `Reequilibrio` | **50%**                    | Limite especial               |
| `Prazo`, `Suspensao`, `Rescisao`                         | **Sem limite**             | Não afeta valor               |
| **Combinações**                                          | **Maior limite aplicável** | Ex: Quantidade+Reajuste = 50% |

### **Cálculo do Percentual**

```
Percentual = (Soma de todas as alterações ativas / Valor original do contrato) × 100
```

---

## 📊 Cenários de Uso Completos

### **Cenário 1: Aumento Simples de Valor (Básico)**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [4],
  "justificativa": "Aumento de 20% no escopo dos serviços conforme necessidade demonstrada no relatório técnico 001/2024.",
  "dataEfeito": "2024-06-01",
  "valor": {
    "operacao": 0,
    "valorAjuste": 100000.0,
    "percentualAjuste": 20.0,
    "observacoes": "Aumento proporcional ao escopo"
  }
}
```

**Response Esperada:**

```json
{
  "alteracao": {
    "id": "uuid-gerado",
    "status": 1,
    "versaoContrato": 2,
    "requerConfirmacaoLimiteLegal": false
  }
}
```

### **Cenário 2: Alteração que Excede Limite Legal**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [4],
  "justificativa": "Expansão significativa do escopo devido a novas demandas.",
  "valor": {
    "operacao": 0,
    "valorAjuste": 200000.0
  }
}
```

**Response com Alerta (HTTP 202):**

```json
{
  "alteracao": {
    "id": "uuid-gerado",
    "requerConfirmacaoLimiteLegal": true,
    "alertaLimiteLegal": "⚠️ ATENÇÃO: Esta alteração (Quantidade) resultará em 40,00% de alteração acumulada, excedendo o limite legal de 25%..."
  },
  "alerta": {
    "tipo": "LIMITE_LEGAL_EXCEDIDO",
    "percentualAcumulado": 40.0,
    "limiteAplicavel": 25.0,
    "requerConfirmacao": true
  }
}
```

### **Cenário 3: Prorrogação de Prazo (Sem Limite)**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [1],
  "justificativa": "Prorrogação de 8 meses para conclusão adequada dos serviços.",
  "vigencia": {
    "operacao": 0,
    "valorTempo": 8,
    "tipoUnidade": 1,
    "novaDataFinal": "2025-09-30",
    "observacoes": "Extensão necessária para qualidade"
  }
}
```

### **Cenário 4: Alteração Qualitativa (Limite 50%)**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [3],
  "justificativa": "Adequação às novas normas ANVISA para sanitização COVID-19.",
  "clausulas": {
    "clausulasIncluidas": "CLÁUSULA X - DOS PROCEDIMENTOS DE SANITIZAÇÃO: A contratada deverá realizar procedimentos específicos de sanitização...",
    "clausulasAlteradas": "CLÁUSULA V - Onde se lê 'limpeza convencional', leia-se 'limpeza e sanitização'",
    "clausulasExcluidas": "CLÁUSULA VIII - Parágrafo sobre procedimentos simplificados"
  }
}
```

### **Cenário 5: Sub-rogação de Fornecedor**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [6],
  "justificativa": "Sub-rogação devido à fusão das empresas ABC Ltda e XYZ S.A.",
  "fornecedores": {
    "fornecedoresVinculados": [
      {
        "empresaId": "novo-fornecedor-id",
        "percentualParticipacao": 100.0,
        "valorAtribuido": 500000.0,
        "observacoes": "Nova razão social pós-fusão"
      }
    ],
    "fornecedoresDesvinculados": ["fornecedor-antigo-id"],
    "observacoes": "Transferência integral devido à fusão empresarial"
  }
}
```

### **Cenário 6: Alteração Complexa (Múltiplos Tipos)**

```json
{
  "contratoId": "ac4f3d02-5ece-497f-b35a-b9e588e50ea7",
  "tiposAlteracao": [4, 2, 1, 3],
  "justificativa": "Alteração abrangente: aumento de 15% no escopo, extensão de prazo e melhoria qualitativa dos serviços para atender expansão da rede.",
  "dataEfeito": "2024-07-01",
  "valor": {
    "operacao": 0,
    "valorAjuste": 75000.0,
    "percentualAjuste": 15.0,
    "novoValorGlobal": 575000.0
  },
  "vigencia": {
    "operacao": 0,
    "valorTempo": 6,
    "tipoUnidade": 1,
    "novaDataFinal": "2025-06-30"
  },
  "unidades": {
    "unidadesVinculadas": ["nova-unidade-1", "nova-unidade-2"],
    "observacoes": "Inclusão de 2 novas UBS"
  },
  "clausulas": {
    "clausulasAlteradas": "CLÁUSULA II - DO OBJETO: Inclusão de novas unidades conforme Anexo I atualizado"
  }
}
```

---

## 🔄 Fluxo de Confirmação para Exceções

### **1. Detectar Alerta de Limite Legal**

Quando o response retorna `requerConfirmacaoLimiteLegal: true`:

### **2. Endpoint de Confirmação**

```http
POST /api/alteracoes-contratuais/{id}/confirmar
Content-Type: application/json
```

**Body obrigatório:**

```json
{
  "confirmacaoTexto": "CONFIRMO CIENTE DOS RISCOS LEGAIS",
  "aceitoRiscosLegais": true,
  "justificativaAdicional": "A alteração é necessária devido ao interesse público emergencial conforme parecer jurídico anexo."
}
```

**⚠️ Validações Rigorosas:**

- `confirmacaoTexto` deve ser **exatamente**: `"CONFIRMO CIENTE DOS RISCOS LEGAIS"`
- `aceitoRiscosLegais` deve ser **obrigatoriamente**: `true`
- `justificativaAdicional` é **opcional** mas recomendada

---

## 📋 Outros Endpoints Importantes

### **Consultar Alterações de um Contrato**

```http
GET /api/alteracoes-contratuais?contratoId={guid}
```

### **Buscar Alteração Específica**

```http
GET /api/alteracoes-contratuais/{id}
```

### **Obter Resumo de Impacto**

```http
GET /api/alteracoes-contratuais/{id}/resumo
```

### **Validar Limite Legal (Preview)**

```http
POST /api/alteracoes-contratuais/validar-limite
```

---

## 🎨 Guidelines de UX/UI

### **1. Seleção de Tipos**

- **Checkbox múltipla** para seleção de tipos
- **Mostrar limites legais** ao lado de cada tipo
- **Destacar visualmente** tipos que permitem 50% vs 25%

### **2. Blocos Dinâmicos**

- **Mostrar/ocultar** blocos baseado nos tipos selecionados
- **Validação em tempo real** de campos obrigatórios
- **Indicadores visuais** de obrigatoriedade

### **3. Alertas de Limite Legal**

- **Modal de confirmação** quando excede limite
- **Visualização do cálculo** (percentual atual vs limite)
- **Texto de confirmação** deve ser digitado pelo usuário
- **Checkbox de aceite** obrigatório

### **4. Estados de Progresso**

```
Rascunho → Aguardando Aprovação → Vigente
    ↓            ↓                    ↓
   [Edit]    [Aprovar/Rejeitar]   [Visualizar]
```

---

## ⚠️ Tratamento de Erros

### **Erro 400 - Validação**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "dto.Valor": ["Bloco Valor é obrigatório para alterações quantitativas"],
    "dto.Justificativa": ["Justificativa deve ter no mínimo 50 caracteres"]
  }
}
```

### **Erro 404 - Contrato não encontrado**

```json
{
  "message": "Contrato não encontrado"
}
```

### **Erro 409 - Conflito de estado**

```json
{
  "message": "Contrato não pode receber alterações devido ao seu status atual"
}
```

---

## 🧪 Casos de Teste Recomendados

### **Teste 1: Alteração Simples**

- Tipo: Quantidade
- Valor: 10% do contrato
- Resultado esperado: Criação sem alerta

### **Teste 2: Excesso de Limite**

- Tipo: Quantidade
- Valor: 30% do contrato
- Resultado esperado: Alerta de limite legal

### **Teste 3: Prazo sem Valor**

- Tipo: Prazo
- Sem bloco valor
- Resultado esperado: Criação sem limite

### **Teste 4: Múltiplos Tipos**

- Tipos: Quantidade + Reajuste
- Limite aplicável: 50% (maior limite)
- Resultado: Validação com limite correto

### **Teste 5: Sub-rogação**

- Tipo: Sub-rogação
- Bloco fornecedores obrigatório
- Resultado: Criação com nova vinculação

---

## 🚀 Implementação Frontend - Checklist

### **✅ Estrutura Base**

- [ ] Formulário multi-step ou accordion
- [ ] Seleção múltipla de tipos
- [ ] Blocos dinâmicos condicionais
- [ ] Campo de justificativa obrigatória

### **✅ Validações**

- [ ] Validação de tipos obrigatórios por bloco
- [ ] Máscaras de valores monetários
- [ ] Calendário para datas
- [ ] Validação de percentuais

### **✅ Limites Legais**

- [ ] Cálculo visual do percentual
- [ ] Modal de confirmação para exceções
- [ ] Input de texto exato para confirmação
- [ ] Checkbox de aceite obrigatório

### **✅ Estados e Feedback**

- [ ] Loading states
- [ ] Mensagens de erro claras
- [ ] Confirmação de sucesso
- [ ] Navegação entre etapas

### **✅ Listagem e Busca**

- [ ] Lista de alterações por contrato
- [ ] Filtros por status e tipo
- [ ] Detalhamento de cada alteração
- [ ] Histórico de mudanças

---

**🎯 Com esta documentação, o frontend terá todas as informações necessárias para implementar o sistema completo de alterações contratuais, incluindo validações, fluxos especiais e casos de uso avançados.**
