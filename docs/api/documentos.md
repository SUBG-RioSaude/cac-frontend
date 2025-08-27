{
					"name": "📄 Documentos de Contratos",
					"item": [
						{
							"name": "📋 Listar Todos os Documentos",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato"
									]
								},
								"description": "## 📋 **Listar Todos os Documentos Ativos**\n\n### 🎯 **Overview**\nObtém lista completa de **todos os documentos ativos** no sistema, organizados com informações consolidadas de contrato e tipo documental.\n\n### 💼 **Casos de Uso**\n- 📊 **Dashboard Geral**: Visão consolidada de documentação\n- 🔍 **Busca Ampla**: Localizar documentos sem filtros específicos\n- 📈 **Relatórios**: Base para estatísticas gerais\n- 🔧 **Administração**: Gestão geral de documentos\n\n### 📊 **Response (200)**\n```json\n[\n  {\n    \"id\": \"123e4567-e89b-12d3-a456-426614174000\",\n    \"contratoId\": \"456e7890-e89b-12d3-a456-426614174001\",\n    \"tipoDocumento\": \"TermoReferencia\",\n    \"tipoDocumentoNumero\": 1,\n    \"nomeTipoDocumento\": \"Termo de Referência/Edital\",\n    \"urlDocumento\": \"https://docs.example.com/termo-ref-2024001.pdf\",\n    \"dataEntrega\": \"2024-01-15T10:30:00Z\",\n    \"observacoes\": \"Documento principal do processo\",\n    \"ativo\": true,\n    \"dataCadastro\": \"2024-01-10T08:15:00Z\",\n    \"dataAtualizacao\": \"2024-01-15T10:30:00Z\"\n  }\n]\n```\n\n### ⚡ **Performance**\n- ✅ **Cache Inteligente**: Resposta otimizada\n- ✅ **Joins Eficientes**: Dados consolidados\n- ✅ **Paginação**: Implícita para grandes volumes\n\n### 🚨 **Status Codes**\n- **200 OK**: Lista retornada com sucesso\n- **401 Unauthorized**: Token inválido ou expirado\n- **500 Internal Server Error**: Erro do servidor"
							},
							"response": []
						},
						{
							"name": "🔍 Buscar Documento por ID",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/{{documentoId}}",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"{{documentoId}}"
									]
								},
								"description": "## 🔍 **Buscar Documento por ID**\n\n### 🎯 **Overview**\nRecupera **dados completos** de um documento específico através de seu UUID. Essencial para visualização detalhada e operações de edição.\n\n### 💼 **Casos de Uso**\n- 📄 **Detalhes**: Exibir informações completas do documento\n- ✏️ **Edição**: Carregar dados para formulários\n- 🔗 **Download**: Acesso direto ao arquivo\n- 📋 **Auditoria**: Verificação de dados específicos\n\n### 📋 **Path Parameters**\n- **id** (UUID): ID único do documento\n  - Exemplo: `123e4567-e89b-12d3-a456-426614174000`\n\n### 📊 **Response (200)**\nRetorna objeto completo do documento com:\n- Informações básicas (ID, tipo, URL)\n- Dados temporais (data entrega, criação, atualização)\n- Relacionamento com contrato\n- Nome amigável do tipo de documento\n- Metadados de auditoria\n\n### ⚡ **Performance**\n- ✅ **Consulta Direta**: Busca otimizada por chave primária\n- ✅ **Cache Individual**: Documento armazenado em cache\n- ✅ **Tempo Médio**: <50ms\n\n### 🚨 **Status Codes**\n- **200 OK**: Documento encontrado e retornado\n- **404 Not Found**: Documento não existe ou foi removido\n- **401 Unauthorized**: Token de acesso inválido"
							},
							"response": []
						},
						{
							"name": "📄 Documentos por Contrato",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}"
									]
								},
								"description": "## 📄 **Listar Documentos de um Contrato**\n\n### 🎯 **Overview**\nObtém **todos os documentos** vinculados a um contrato específico. Vista essencial para acompanhamento documental completo de um processo contratual.\n\n### 💼 **Casos de Uso**\n- 📊 **Dashboard do Contrato**: Visão documental completa\n- ✅ **Checklist Legal**: Verificar documentos obrigatórios\n- 📋 **Auditoria**: Rastreamento documental por processo\n- 🔍 **Due Diligence**: Análise de completude documental\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato\n  - Use variável: `{{contratoId}}`\n\n### 📊 **Response Inclui**\n- Lista ordenada por tipo de documento\n- Status de entrega (data + observações)\n- Links diretos para documentos\n- Metadados de criação/atualização\n- Identificação do tipo documental\n\n### 📈 **Ordenação Padrão**\n1. Por tipo de documento (sequência lógica do processo)\n2. Por data de criação (mais recentes primeiro)\n\n### ⚡ **Performance**\n- ✅ **Índice Otimizado**: Consulta por contratoId\n- ✅ **Cache por Contrato**: Resposta armazenada\n- ✅ **Joins Eficientes**: Dados consolidados\n\n### 🚨 **Status Codes**\n- **200 OK**: Lista retornada (pode estar vazia)\n- **404 Not Found**: Contrato não existe\n- **401 Unauthorized**: Token inválido"
							},
							"response": []
						},
						{
							"name": "🎯 Documento por Contrato + Tipo",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}/tipo/1",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}",
										"tipo",
										"1"
									],
									"variable": [
										{
											"key": "tipoDocumento",
											"value": "1",
											"description": "1=Termo Ref, 2=Homologação, 3=Ata, 4=Garantia, 5=Contrato, 6=PNCP, 7=Extrato"
										}
									]
								},
								"description": "## 🎯 **Buscar Documento Específico (Contrato + Tipo)**\n\n### 🎯 **Overview**\nLocaliza documento **específico** de um contrato através da combinação única de contratoId + tipoDocumento. Busca precisa para verificações documentais específicas.\n\n### 💼 **Casos de Uso**\n- ✅ **Verificação Específica**: \"Este contrato tem Termo de Referência?\"\n- 📋 **Validação**: Confirmar entrega de documento obrigatório\n- 🔗 **Acesso Direto**: Link para documento específico\n- 📊 **Dashboard**: Status de documentos por categoria\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato\n- **tipoDocumento** (int): Número do tipo de documento\n  - 1 = Termo de Referência/Edital\n  - 2 = Homologação\n  - 3 = Ata de Registro de Preços\n  - 4 = Garantia Contratual\n  - 5 = Contrato\n  - 6 = Publicação PNCP\n  - 7 = Publicação de Extrato Contratual\n\n### 📊 **Response (200)**\nDocumento encontrado com informações completas:\n- Dados do documento (URL, data entrega, observações)\n- Informações do tipo (nome, descrição)\n- Metadados de auditoria\n- Status de ativação\n\n### ⚡ **Performance**\n- ✅ **Índice Composto**: Busca otimizada por contratoId + tipo\n- ✅ **Cache Específico**: Resultado armazenado\n- ✅ **Consulta Única**: Sem necessidade de joins adicionais\n\n### 🚨 **Status Codes**\n- **200 OK**: Documento encontrado\n- **404 Not Found**: Documento específico não existe\n- **400 Bad Request**: Tipo de documento inválido\n- **401 Unauthorized**: Token de acesso inválido"
							},
							"response": []
						},
						{
							"name": "📂 Documentos por Tipo",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/tipo/1",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"tipo",
										"1"
									],
									"variable": [
										{
											"key": "tipoDocumento",
											"value": "1",
											"description": "Altere para 1-7: 1=Termo, 2=Homolog, 3=Ata, 4=Garantia, 5=Contrato, 6=PNCP, 7=Extrato"
										}
									]
								},
								"description": "## 📂 **Listar Documentos por Tipo**\n\n### 🎯 **Overview**\nObtém **todos os documentos** de uma categoria específica no sistema. Útil para análises por tipo documental e relatórios consolidados.\n\n### 💼 **Casos de Uso**\n- 📊 **Relatórios por Tipo**: \"Quantos Termos de Referência temos?\"\n- 📈 **Análise Temporal**: Entregas por categoria ao longo do tempo\n- 🔍 **Auditoria Temática**: Verificação de documentos por tipo\n- 📋 **Gestão Documental**: Controle por categoria\n\n### 📋 **Path Parameters**\n- **tipoDocumento** (int): Número do tipo de documento\n  - **1** = Termo de Referência/Edital\n  - **2** = Homologação\n  - **3** = Ata de Registro de Preços\n  - **4** = Garantia Contratual\n  - **5** = Contrato\n  - **6** = Publicação PNCP\n  - **7** = Publicação de Extrato Contratual\n\n### 📊 **Response Inclui**\n- Lista de todos os documentos do tipo selecionado\n- Informações do contrato associado (número, empresa)\n- Dados de entrega e observações\n- Metadados temporais\n\n### 📈 **Ordenação**\n- Por data de criação (mais recentes primeiro)\n- Em caso de empate: por número de contrato\n\n### ⚡ **Performance**\n- ✅ **Índice por Tipo**: Consulta otimizada\n- ✅ **Cache Categoria**: Resultado armazenado por tipo\n- ✅ **Paginação**: Automática para grandes volumes\n\n### 🚨 **Status Codes**\n- **200 OK**: Lista retornada (pode estar vazia)\n- **400 Bad Request**: Tipo de documento inválido (fora do range 1-7)\n- **401 Unauthorized**: Token de acesso inválido"
							},
							"response": []
						},
						{
							"name": "📋 Tipos de Documentos Disponíveis",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/tipos",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"tipos"
									]
								},
								"description": "## 📋 **Tipos de Documentos Disponíveis**\n\n### 🎯 **Overview**\nRetorna **lista completa** de tipos documentais disponíveis no sistema com suas descrições. Endpoint essencial para formulários e validações.\n\n### 💼 **Casos de Uso**\n- 🎨 **Formulários**: Dropdown de tipos de documento\n- ✅ **Validação**: Verificar tipos válidos\n- 📚 **Documentação**: Lista de categorias documentais\n- 🔧 **Configuração**: Setup de sistemas integrados\n\n### 📊 **Response (200)**\n```json\n[\n  {\n    \"numero\": 1,\n    \"nome\": \"TermoReferencia\",\n    \"descricao\": \"Termo de Referência/Edital - Documento base do processo de contratação\"\n  },\n  {\n    \"numero\": 2,\n    \"nome\": \"Homologacao\",\n    \"descricao\": \"Homologação - Documento de aprovação do processo licitatório\"\n  },\n  {\n    \"numero\": 3,\n    \"nome\": \"AtaRegistroPrecos\",\n    \"descricao\": \"Ata de Registro de Preços - Documento de registro de preços homologados\"\n  },\n  {\n    \"numero\": 4,\n    \"nome\": \"GarantiaContratual\",\n    \"descricao\": \"Garantia Contratual - Documento de garantia apresentada pelo fornecedor\"\n  },\n  {\n    \"numero\": 5,\n    \"nome\": \"Contrato\",\n    \"descricao\": \"Contrato - Instrumento contratual assinado\"\n  },\n  {\n    \"numero\": 6,\n    \"nome\": \"PublicacaoPNCP\",\n    \"descricao\": \"Publicação PNCP - Comprovante de publicação no Portal Nacional de Contratações Públicas\"\n  },\n  {\n    \"numero\": 7,\n    \"nome\": \"PublicacaoExtrato\",\n    \"descricao\": \"Publicação de Extrato Contratual - Comprovante de publicação do extrato\"\n  }\n]\n```\n\n### ⚡ **Performance**\n- ✅ **Cache Estático**: Dados raramente mudam\n- ✅ **Response Leve**: Payload mínimo\n- ✅ **Tempo Médio**: <10ms\n\n### 💡 **Dica de Integração**\nUse este endpoint para popular dropdowns e validar entradas antes de criar/atualizar documentos."
							},
							"response": []
						},
						{
							"name": "➕ Criar Novo Documento",
							"request": {
								"method": "POST",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									},
									{
										"key": "Content-Type",
										"value": "application/json"
									}
								],
								"body": {
									"mode": "raw",
									"raw": "{\n  \"contratoId\": \"{{contratoId}}\",\n  \"tipoDocumento\": 1,\n  \"urlDocumento\": \"https://docs.example.com/contrato-001/termo-referencia.pdf\",\n  \"dataEntrega\": \"2024-01-15T10:30:00Z\",\n  \"observacoes\": \"Documento base do processo de contratação - Versão final aprovada\"\n}"
								},
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato"
									]
								},
								"description": "## ➕ **Criar Novo Documento de Contrato**\n\n### 🎯 **Overview**\nCria novo **documento** vinculado a um contrato específico com tipo documental, URL e informações de entrega. Operação fundamental para gestão documental.\n\n### 💼 **Casos de Uso**\n- 📄 **Upload Inicial**: Primeiro documento de um tipo\n- 🔄 **Atualização de Versão**: Nova versão de documento existente\n- ✅ **Cumprimento Legal**: Adicionar documentos obrigatórios\n- 📋 **Processo Administrativo**: Inserção de documentos do processo\n\n### 📋 **Request Body (JSON)**\n```json\n{\n  \"contratoId\": \"{{contratoId}}\",\n  \"tipoDocumento\": 1,\n  \"urlDocumento\": \"https://docs.example.com/contrato-001/termo-referencia.pdf\",\n  \"dataEntrega\": \"2024-01-15T10:30:00Z\",\n  \"observacoes\": \"Documento base do processo de contratação - Versão final aprovada\"\n}\n```\n\n### 📊 **Campos Obrigatórios**\n- ✅ **contratoId**: UUID do contrato (deve existir)\n- ✅ **tipoDocumento**: Número do tipo (1-7)\n- ✅ **urlDocumento**: URL válida do documento\n\n### 📊 **Campos Opcionais**\n- **dataEntrega**: Data/hora de entrega (default: now)\n- **observacoes**: Comentários adicionais\n\n### 🔒 **Validações**\n- Contrato deve existir e estar ativo\n- Tipo de documento deve ser válido (1-7)\n- URL deve ser válida e acessível\n- Não permite duplicação (mesmo contrato + tipo)\n\n### 📊 **Response (201)**\nRetorna documento criado com:\n- ID único gerado\n- Dados fornecidos + calculados\n- Metadados de auditoria\n- Nome amigável do tipo\n\n### 🚨 **Status Codes**\n- **201 Created**: Documento criado com sucesso\n- **400 Bad Request**: Dados inválidos ou faltantes\n- **404 Not Found**: Contrato não encontrado\n- **409 Conflict**: Documento já existe para este contrato/tipo"
							},
							"response": []
						},
						{
							"name": "✏️ Atualizar Documento",
							"request": {
								"method": "PUT",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									},
									{
										"key": "Content-Type",
										"value": "application/json"
									}
								],
								"body": {
									"mode": "raw",
									"raw": "{\n  \"urlDocumento\": \"https://docs.example.com/contrato-001/termo-referencia-v2.pdf\",\n  \"dataEntrega\": \"2024-01-16T14:45:00Z\",\n  \"observacoes\": \"Versão atualizada após revisão jurídica - Aprovada em 16/01/2024\"\n}"
								},
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/{{documentoId}}",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"{{documentoId}}"
									]
								},
								"description": "## ✏️ **Atualizar Documento Existente**\n\n### 🎯 **Overview**\nAtualiza **informações editáveis** de um documento: URL, data de entrega e observações. Não permite alterar contrato ou tipo após criação.\n\n### 💼 **Casos de Uso**\n- 🔄 **Nova Versão**: Atualizar URL para versão mais recente\n- 📅 **Correção de Data**: Ajustar data de entrega real\n- 📝 **Observações**: Adicionar/modificar comentários\n- 🔗 **Migração de Links**: Atualizar URLs após mudanças de repositório\n\n### 📋 **Path Parameters**\n- **id** (UUID): ID único do documento a ser atualizado\n\n### 📋 **Request Body (JSON)**\n```json\n{\n  \"urlDocumento\": \"https://docs.example.com/contrato-001/termo-referencia-v2.pdf\",\n  \"dataEntrega\": \"2024-01-16T14:45:00Z\",\n  \"observacoes\": \"Versão atualizada após revisão jurídica - Aprovada em 16/01/2024\"\n}\n```\n\n### ✅ **Campos Editáveis**\n- **urlDocumento**: Nova URL do documento (obrigatória)\n- **dataEntrega**: Data/hora de entrega (opcional)\n- **observacoes**: Comentários/notas (opcional)\n\n### 🚫 **Campos NÃO Editáveis**\n- contratoId (definido na criação)\n- tipoDocumento (definido na criação)\n- Metadados de auditoria (automáticos)\n\n### 🔒 **Validações**\n- Documento deve existir e estar ativo\n- URL deve ser válida e diferente da atual\n- Usuário deve ter permissão de edição\n\n### 📊 **Response (200)**\nDocumento atualizado com:\n- Todos os campos (originais + modificados)\n- dataAtualizacao atualizada automaticamente\n- usuarioAtualizacaoId preenchido\n\n### 🚨 **Status Codes**\n- **200 OK**: Documento atualizado com sucesso\n- **400 Bad Request**: Dados inválidos (URL inválida, etc.)\n- **404 Not Found**: Documento não encontrado\n- **401 Unauthorized**: Token inválido ou sem permissão"
							},
							"response": []
						},
						{
							"name": "🗑️ Excluir Documento",
							"request": {
								"method": "DELETE",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/{{documentoId}}",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"{{documentoId}}"
									]
								},
								"description": "## 🗑️ **Excluir Documento (Soft Delete)**\n\n### 🎯 **Overview**\nRemove documento do sistema usando **soft delete** - marca como inativo preservando dados para auditoria. Operação segura e reversível.\n\n### 💼 **Casos de Uso**\n- 📄 **Documento Incorreto**: Remover arquivo enviado por engano\n- 🔄 **Reorganização**: Limpeza de documentos desnecessários\n- ❌ **Cancelamento**: Processo cancelado ou alterado\n- 🧹 **Manutenção**: Limpeza periódica de documentos\n\n### 📋 **Path Parameters**\n- **id** (UUID): ID único do documento a ser removido\n  - Use variável: `{{documentoId}}`\n\n### ⚙️ **Comportamento do Soft Delete**\n- 🔄 **Preservação**: Dados mantidos no banco\n- 🚫 **Invisibilidade**: Não aparece em listagens\n- 📊 **Auditoria**: Histórico preservado\n- 👤 **Rastreamento**: Usuário e data de remoção registrados\n\n### 🔒 **Validações**\n- Documento deve existir\n- Documento deve estar ativo\n- Usuário deve ter permissão de exclusão\n- Não há dependências que impeçam a remoção\n\n### 📊 **Response (204)**\n- **No Content**: Operação realizada com sucesso\n- Corpo da resposta vazio\n- Headers padrão de confirmação\n\n### 💡 **Reversibilidade**\nApesar do soft delete, a reversão requer:\n- Acesso direto ao banco de dados\n- Permissões administrativas\n- Processo manual de reativação\n\n### 🚨 **Status Codes**\n- **204 No Content**: Documento removido com sucesso\n- **404 Not Found**: Documento não encontrado ou já removido\n- **401 Unauthorized**: Token inválido ou sem permissão\n- **400 Bad Request**: Operação não permitida (dependências)"
							},
							"response": []
						},
						{
							"name": "📊 Gerenciar Documentos Múltiplos",
							"request": {
								"method": "POST",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									},
									{
										"key": "Content-Type",
										"value": "application/json"
									}
								],
								"body": {
									"mode": "raw",
									"raw": "{\n  \"documentos\": [\n    {\n      \"tipoDocumento\": 1,\n      \"urlDocumento\": \"https://docs.example.com/termo-ref.pdf\",\n      \"dataEntrega\": \"2024-01-15T10:30:00Z\",\n      \"observacoes\": \"Termo de referência aprovado\",\n      \"selecionado\": true\n    },\n    {\n      \"tipoDocumento\": 2,\n      \"urlDocumento\": \"https://docs.example.com/homologacao.pdf\",\n      \"dataEntrega\": \"2024-01-20T16:45:00Z\",\n      \"observacoes\": \"Homologação do processo\",\n      \"selecionado\": true\n    }\n  ]\n}"
								},
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}/multiplos",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}",
										"multiplos"
									]
								},
								"description": "## 📊 **Gerenciar Documentos Múltiplos de um Contrato**\n\n### 🎯 **Overview**\nOperação **em lote** para gerenciar múltiplos documentos de um contrato simultaneamente. Permite criar, atualizar ou marcar documentos como selecionados em uma única operação.\n\n### 💼 **Casos de Uso**\n- 📋 **Setup Inicial**: Criar vários documentos de uma vez\n- ✅ **Checklist**: Marcar documentos como entregues em lote\n- 🔄 **Atualização Massiva**: Modificar múltiplos documentos\n- 🏢 **Processo Padronizado**: Aplicar template documental\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato para gestão documental\n\n### 📋 **Request Body (JSON)**\n```json\n{\n  \"documentos\": [\n    {\n      \"tipoDocumento\": 1,\n      \"urlDocumento\": \"https://docs.example.com/termo-ref.pdf\",\n      \"dataEntrega\": \"2024-01-15T10:30:00Z\",\n      \"observacoes\": \"Termo de referência aprovado\",\n      \"selecionado\": true\n    },\n    {\n      \"tipoDocumento\": 2,\n      \"urlDocumento\": \"https://docs.example.com/homologacao.pdf\",\n      \"dataEntrega\": \"2024-01-20T16:45:00Z\",\n      \"observacoes\": \"Homologação do processo\",\n      \"selecionado\": true\n    }\n  ]\n}\n```\n\n### 📊 **Campos por Documento**\n- **tipoDocumento** (int): Tipo de documento (1-7)\n- **urlDocumento** (string|null): URL do documento\n- **dataEntrega** (datetime|null): Data de entrega\n- **observacoes** (string|null): Observações\n- **selecionado** (boolean): Se deve ser processado\n\n### ⚙️ **Lógica de Processamento**\n- **selecionado: true + URL**: Cria ou atualiza documento\n- **selecionado: false**: Ignora ou remove documento\n- **Validações**: Aplicadas individualmente\n\n### 📊 **Response (200)**\nLista de documentos processados com status de cada operação.\n\n### 🚨 **Status Codes**\n- **200 OK**: Processamento concluído (pode ter erros individuais)\n- **400 Bad Request**: Estrutura de dados inválida\n- **404 Not Found**: Contrato não encontrado"
							},
							"response": []
						},
						{
							"name": "🔢 Contar Documentos por Contrato",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}/contar",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}",
										"contar"
									]
								},
								"description": "## 🔢 **Contar Documentos por Contrato**\n\n### 🎯 **Overview**\nRetorna **número total** de documentos ativos vinculados a um contrato específico. Útil para dashboards e validações rápidas.\n\n### 💼 **Casos de Uso**\n- 📊 **Dashboard**: Exibir quantidade de documentos por contrato\n- ✅ **Validação**: Verificar completude documental\n- 📈 **Relatórios**: Estatísticas de documentação\n- 🚨 **Alertas**: Identificar contratos com poucos documentos\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato para contagem\n  - Use variável: `{{contratoId}}`\n\n### 📊 **Response (200)**\n```json\n5\n```\n*Número inteiro simples representando a quantidade*\n\n### ⚡ **Performance**\n- ✅ **Query Otimizada**: COUNT direto no banco\n- ✅ **Cache Inteligente**: Resultado armazenado por contrato\n- ✅ **Tempo Médio**: <20ms\n- ✅ **Índice Específico**: Consulta por contratoId\n\n### 💡 **Dicas de Uso**\n- Use para validar se contrato tem documentação mínima\n- Combine com outros endpoints para análises completas\n- Ideal para dashboards com muitos contratos\n\n### 🔍 **Considera Apenas**\n- Documentos com `ativo = true`\n- Documentos do contrato específico\n- Todos os tipos de documentos\n\n### 🚨 **Status Codes**\n- **200 OK**: Contagem retornada (pode ser 0)\n- **404 Not Found**: Contrato não encontrado\n- **401 Unauthorized**: Token de acesso inválido"
							},
							"response": []
						},
						{
							"name": "❓ Verificar Existência de Documento",
							"request": {
								"method": "GET",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}/tipo/1/existe",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}",
										"tipo",
										"1",
										"existe"
									],
									"variable": [
										{
											"key": "tipoDocumento",
											"value": "1",
											"description": "Altere para 1-7 conforme tipo desejado"
										}
									]
								},
								"description": "## ❓ **Verificar Existência de Documento Específico**\n\n### 🎯 **Overview**\nVerifica se existe documento **específico** para combinação contrato + tipo. Retorna boolean simples para validações rápidas.\n\n### 💼 **Casos de Uso**\n- ✅ **Validação de Formulários**: Verificar antes de criar\n- 🚨 **Alertas de Completude**: \"Falta documento X\"\n- 📋 **Checklist Dinâmico**: Marcar itens como concluídos\n- 🔒 **Regras de Negócio**: Bloquear ações sem documentos obrigatórios\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato\n- **tipoDocumento** (int): Número do tipo (1-7)\n  - **1** = Termo de Referência/Edital\n  - **2** = Homologação\n  - **3** = Ata de Registro de Preços\n  - **4** = Garantia Contratual\n  - **5** = Contrato\n  - **6** = Publicação PNCP\n  - **7** = Publicação de Extrato Contratual\n\n### 📊 **Response (200)**\n```json\ntrue\n```\n*Boolean indicando existência (true) ou não (false)*\n\n### ⚡ **Performance**\n- ✅ **Query Otimizada**: EXISTS direto no banco\n- ✅ **Índice Composto**: Busca por contratoId + tipoDocumento\n- ✅ **Cache Agressivo**: Resultado armazenado\n- ✅ **Tempo Médio**: <10ms\n\n### 💡 **Exemplos de Uso**\n```javascript\n// Frontend validation\nif (!await documentoExiste(contratoId, TIPO_CONTRATO)) {\n  showAlert(\"Contrato principal não foi anexado!\");\n}\n\n// Checklist dinâmico\ntiposDocumentos.forEach(tipo => {\n  checklist[tipo] = await documentoExiste(contratoId, tipo);\n});\n```\n\n### 🔍 **Considera Apenas**\n- Documentos ativos (`ativo = true`)\n- Exata combinação de contrato + tipo\n- Não verifica validade da URL\n\n### 🚨 **Status Codes**\n- **200 OK**: Verificação realizada (true/false)\n- **400 Bad Request**: Tipo de documento inválido\n- **404 Not Found**: Contrato não encontrado\n- **401 Unauthorized**: Token inválido"
							},
							"response": []
						},
						{
							"name": "🧹 Remover Todos Documentos do Contrato",
							"request": {
								"method": "DELETE",
								"header": [
									{
										"key": "Authorization",
										"value": "Bearer {{authToken}}"
									}
								],
								"url": {
									"raw": "{{baseUrl}}/api/documentos-contrato/contrato/{{contratoId}}/todos",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"api",
										"documentos-contrato",
										"contrato",
										"{{contratoId}}",
										"todos"
									]
								},
								"description": "## 🧹 **Remover Todos os Documentos de um Contrato**\n\n### 🎯 **Overview**\n⚠️ **Operação Crítica**: Remove **todos os documentos** de um contrato usando soft delete. Útil para limpeza completa ou cancelamentos.\n\n### 💼 **Casos de Uso**\n- ❌ **Cancelamento de Processo**: Contrato cancelado\n- 🔄 **Reset Documental**: Reiniciar processo de documentação\n- 🧹 **Limpeza Massiva**: Manutenção administrativa\n- 📋 **Processo Anulado**: Anulação de licitação\n\n### 📋 **Path Parameters**\n- **contratoId** (UUID): ID do contrato para limpeza completa\n  - Use variável: `{{contratoId}}`\n\n### ⚠️ **IMPORTANTE: Operação Crítica**\n- 🚨 **Remove TODOS os documentos** do contrato\n- 🔄 **Soft Delete**: Dados preservados para auditoria\n- 👤 **Rastreamento**: Usuário e timestamp registrados\n- 📊 **Auditoria**: Operação completamente logada\n\n### ⚙️ **Comportamento**\n- Marca todos os documentos como `ativo = false`\n- Atualiza metadados de exclusão em lote\n- Preserva dados originais para auditoria\n- Não afeta o contrato principal\n\n### 🔒 **Validações**\n- Contrato deve existir\n- Usuário deve ter permissão especial\n- Operação requer confirmação\n- Log completo da operação\n\n### 📊 **Response (204)**\n- **No Content**: Operação realizada com sucesso\n- Todos os documentos removidos (soft delete)\n- Corpo da resposta vazio\n\n### 💡 **Reversibilidade**\nApesar do soft delete:\n- Requer acesso administrativo\n- Processo manual de reativação\n- Necessita justificativa documentada\n\n### 🚨 **Status Codes**\n- **204 No Content**: Todos os documentos removidos\n- **404 Not Found**: Contrato não encontrado\n- **401 Unauthorized**: Token inválido ou sem permissão especial\n- **403 Forbidden**: Operação não permitida para este usuário"
							},
							"response": []
						}
					],
					"description": "## 📄 **API de Documentos de Contratos - Gestão Documental Completa**\n\n### 🎯 **Overview**\n\nGerenciamento completo da **documentação contratual** com controle de tipos, entregas e status. Sistema especializado para controle documental do processo de contratação pública.\n\n### 🚀 **Principais Funcionalidades**\n\n- ✅ **Gestão por Tipo**: Controle específico por categoria documental\n    \n- 📋 **Rastreamento**: Estado de entrega e observações\n    \n- 🔗 **Vinculação**: Associação direta com contratos\n    \n- 📊 **Relatórios**: Status documental consolidado\n    \n- 🏢 **Integração**: Conectado ao ciclo de vida contratual\n    \n- ⚡ **Performance**: Consultas otimizadas e cache inteligente\n    \n\n### 📋 **Tipos de Documentos (Enum)**\n\n1. **Termo de Referência/Edital** (1)\n    \n2. **Homologação** (2)\n    \n3. **Ata de Registro de Preços** (3)\n    \n4. **Garantia Contratual** (4)\n    \n5. **Contrato** (5)\n    \n6. **Publicação PNCP** (6)\n    \n7. **Publicação de Extrato Contratual** (7)\n    \n\n### 📋 **Endpoints Disponíveis (14 total)**\n\n#### 🔍 **Consultas**\n\n- **Listar Todos**: Documentos ativos no sistema\n    \n- **Por ID**: Documento específico\n    \n- **Por Contrato**: Todos os documentos de um contrato\n    \n- **Por Tipo**: Documentos de uma categoria específica\n    \n- **Por Contrato + Tipo**: Documento específico de um contrato\n    \n- **Tipos Disponíveis**: Lista de categorias documentais\n    \n\n#### 📝 **Operações CRUD**\n\n- **Criar Documento**: Novo documento associado a contrato\n    \n- **Atualizar Documento**: Modificar URL, data entrega, observações\n    \n- **Excluir Documento**: Remoção com soft delete\n    \n\n#### 🔧 **Utilitários**\n\n- **Contar Documentos**: Quantidade por contrato\n    \n- **Verificar Existência**: Documento específico existe\n    \n- **Gestão Múltipla**: Operações em lote\n    \n- **Remover Todos**: Limpeza completa por contrato\n    \n\n### 🎯 **Casos de Uso**\n\n- 📊 **Dashboard Documental**: Status de entregas por contrato\n    \n- ✅ **Checklist Legal**: Acompanhamento de documentos obrigatórios\n    \n- 📋 **Auditoria**: Rastreabilidade completa de documentos\n    \n- 🏢 **Compliance**: Garantia de documentação adequada\n    \n- 📈 **Relatórios**: Estatísticas de documentação\n    \n\n### 💡 **Dicas de Uso**\n\n1. **Inicie** com \"Tipos Disponíveis\" para conhecer categorias\n    \n2. **Liste** documentos por contrato para visão completa\n    \n3. **Verifique** existência antes de criar duplicatas\n    \n4. **Use** gestão múltipla para operações em lote\n    \n\n### 🔒 **Validações**\n\n- ✅ **Contrato deve existir** para associação\n    \n- ✅ **URL obrigatória** para todos os documentos\n    \n- ✅ **Tipo válido** conforme enum definido\n    \n- ✅ **Unicidade** por contrato + tipo (quando aplicável)"
				},