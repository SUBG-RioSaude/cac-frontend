{
"info": {
"\_postman_id": "041f14a8-b2dd-476a-b00a-9e3f8205bdf2",
"name": "EGESTÃO Contratos API - EGC-174 Implementado",
"description": "# 🎯 EGESTÃO - Sistema de Alterações Contratuais (EGC-174)\n\n## 📋 **FUNCIONALIDADES IMPLEMENTADAS**\n\nEsta collection documenta a implementação completa da **EGC-174**: Sistema de Registro de Alteração Contratual.\n\n### ✅ **11 TIPOS DE ALTERAÇÃO** (conforme especificação)\n1. **Aditivo - Prazo**: Altera vigência do contrato\n2. **Aditivo - Qualitativo**: Características/especificações \n3. **Aditivo - Quantidade**: Quantidades de itens/serviços\n4. **Apostilamento**: Registro administrativo\n5. **Reajuste**: Índices inflacionários\n6. **Reequilíbrio**: Equilíbrio econômico-financeiro\n7. **Repactuação**: Recomposição de preços\n8. **Rescisão**: Encerramento antecipado\n9. **Sub-rogação**: Substituição de partes\n10. **Supressão**: Redução de quantidades/valores\n11. **Suspensão**: Paralisação temporária\n\n### 🧩 **5 BLOCOS DINÂMICOS**\n- **📄 Cláusulas**: Excluídas, incluídas, alteradas\n- **⏰ Vigência**: Acrescentar/diminuir/suspender tempo\n- **💰 Valor**: Acrescentar/diminuir valores/percentuais\n- **🏢 Fornecedores**: Vincular/desvincular/sub-rogar\n- **🏥 Unidades**: Vincular/desvincular unidades de saúde\n\n### ⚠️ **VALIDAÇÕES E ALERTAS**\n- ✅ **Justificativa OBRIGATÓRIA** sempre\n- ✅ **Obrigatoriedades condicionais** por tipo\n- ✅ **Alertas de limite legal** (25%/50%)\n- ✅ **Confirmação obrigatória** para limites excedidos\n- ✅ **Resumo antes/depois** para validação\n\n---\n\n## 🚀 **COMO USAR ESTA COLLECTION**\n\n### 1️⃣ **CASOS DE TESTE BÁSICOS**\n- Execute os cenários na pasta **\"Casos de Teste\"**\n- Cada cenário demonstra um tipo específico de alteração\n\n### 2️⃣ **FLUXO COMPLETO**\n1. Liste tipos disponíveis → `GET /tipos`\n2. Crie alteração → `POST /alteracoes-contratuais` \n3. Confirme alertas → `POST /{id}/confirmar` (se necessário)\n4. Envie para aprovação → `PATCH /{id}/enviar-para-aprovacao`\n5. Aprove → `PATCH /{id}/aprovar`\n\n### 3️⃣ **VALIDAÇÕES**\n- Teste limite legal → `POST /alteracoes-contratuais` (com validação automática)\n- Veja resumo impacto → `GET /alteracoes-contratuais/{id}/resumo`\n\n---\n\n## 📊 **VARIÁVEIS DE AMBIENTE**\nConfigure as seguintes variáveis:\n- `base_url`: http://localhost:7006\n- `contrato_id`: ID de um contrato existente\n- `usuario_id`: ID do usuário logado\n\n---\n\n*💡 **Dica**: Use os exemplos de cada pasta para entender melhor cada funcionalidade.*",
"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
"\_exporter_id": "42432115",
"\_collection_link": "https://subg33.postman.co/workspace/EGESTAO-Development-Team~90477acb-79b6-4626-845f-d1b239133c8b/collection/42497953-041f14a8-b2dd-476a-b00a-9e3f8205bdf2?action=share&source=collection_link&creator=42432115"
},
"item": [
{
"name": "🔄 Tipos de Alteração",
"item": [
{
"name": "Listar Tipos de Alteração",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/tipos",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"tipos"
]
},
"description": "# 📋 Listar Tipos de Alteração Contratual\n\n## **Descrição**\nRetorna os **11 tipos de alteração** implementados conforme EGC-174, com suas especificações de blocos obrigatórios e opcionais.\n\n## **Tipos Implementados**\n\n### **Alterações que requerem VALOR obrigatório:**\n- ✅ Aditivo - Quantidade\n- ✅ Supressão \n- ✅ Repactuação\n- ✅ Reajuste\n- ✅ Reequilíbrio\n\n### **Alterações que requerem VIGÊNCIA obrigatória:**\n- ✅ Aditivo - Prazo\n- ✅ Suspensão\n- ✅ Rescisão\n\n### **Alterações que requerem FORNECEDORES obrigatório:**\n- ✅ Sub-rogação\n\n### **Alterações flexíveis:**\n- ✅ Aditivo - Qualitativo\n- ✅ Apostilamento\n\n## **Response Exemplo**\n`json\n[\n  {\n    \"id\": 1,\n    \"nome\": \"Aditivo - Prazo\",\n    \"descricao\": \"Altera vigência do contrato\",\n    \"blocosObrigatorios\": [\"Vigencia\"],\n    \"blocosOpcionais\": [\"Clausulas\", \"Valor\"]\n  }\n]\n`"
},
"response": []
}
],
"description": "Endpoints relacionados aos tipos de alteração contratual disponíveis."
},
{
"name": "📋 Alterações Contratuais",
"item": [
{
"name": "Listar Alterações (Paginado)",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais?pagina=1&tamanhoPagina=20&contratoId={{contrato_id}}",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
],
"query": [
{
"key": "pagina",
"value": "1"
},
{
"key": "tamanhoPagina",
"value": "20"
},
{
"key": "contratoId",
"value": "{{contrato_id}}"
},
{
"key": "status",
"value": "1",
"description": "StatusAditivo: 1=Rascunho, 2=AguardandoAprovacao, 3=Vigente, 4=Rejeitado",
"disabled": true
},
{
"key": "termo",
"value": "reajuste",
"description": "Busca textual na justificativa",
"disabled": true
}
]
},
"description": "# 🔍 Listar Alterações Contratuais\n\n## **Funcionalidades**\n- ✅ **Paginação** automática\n- ✅ **Filtros** por contrato, status, tipo, datas\n- ✅ **Busca textual** na justificativa\n- ✅ **Resumo** dos blocos ativados\n\n## **Filtros Disponíveis**\n- `contratoId`: Filtrar por contrato específico\n- `status`: 1=Rascunho, 2=Aguardando, 3=Vigente, 4=Rejeitado\n- `tiposAlteracao[]`: Múltiplos tipos (ex: 1,4,7)\n- `dataEfeitoInicial/Final`: Período de efeito\n- `termo`: Busca na justificativa\n\n## **Response Resumido**\n`json\n{\n  \"itens\": [{\n    \"id\": \"guid\",\n    \"tiposAlteracao\": [1, 7],\n    \"justificativa\": \"Reajuste IPCA...\",\n    \"status\": 1,\n    \"blocosAtivados\": [\"Valor\"],\n    \"requerConfirmacaoLimiteLegal\": true\n  }],\n  \"paginaAtual\": 1,\n  \"totalItens\": 25,\n  \"totalPaginas\": 3\n}\n`"
},
"response": []
},
{
"name": "Obter por ID",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}"
]
},
"description": "# 🔎 Obter Alteração Contratual por ID\n\n## **Descrição**\nRetorna **todos os detalhes** de uma alteração contratual específica, incluindo:\n\n- ✅ **Dados básicos**: ID, tipos, justificativa, status\n- ✅ **Blocos dinâmicos**: Todos os 5 blocos com detalhes\n- ✅ **Histórico**: Estados anterior e posterior (JSON)\n- ✅ **Alertas**: Limites legais, confirmações necessárias\n- ✅ **Auditoria**: Quem criou, quando, versão\n\n## **Response Completo**\n`json\n{\n  \"id\": \"guid\",\n  \"contratoId\": \"guid\",\n  \"tiposAlteracao\": [7], // Reajuste\n  \"justificativa\": \"Aplicação do IPCA...\",\n  \"versaoContrato\": 2,\n  \"status\": 1,\n  \"dataEfeito\": \"2024-01-01\",\n  \n  // Blocos dinâmicos\n  \"valor\": {\n    \"operacao\": 1, // Acrescentar\n    \"percentualAjuste\": 5.2,\n    \"valorCalculadoAutomaticamente\": true\n  },\n  \n  // Alertas e validações\n  \"requerConfirmacaoLimiteLegal\": false,\n  \"alertaLimiteLegal\": null,\n  \n  // Propriedades calculadas\n  \"resumoAlteracao\": \"Tipos: Reajuste | Blocos: Valor: Acrescentar 5.2%\",\n  \"podeSerEditada\": true\n}\n`"
},
"response": []
},
{
"name": "Criar Alteração Contratual",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [7], // Reajuste\n \"justificativa\": \"Aplicação do reajuste IPCA conforme cláusula 15.1 do contrato, referente ao período de 12 meses encerrado em dezembro de 2023.\",\n \"dataEfeito\": \"2024-01-01\",\n \n // Bloco Valor (obrigatório para Reajuste)\n \"valor\": {\n \"operacao\": 1, // OperacaoValor.Acrescentar\n \"percentualAjuste\": 5.2,\n \"valorCalculadoAutomaticamente\": true,\n \"observacoes\": \"Índice IPCA oficial: 5,19% - Arredondado: 5,2%\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# ➕ Criar Alteração Contratual\n\n## **Funcionalidades Implementadas**\n\n### ✅ **Justificativa OBRIGATÓRIA** \nSempre necessária, mínimo 10 caracteres conforme EGC-174.\n\n### ✅ **Tipos Múltiplos**\nPermite selecionar vários tipos simultaneamente:\n`json\n\"tiposAlteracao\": [1, 7] // Prazo + Reajuste\n`\n\n### ✅ **Blocos Dinâmicos**\nApenas os blocos necessários são preenchidos:\n\n**Bloco Valor** (para Reajuste, Quantidade, etc.):\n`json\n\"valor\": {\n  \"operacao\": 1, // Acrescentar/Diminuir\n  \"percentualAjuste\": 5.2,\n  \"valorAjuste\": 50000.00,\n  \"observacoes\": \"IPCA acumulado\"\n}\n`\n\n**Bloco Vigência** (para Prazo, Suspensão, etc.):\n`json\n\"vigencia\": {\n  \"operacao\": 1, // Acrescentar\n  \"tipoUnidade\": 2, // Meses\n  \"valorTempo\": 12,\n  \"observacoes\": \"Prorrogação extraordinária\"\n}\n`\n\n### ✅ **Validações Automáticas**\n- **Obrigatoriedades condicionais** por tipo\n- **Conflitos** (ex: mesmo fornecedor vinculado/desvinculado)\n- **Limites legais** (25%/50%)\n\n### ✅ **Respostas com Alertas**\n- **HTTP 201**: Criado com sucesso\n- **HTTP 202**: Criado COM alerta de limite legal\n- **HTTP 400**: Erro de validação\n\n## **Exemplo de Resposta com Alerta**\n`json\n{\n  \"alteracao\": { /* dados completos */ },\n  \"alerta\": {\n    \"tipo\": \"LIMITE_LEGAL_EXCEDIDO\",\n    \"mensagem\": \"⚠️ ATENÇÃO: Esta alteração...\",\n    \"percentualAcumulado\": 35.5,\n    \"limiteAplicavel\": 25,\n    \"requerConfirmacao\": true\n  }\n}\n`"
},
"response": []
},
{
"name": "Obter Resumo Antes/Depois",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}/resumo",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}",
"resumo"
]
},
"description": "# 📊 Resumo Antes/Depois da Alteração\n\n## **Descrição**\nGera um **resumo detalhado** do impacto da alteração no contrato, mostrando estado **ANTES** e **DEPOIS** para validação do usuário.\n\n## **Informações Calculadas**\n- ✅ **Valores**: Original → Final (com delta)\n- ✅ **Vigência**: Original → Final (dias adicionados)\n- ✅ **Percentuais**: Impacto acumulado\n- ✅ **Totais**: Dias totais, valor total\n\n## **Response Exemplo**\n`json\n{\n  \"valorOriginal\": 1000000.00,\n  \"valorAlteracao\": 52000.00,\n  \"valorFinal\": 1052000.00,\n  \"percentualAlteracao\": 5.2,\n  \n  \"vigenciaOriginal\": \"2024-12-31\",\n  \"vigenciaFinal\": \"2025-12-31\",\n  \"diasAdicionados\": 365,\n  \"diasTotais\": 730\n}\n`\n\n## **Uso Recomendado**\n1. **Após criar** alteração\n2. **Antes de confirmar** com alerta legal\n3. **Antes de enviar** para aprovação\n\n> 💡 **Dica**: Use este endpoint para mostrar ao usuário exatamente o que vai mudar no contrato antes da confirmação final."
},
"response": []
},
{
"name": "Confirmar com Alerta Legal",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"confirmacaoTexto\": \"CONFIRMADO\",\n \"aceitoRiscosLegais\": true,\n \"justificativaAdicional\": \"Alteração necessária devido a mudanças na legislação tributária. Valor foi previamente aprovado pela diretoria em reunião de 15/01/2024.\"\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}/confirmar",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}",
"confirmar"
]
},
"description": "# ✅ Confirmar Alteração com Alerta de Limite Legal\n\n## **Quando Usar**\nEste endpoint é **obrigatório** quando:\n- ✅ Alteração excede **25% ou 50%** do valor original\n- ✅ `requerConfirmacaoLimiteLegal = true`\n- ✅ Sistema gera alerta automático\n\n## **Fluxo Completo**\n1. 🔄 Criar alteração → **HTTP 202** (com alerta)\n2. 📊 Ver resumo → `GET /{id}/resumo`\n3. ✅ **Confirmar** → `POST /{id}/confirmar`\n4. 📤 Enviar aprovação → `PATCH /{id}/enviar-para-aprovacao`\n\n## **Validações**\n- ✅ `aceitoRiscosLegais` deve ser **true**\n- ✅ Alteração deve estar com alerta pendente\n- ✅ Justificativa adicional recomendada\n\n## **Campos Obrigatórios**\n`json\n{\n  \"aceitoRiscosLegais\": true // OBRIGATÓRIO\n}\n`\n\n## **Campos Opcionais**\n`json\n{\n  \"confirmacaoTexto\": \"CONFIRMADO\",\n  \"justificativaAdicional\": \"Motivo adicional...\"\n}\n`\n\n## **Mensagem de Alerta Típica**\n> ⚠️ **ATENÇÃO**: Esta alteração (Quantidade) resultará em 35,2% de alteração acumulada, excedendo o limite legal de 25%. Alterações quantitativas estão sujeitas a limites legais (ex.: 25%/50%). Revise a conformidade e fundamentos legais antes de confirmar.\n\n## **Response**\nRetorna a alteração atualizada com:\n- ✅ `requerConfirmacaoLimiteLegal = false`\n- ✅ Status permanece **Rascunho**\n- ✅ Histórico da confirmação salvo\n- ✅ Pronta para envio à aprovação"
},
"response": []
},
{
"name": "Enviar para Aprovação",
"request": {
"method": "PATCH",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}/enviar-para-aprovacao",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}",
"enviar-para-aprovacao"
]
},
"description": "# 📤 Enviar para Aprovação\n\n## **Pré-requisitos**\n- ✅ Status = **Rascunho**\n- ✅ **Sem alertas** pendentes de confirmação\n- ✅ Todos blocos obrigatórios preenchidos\n- ✅ Justificativa válida\n\n## **Validações Automáticas**\nO sistema verifica:\n- 🔍 **Consistência** dos dados\n- 🔍 **Obrigatoriedades** por tipo\n- 🔍 **Conflitos** nos blocos\n- 🔍 **Limites** confirmados\n\n## **Após o Envio**\n- Status: **Rascunho** → **AguardandoAprovacao**\n- Alteração **não pode mais** ser editada\n- Disponível para aprovadores\n- Auditoria registrada\n\n## **Response**\nRetorna alteração com:\n`json\n{\n  \"id\": \"guid\",\n  \"status\": 2, // AguardandoAprovacao\n  \"podeSerEditada\": false,\n  \"dataAtualizacao\": \"2024-01-15T10:30:00Z\"\n}\n`"
},
"response": []
},
{
"name": "Aprovar",
"request": {
"method": "PATCH",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"dataAssinatura\": \"2024-01-15\",\n \"observacoes\": \"Aprovado após análise jurídica. Conforme parecer 2024/001.\"\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}/aprovar",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}",
"aprovar"
]
},
"description": "# ✅ Aprovar Alteração Contratual\n\n## **Pré-requisitos**\n- ✅ Status = **AguardandoAprovacao** \n- ✅ Usuário com **perfil aprovador**\n- ✅ Alteração válida e consistente\n\n## **Campos Opcionais**\n`json\n{\n  \"dataAssinatura\": \"2024-01-15\", // Padrão: hoje\n  \"observacoes\": \"Parecer jurídico favorável\"\n}\n`\n\n## **Após Aprovação**\n- Status: **AguardandoAprovacao** → **Vigente**\n- `dataAssinatura` registrada\n- **Snapshot** do estado posterior salvo\n- Alteração **torna-se efetiva**\n- Não pode mais ser editada/rejeitada\n\n## **Histórico Completo**\nO sistema salva automaticamente:\n`json\n{\n  \"estadoAnteriorJson\": \"{ valorGlobal: 1000000, vigenciaFinal: '2024-12-31' }\",\n  \"estadoPosteriorJson\": \"{ valorGlobal: 1052000, vigenciaFinal: '2025-12-31', aprovadoPor: 'guid' }\"\n}\n`\n\n## **Response**\n`json\n{\n  \"id\": \"guid\",\n  \"status\": 3, // Vigente\n  \"dataAssinatura\": \"2024-01-15\",\n  \"podeSerEditada\": false\n}\n`"
},
"response": []
},
{
"name": "Rejeitar",
"request": {
"method": "PATCH",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"motivo\": \"Documentação insuficiente. Necessário parecer técnico sobre a viabilidade orçamentária e jurídica da alteração proposta.\"\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/{{alteracao_id}}/rejeitar",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"{{alteracao_id}}",
"rejeitar"
]
},
"description": "# ❌ Rejeitar Alteração Contratual\n\n## **Pré-requisitos**\n- ✅ Status = **AguardandoAprovacao**\n- ✅ Usuário com **perfil aprovador**\n- ✅ **Motivo obrigatório** da rejeição\n\n## **Campos Obrigatórios**\n`json\n{\n  \"motivo\": \"Justificativa detalhada da rejeição\" // OBRIGATÓRIO\n}\n`\n\n## **Após Rejeição**\n- Status: **AguardandoAprovacao** → **Rejeitado**\n- Motivo **anexado à justificativa** original\n- Alteração **não pode ser editada**\n- Criador precisa fazer **nova alteração**\n\n## **Justificativa Final**\nO sistema concatena:\n`\n\"REJEITADO: [motivo]. [justificativa original]\"\n`\n\n## **Response**\n`json\n{\n  \"id\": \"guid\",\n  \"status\": 4, // Rejeitado\n  \"justificativa\": \"REJEITADO: Documentação insuficiente... [justificativa original]\",\n  \"podeSerEditada\": false\n}\n`"
},
"response": []
}
],
"description": "Endpoints principais para gerenciamento completo de alterações contratuais."
},
{
"name": "🧪 Casos de Teste",
"item": [
{
"name": "Caso 1 - Aditivo Prazo (Vigência Obrigatória)",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [1], // Aditivo - Prazo\n \"justificativa\": \"Prorrogação necessária devido ao atraso na entrega dos equipamentos pelo fornecedor. Novo prazo acordado conforme termo de ajustamento assinado em 10/01/2024.\",\n \"dataEfeito\": \"2024-02-01\",\n \n // Bloco Vigência OBRIGATÓRIO para Aditivo - Prazo\n \"vigencia\": {\n \"operacao\": 1, // OperacaoVigencia.Acrescentar\n \"tipoUnidade\": 2, // TipoUnidadeTempo.Meses\n \"valorTempo\": 6,\n \"observacoes\": \"Prorrogação de 6 meses conforme cronograma revisado\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 1: Aditivo de Prazo\n\n## **Cenário**\nAditivo que **apenas altera a vigência** do contrato, prorrogando por 6 meses.\n\n## **Regras Testadas**\n- ✅ **Bloco Vigência obrigatório** para tipo Prazo\n- ✅ **Justificativa obrigatória** sempre \n- ✅ **Operações de vigência** funcionando\n- ✅ **Cálculo automático** da nova data\n\n## **Bloco Vigência**\n`json\n{\n  \"operacao\": 1, // Acrescentar\n  \"tipoUnidade\": 2, // Meses  \n  \"valorTempo\": 6,\n  \"observacoes\": \"Motivo da prorrogação\"\n}\n`\n\n## **Validações**\n- Se remover o bloco `vigencia` → **Erro 400**\n- Se `tiposAlteracao = [1]` sem vigência → **Erro**\n- Justificativa vazia → **Erro 400**\n\n## **Resultado Esperado**\n- Status: **201 Created** \n- Nova vigência calculada automaticamente\n- Apenas bloco Vigência ativo"
},
"response": []
},
{
"name": "Caso 2 - Aditivo Valor (Valor Obrigatório)",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [4], // Aditivo - Quantidade\n \"justificativa\": \"Acréscimo de 15% nas quantidades de medicamentos conforme demanda adicional identificada nas unidades de saúde da região sul. Aprovado pela coordenação médica em reunião de 12/01/2024.\",\n \"dataEfeito\": \"2024-02-01\",\n \n // Bloco Valor OBRIGATÓRIO para Quantidade\n \"valor\": {\n \"operacao\": 1, // OperacaoValor.Acrescentar\n \"percentualAjuste\": 15.0,\n \"valorCalculadoAutomaticamente\": true,\n \"observacoes\": \"Baseado no aumento da demanda: 15% mais medicamentos\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 2: Aditivo de Quantidade\n\n## **Cenário**\n\nAditivo que **aumenta em 15%** as quantidades do contrato.\n\n## **Regras Testadas**\n\n- ✅ **Bloco Valor obrigatório** para Quantidade\n \n- ✅ **Alerta de limite legal** se > 25%\n \n- ✅ **Cálculo automático** do novo valor\n \n- ✅ **Warning** para alterações quantitativas\n \n\n## **Bloco Valor**\n\n`json\n{\n  \"operacao\": 1, // Acrescentar\n  \"percentualAjuste\": 15.0,\n  \"valorCalculadoAutomaticamente\": true\n}\n\n`\n\n## **Possíveis Respostas**\n\n### **Se < 25%: HTTP 201**\n\n`json\n{\n  \"id\": \"guid\",\n  \"requerConfirmacaoLimiteLegal\": false\n}\n\n`\n\n### **Se > 25%: HTTP 202**\n\n`json\n{\n  \"alteracao\": { /* dados */ },\n  \"alerta\": {\n    \"tipo\": \"LIMITE_LEGAL_EXCEDIDO\",\n    \"percentualAcumulado\": 35.0,\n    \"requerConfirmacao\": true\n  }\n}\n\n`\n\n## **Próximos Passos**\n\nSe receber **202**, usar:\n\n- `GET /{id}/resumo` → Ver impacto\n \n- `POST /{id}/confirmar` → Confirmar alerta"
},
"response": []
},
{
"name": "Caso 3 - Sub-rogação (Fornecedores Obrigatório)",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [6], // Sub-rogação\n \"justificativa\": \"Substituição da empresa contratada original por nova empresa devido à incorporação empresarial. Empresa NOVA S.A. assumirá todas as obrigações contratuais da empresa ANTIGA LTDA conforme escritura pública de incorporação registrada em 05/01/2024.\",\n \"dataEfeito\": \"2024-03-01\",\n \n // Bloco Fornecedores OBRIGATÓRIO para Sub-rogação\n \"fornecedores\": {\n \"fornecedoresDesvinculados\": [\"550e8400-e29b-41d4-a716-446655440001\"], // Empresa antiga\n \"fornecedoresVinculados\": [\"550e8400-e29b-41d4-a716-446655440002\"], // Empresa nova\n \"novoFornecedorPrincipal\": \"550e8400-e29b-41d4-a716-446655440002\",\n \"observacoes\": \"Incorporação empresarial - Nova empresa assume todas as obrigações\"\n },\n \n // Bloco Cláusulas (opcional) - Documentar a alteração\n \"clausulas\": {\n \"clausulasAlteradas\": \"Cláusula 3.1 - CONTRATADA: Altera razão social de 'ANTIGA LTDA' para 'NOVA S.A.' mantendo CNPJ e demais condições inalteradas.\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 3: Sub-rogação\n\n## **Cenário**\n**Substituição de fornecedor** por incorporação empresarial.\n\n## **Regras Testadas**\n- ✅ **Bloco Fornecedores obrigatório** para Sub-rogação\n- ✅ **Validação de conflitos** (mesmo ID vinculado/desvinculado)\n- ✅ **Múltiplos blocos** (Fornecedores + Cláusulas)\n- ✅ **Justificativa detalhada** obrigatória\n\n## **Bloco Fornecedores**\n`json\n{\n  \"fornecedoresDesvinculados\": [\"guid-antiga\"],\n  \"fornecedoresVinculados\": [\"guid-nova\"],\n  \"novoFornecedorPrincipal\": \"guid-nova\",\n  \"observacoes\": \"Motivo da substituição\"\n}\n`\n\n## **Validações**\n- Mesmo GUID em vinculados E desvinculados → **Erro 400**\n- Sub-rogação sem bloco Fornecedores → **Erro 400** \n- Lista vazia em ambos → **Erro 400**\n\n## **Bloco Cláusulas (Opcional)**\nDocumenta alterações contratuais:\n`json\n{\n  \"clausulasAlteradas\": \"Cláusula X: Nova razão social...\"\n}\n`\n\n## **Resultado**\n- Status: **201 Created**\n- Blocos: **Fornecedores** + **Cláusulas** ativos\n- Resumo: \"Tipos: Sub-rogação | Blocos: Fornecedores, Cláusulas\""
},
"response": []
},
{
"name": "Caso 4 - Rescisão (Nova Data Final)",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [11], // Rescisão\n \"justificativa\": \"Rescisão amigável do contrato por mútuo acordo entre as partes, devido ao encerramento antecipado do projeto. Todas as obrigações até a data de rescisão serão cumpridas conforme cronograma de desmobilização acordado.\",\n \"dataEfeito\": \"2024-06-30\", // Data da rescisão\n \n // Bloco Vigência OBRIGATÓRIO para Rescisão\n \"vigencia\": {\n \"operacao\": 2, // OperacaoVigencia.Diminuir\n \"novaDataFinal\": \"2024-06-30\", // Data final do contrato\n \"observacoes\": \"Rescisão amigável - Desmobilização até 30/06/2024\"\n },\n \n // Bloco Cláusulas (opcional) - Condições da rescisão\n \"clausulas\": {\n \"clausulasIncluidas\": \"Cláusula de Rescisão: As partes acordam que a rescisão será efetivada em 30/06/2024, com quitação mútua de todas as obrigações até esta data. Não haverá aplicação de multas rescisórias.\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 4: Rescisão Contratual\n\n## **Cenário**\n**Encerramento antecipado** do contrato por mútuo acordo.\n\n## **Regras Testadas**\n- ✅ **Bloco Vigência obrigatório** para Rescisão\n- ✅ **Nova data final** definida\n- ✅ **Validação**: Data não pode ser anterior ao início\n- ✅ **Múltiplos blocos** opcionais\n\n## **Bloco Vigência para Rescisão**\n`json\n{\n  \"operacao\": 2, // Diminuir (encerrar antes)\n  \"novaDataFinal\": \"2024-06-30\",\n  \"observacoes\": \"Condições da rescisão\"\n}\n`\n\n## **Diferenças por Operação**\n\n### **Diminuir (Rescisão)**\n- Define **data final antecipada**\n- Contrato **encerra antes** do previsto\n\n### **Suspender**\n- **Pausa temporária** da execução\n- Pode ter retomada programada\n\n## **Validações Específicas**\n- `novaDataFinal` anterior ao início → **Erro**\n- `novaDataFinal` posterior ao final atual → **Warning**\n- Rescisão sem Vigência → **Erro 400**\n\n## **Resultado**\n- Status: **201 Created**\n- Vigência: Alterada para data de rescisão\n- Blocos: **Vigência** + **Cláusulas** (se preenchido)"
},
"response": []
},
{
"name": "Caso 5 - Suspensão Indeterminada",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [13], // Suspensão\n \"justificativa\": \"Suspensão por tempo indeterminado da execução contratual devido a decisão judicial liminar proferida nos autos do processo nº 1234567-89.2024.8.19.0001. A execução permanecerá suspensa até decisão judicial definitiva.\",\n \"dataEfeito\": \"2024-02-15\",\n \n // Bloco Vigência para Suspensão Indeterminada\n \"vigencia\": {\n \"operacao\": 4, // OperacaoVigencia.SuspenderIndeterminado\n \"isIndeterminado\": true,\n \"observacoes\": \"Suspensão por decisão judicial - Aguarda decisão definitiva do TJ-RJ\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 5: Suspensão Indeterminada\n\n## **Cenário**\n**Suspensão sem prazo definido** por decisão judicial.\n\n## **Regras Testadas**\n- ✅ **Suspensão indeterminada** implementada\n- ✅ **Flag `isIndeterminado`** obrigatória\n- ✅ **Sem campos de tempo** necessários\n- ✅ **Justificativa robusta** obrigatória\n\n## **Bloco Vigência - Indeterminada**\n`json\n{\n  \"operacao\": 4, // SuspenderIndeterminado\n  \"isIndeterminado\": true, // OBRIGATÓRIO\n  // Sem valorTempo ou tipoUnidade\n  \"observacoes\": \"Motivo da suspensão\"\n}\n`\n\n## **Comparação: Suspensões**\n\n### **Determinada** (Operação 3)\n`json\n{\n  \"operacao\": 3,\n  \"tipoUnidade\": 1, // Dias\n  \"valorTempo\": 30,\n  \"isIndeterminado\": false\n}\n`\n\n### **Indeterminada** (Operação 4)\n`json\n{\n  \"operacao\": 4,\n  \"isIndeterminado\": true\n  // Sem tempo definido\n}\n`\n\n## **Validações**\n- Operação 4 sem `isIndeterminado = true` → **Erro**\n- Operação 3 sem `valorTempo` → **Erro**\n- Suspensão sem Vigência → **Erro 400**\n\n## **Uso Prático**\n- **Judicial**: Suspensões por liminar\n- **Administrativo**: Investigações em andamento \n- **Técnico**: Problemas sem prazo de resolução"
},
"response": []
},
{
"name": "Caso 6 - Múltiplas Alterações",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n \"contratoId\": \"{{contrato_id}}\",\n \"tiposAlteracao\": [1, 7], // Aditivo Prazo + Reajuste\n \"justificativa\": \"Aditivo combinado contemplando prorrogação de prazo e reajuste de preços. Prorrogação necessária devido ao atraso na implantação do sistema de gestão (6 meses) e aplicação do reajuste IPCA conforme cláusula 15.1 do contrato original. Ambas alterações aprovadas em reunião extraordinária de 20/01/2024.\",\n \"dataEfeito\": \"2024-03-01\",\n \n // Bloco Vigência OBRIGATÓRIO para Prazo\n \"vigencia\": {\n \"operacao\": 1, // Acrescentar\n \"tipoUnidade\": 2, // Meses\n \"valorTempo\": 6,\n \"observacoes\": \"Prorrogação devido a atraso na implantação do sistema\"\n },\n \n // Bloco Valor OBRIGATÓRIO para Reajuste\n \"valor\": {\n \"operacao\": 1, // Acrescentar\n \"percentualAjuste\": 5.19,\n \"valorCalculadoAutomaticamente\": true,\n \"observacoes\": \"IPCA acumulado 12 meses - Dezembro/2023\"\n },\n \n // Bloco Cláusulas (opcional) - Documentar ambas alterações\n \"clausulas\": {\n \"clausulasAlteradas\": \"Cláusula 8.1 (Vigência): Prazo prorrogado até 31/08/2025. Cláusula 15.1 (Reajuste): Aplicado índice IPCA de 5,19% sobre o valor base, resultando em novo valor mensal.\"\n }\n}"
},
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais"
]
},
"description": "# 🧪 Caso de Teste 6: Múltiplas Alterações\n\n## **Cenário**\n**Aditivo combinado**: Prazo + Reajuste simultaneamente.\n\n## **Regras Testadas**\n- ✅ **Múltiplos tipos** na mesma alteração\n- ✅ **Obrigatoriedades acumuladas** (Vigência + Valor)\n- ✅ **Validação cruzada** de blocos\n- ✅ **Justificativa abrangente** para ambos\n\n## **Tipos Múltiplos**\n`json\n{\n  \"tiposAlteracao\": [1, 7], // Prazo + Reajuste\n  // Bloco Vigência: Obrigatório para Prazo\n  // Bloco Valor: Obrigatório para Reajuste  \n}\n`\n\n## **Validações Acumuladas**\nCom múltiplos tipos, o sistema verifica:\n- ✅ **Prazo** → Requer bloco **Vigência**\n- ✅ **Reajuste** → Requer bloco **Valor** \n- ✅ **Ambos preenchidos** → Passa validação\n- ❌ **Qualquer um faltando** → Erro 400\n\n## **Exemplo de Erro**\nSe remover bloco `vigor`:\n`json\n{\n  \"message\": \"Tipos de alteração que afetam vigência (Prazo, Suspensão, Rescisão) requerem o bloco Vigência preenchido\"\n}\n`\n\n## **Blocos Ativos**\nResultado com 3 blocos:\n- 📅 **Vigência**: Prorrogação de 6 meses\n- 💰 **Valor**: Reajuste de 5,19%\n- 📄 **Cláusulas**: Documentação das alterações\n\n## **Resumo Gerado**\n`\n\"Tipos: Prazo, Reajuste | Blocos: Vigência: Acrescentar 6 meses | Valor: Acrescentar 5.19% | Cláusulas: [resumo]\"\n`"
},
"response": []
}
],
"description": "Casos de teste que demonstram todas as funcionalidades implementadas da EGC-174."
},
{
"name": "🏥 Histórico e Consultas",
"item": [
{
"name": "Histórico Completo do Contrato",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/contrato/{{contrato_id}}/historico",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"contrato",
"{{contrato_id}}",
"historico"
]
},
"description": "# 📚 Histórico Completo do Contrato\n\n## **Descrição**\nRetorna **todas as alterações** realizadas em um contrato, ordenadas por **versão sequencial**, criando um histórico cronológico completo.\n\n## **Informações Incluídas**\n- ✅ **Versionamento**: V1, V2, V3...\n- ✅ **Estados anteriores e posteriores** (JSON)\n- ✅ **Auditoria completa**: Quem fez, quando\n- ✅ **Resumos** de cada alteração\n- ✅ **Fluxo de aprovação** de cada uma\n\n## **Response Ordenado**\n`json\n[\n  {\n    \"id\": \"guid\",\n    \"versaoContrato\": 1,\n    \"tiposAlteracao\": [7], // Reajuste\n    \"status\": 3, // Vigente\n    \"dataEfeito\": \"2024-01-01\",\n    \"dataAssinatura\": \"2024-01-05\",\n    \"resumoAlteracao\": \"Reajuste IPCA 5,19%\",\n    \"estadoAnteriorJson\": \"{ valorGlobal: 1000000 }\",\n    \"estadoPosteriorJson\": \"{ valorGlobal: 1051900 }\"\n  },\n  {\n    \"versaoContrato\": 2,\n    \"tiposAlteracao\": [1], // Prazo\n    \"status\": 2, // AguardandoAprovacao\n    \"resumoAlteracao\": \"Prorrogação 6 meses\"\n  }\n]\n`\n\n## **Uso para Auditoria**\n- 📋 **Relatórios**: Evolução do contrato\n- 📊 **Dashboards**: Linha do tempo\n- 🔍 **Investigação**: Rastreamento de mudanças\n- 📄 **Compliance**: Histórico para órgãos de controle\n\n## **Versionamento**\nCada alteração **aprovada** incrementa a versão:\n- **V0**: Contrato original\n- **V1**: Primeira alteração aprovada \n- **V2**: Segunda alteração aprovada\n- **VN**: N-ésima alteração aprovada"
},
"response": []
},
{
"name": "Alterações Aguardando Aprovação",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{devcac}}/api/alteracoes-contratuais/aguardando-aprovacao",
"host": [
"{{devcac}}"
],
"path": [
"api",
"alteracoes-contratuais",
"aguardando-aprovacao"
]
},
"description": "# ⏳ Alterações Aguardando Aprovação\n\n## **Descrição**\nLista **todas as alterações** que estão com status **AguardandoAprovacao** em todo o sistema.\n\n## **Uso Prático**\n- 👨‍💼 **Aprovadores**: Lista de trabalho\n- 📊 **Dashboards**: Workload de aprovação\n- ⚡ **Priorização**: Alertas por data de efeito\n- 📈 **Métricas**: Tempo médio de aprovação\n\n## **Informações Retornadas**\n- ✅ **Dados básicos** da alteração\n- ✅ **Informações do contrato**\n- ✅ **Alertas** de limite legal pendentes\n- ✅ **Tempo** desde o envio para aprovação\n- ✅ **Prioridade** por data de efeito\n\n## **Response**\n`json\n[\n  {\n    \"id\": \"guid\",\n    \"contratoId\": \"guid\",\n    \"tiposAlteracao\": [4], // Quantidade\n    \"justificativa\": \"Acréscimo de medicamentos...\",\n    \"dataEfeito\": \"2024-02-01\", // Próximo ao vencimento\n    \"requerConfirmacaoLimiteLegal\": false, // Já confirmado\n    \"dataEnvioAprovacao\": \"2024-01-15\",\n    \"contrato\": {\n      \"numero\": \"001/2024\",\n      \"descricaoObjeto\": \"Fornecimento de medicamentos\"\n    }\n  }\n]\n`\n\n## **Ordenação Sugerida**\n1. **Data de efeito** mais próxima\n2. **Valor** da alteração (maior primeiro)\n3. **Data de envio** (mais antigo primeiro)"
},
"response": []
}
],
"description": "Endpoints para consulta de histórico e relatórios do sistema."
}
],
"event": [
{
"listen": "prerequest",
"script": {
"type": "text/javascript",
"exec": [
"// Configurar variáveis automáticas se não existirem",
"if (!pm.environment.get('devcac')) {",
" pm.environment.set('devcac', 'http://devcac:7000');",
"}",
"",
"if (!pm.environment.get('contrato_id')) {",
" pm.environment.set('contrato_id', '550e8400-e29b-41d4-a716-446655440000');",
"}",
"",
"if (!pm.environment.get('usuario_id')) {",
" pm.environment.set('usuario_id', '550e8400-e29b-41d4-a716-446655440001');",
"}"
]
}
},
{
"listen": "test",
"script": {
"type": "text/javascript",
"exec": [
"// Salvar IDs de alterações criadas para uso posterior",
"if (pm.response.code === 201 || pm.response.code === 202) {",
" try {",
" const response = pm.response.json();",
" if (response.id) {",
" pm.environment.set('alteracao_id', response.id);",
" } else if (response.alteracao && response.alteracao.id) {",
" pm.environment.set('alteracao_id', response.alteracao.id);",
" }",
" } catch (e) {",
" console.log('Não foi possível extrair ID da resposta');",
" }",
"}",
"",
"// Log de status para debug",
"console.log(`Request: ${pm.request.name}`);",
"console.log(`Status: ${pm.response.code} ${pm.response.status}`);",
"if (pm.response.code >= 400) {",
" console.log(`Error: ${pm.response.text()}`);",
"}"
]
}
}
],
"variable": [
{
"key": "devcac",
"value": "http://devcac:7000",
"type": "string"
},
{
"key": "contrato_id",
"value": "550e8400-e29b-41d4-a716-446655440000",
"type": "string"
},
{
"key": "usuario_id",
"value": "550e8400-e29b-41d4-a716-446655440001",
"type": "string"
},
{
"key": "alteracao_id",
"value": "",
"type": "string"
}
]
}
