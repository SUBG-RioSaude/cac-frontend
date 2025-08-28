{
	"info": {
		"_postman_id": "4be0ac0a-355b-4448-b05d-3ed180d96b1a",
		"name": "EGESTÃO - Contratos CRUD API",
		"description": "Collection completa para operações CRUD de contratos no sistema EGESTÃO.\n\n## 🎯 Visão Geral do Módulo de Contratos\n\nEste módulo é o coração do sistema EGESTÃO, responsável pelo **gerenciamento completo do ciclo de vida dos contratos** públicos, seguindo rigorosamente as normas da administração pública brasileira.\n\n### 🏗️ Arquitetura Clean Architecture\n\n- **API Layer**: Controllers REST com documentação OpenAPI\n    \n- **Application Layer**: Serviços de aplicação, DTOs e validações FluentValidation\n    \n- **Domain Layer**: Entidades de domínio, enums e regras de negócio\n    \n- **Data Layer**: Repositórios Entity Framework com PostgreSQL\n    \n\n### 📋 Funcionalidades Principais\n\n#### 🔧 CRUD Completo\n\n- **Criar**: Cadastro de novos contratos com validações rigorosas\n    \n- **Consultar**: Busca por ID, número, empresa, unidade de saúde\n    \n- **Atualizar**: Modificação de contratos editáveis\n    \n- **Remover**: Exclusão lógica (soft delete)\n    \n\n#### 🎯 Gestão Inteligente de Status\n\n- **Ativo**: Contratos dentro da vigência\n    \n- **Vencendo**: Contratos próximos ao vencimento (30 dias)\n    \n- **Vencido**: Contratos com vigência expirada\n    \n- **Suspenso**: Contratos temporariamente suspensos\n    \n- **Encerrado**: Contratos finalizados\n    \n\n#### 🔍 Sistema Avançado de Filtros\n\n- **Por Status**: Filtragem por situação contratual\n    \n- **Por Período**: Filtros de vigência inicial/final\n    \n- **Por Valor**: Faixas de valores mínimo/máximo\n    \n- **Por Entidades**: Empresa e Unidade de Saúde\n    \n- **Busca Textual**: Pesquisa em múltiplos campos\n    \n\n#### 📊 Paginação Otimizada\n\n- **Performance**: Queries otimizadas com paginação server-side\n    \n- **Flexibilidade**: Tamanhos de página configuráveis (1-100 itens)\n    \n- **Metadados**: Total de registros, páginas e navegação\n    \n\n### ⚖️ Regras de Negócio Implementadas\n\n#### 🔒 Validações Rigorosas\n\n- **Número Único**: Cada contrato deve ter número único no sistema\n    \n- **Datas Consistentes**: Vigência final posterior à inicial\n    \n- **Valores Positivos**: Valor global deve ser maior que zero\n    \n- **CNPJ Válido**: Validação de empresa existente\n    \n- **Unidade Válida**: Validação de unidade de saúde existente\n    \n\n#### 🚫 Controles de Edição\n\n- **Contratos Vencidos**: Não podem ser editados\n    \n- **Contratos Encerrados**: Bloqueados para alterações\n    \n- **Status Automático**: Atualização baseada nas datas\n    \n\n#### 👥 Gestão de Funcionários\n\n- **Gestores**: Funcionários responsáveis pelo contrato\n    \n- **Fiscais**: Funcionários de fiscalização\n    \n- **Validação**: Verificação de existência no módulo de funcionários\n    \n\n### 🔗 Integrações Microserviços\n\n#### 📈 Empresas Service (porta 7002)\n\n- **EmpresaId**: Referência ao fornecedor contratado\n    \n- **Validação**: Verificação de empresa ativa e válida\n    \n- **CNPJ**: Integração para validação de documentos\n    \n\n#### 🏥 Unidades Service (porta 7004)\n\n- **UnidadeSaudeId**: Referência à unidade demandante\n    \n- **CNES**: Integração com cadastros de estabelecimentos\n    \n- **Hierarquia**: Suporte a múltiplas unidades por contrato\n    \n\n#### 👨‍💼 Funcionários Service (porta 7008)\n\n- **Gestores/Fiscais**: Vinculação de responsáveis\n    \n- **Lotação**: Validação de funcionários ativos\n    \n- **Hierarquia**: Suporte a múltiplos tipos de gerência\n    \n\n### 🌐 Configuração de Ambiente\n\n#### 🔧 URLs de Desenvolvimento\n\n- **API Direta**: [http://localhost:7006](http://localhost:7006)\n    \n- **Via Gateway**: [http://localhost:7000/api/contratos](http://localhost:7000/api/contratos)\n    \n- **Swagger**: [http://localhost:7006/swagger](http://localhost:7006/swagger)\n    \n- **Health Check**: [http://localhost:7006/health](http://localhost:7006/health)\n    \n\n#### 🗄️ Banco de Dados\n\n- **Schema**: `contratos` (PostgreSQL)\n    \n- **Tabela Principal**: `contratos`\n    \n- **Índices**: Otimizados para consultas frequentes\n    \n- **Conexão**: Porta 5433 (desenvolvimento)\n    \n\n### 📊 Campos do Contrato\n\n#### 🆔 Identificação\n\n- **NumeroContrato**: Identificador único (string, 50 chars)\n    \n- **ProcessoSei**: Número do processo administrativo\n    \n- **Id**: GUID interno do sistema\n    \n\n#### 📄 Objeto Contratual\n\n- **CategoriaObjeto**: Categoria do objeto contratado\n    \n- **DescricaoObjeto**: Descrição detalhada do objeto\n    \n- **TipoContratacao**: Pregão, Licitação, Dispensa, Inexigibilidade\n    \n- **TipoContrato**: Compra, Prestação de Serviço, Fornecimento, Manutenção\n    \n\n#### 🏢 Gestão e Responsabilidades\n\n- **UnidadeDemandante**: Setor que solicitou a contratação\n    \n- **UnidadeGestora**: Setor responsável pela gestão\n    \n- **Contratacao**: Centralizada ou Descentralizada\n    \n\n#### ⏰ Vigência e Prazos\n\n- **VigenciaInicial**: Data de início do contrato\n    \n- **VigenciaFinal**: Data de término do contrato\n    \n- **PrazoInicialMeses**: Prazo inicial em meses\n    \n\n#### 💰 Aspectos Financeiros\n\n- **ValorGlobal**: Valor total do contrato (decimal 18,2)\n    \n- **FormaPagamento**: Modalidade de pagamento acordada\n    \n\n#### 📋 Documentação\n\n- **TipoTermoReferencia**: Processo Rio, Google Drive, Texto Livre\n    \n- **TermoReferencia**: Conteúdo ou link do termo de referência\n    \n- **VinculacaoPCA**: Vinculação ao Plano de Contratação Anual\n    \n\n#### 🔗 Relacionamentos\n\n- **EmpresaId**: GUID da empresa contratada\n    \n- **UnidadeSaudeId**: GUID da unidade demandante\n    \n- **Status**: Enum do status atual\n    \n\n### 🛠️ Padrões de Desenvolvimento\n\n#### 📦 DTOs (Data Transfer Objects)\n\n- **ContratoDto**: Representação completa para leitura\n    \n- **CriarContratoDto**: Dados necessários para criação\n    \n- **AtualizarContratoDto**: Dados permitidos para atualização\n    \n- **ResultadoPaginadoDto**: Wrapper para resultados paginados\n    \n\n#### 🔍 Validações FluentValidation\n\n- **CriarContratoDtoValidator**: Validações para criação\n    \n- **AtualizarContratoDtoValidator**: Validações para atualização\n    \n- **Mensagens Personalizadas**: Feedback claro para usuários\n    \n\n#### 🗄️ Repository Pattern\n\n- **IContratoRepositorio**: Interface para operações de dados\n    \n- **ContratoRepositorio**: Implementação com Entity Framework\n    \n- **Queries Otimizadas**: Performance e escalabilidade\n    \n\n### 🔐 Considerações de Segurança\n\n#### 🎫 Autenticação (TODO)\n\n- **JWT Tokens**: Autenticação via tokens JWT\n    \n- **Claims**: Informações de usuário e permissões\n    \n- **Refresh Tokens**: Renovação automática de sessões\n    \n\n#### 🛡️ Autorização (TODO)\n\n- **Role-Based**: Controle baseado em funções\n    \n- **Resource-Based**: Controle baseado em recursos\n    \n- **Audit Trail**: Rastreamento de todas as operações\n    \n\n### 📊 Monitoramento e Observabilidade\n\n#### 🏥 Health Checks\n\n- **Database**: Verificação de conectividade PostgreSQL\n    \n- **Dependencies**: Status dos microserviços relacionados\n    \n- **Custom**: Verificações específicas de negócio\n    \n\n#### 📝 Logging\n\n- **Structured**: Logs estruturados com Serilog\n    \n- **Correlation**: IDs de correlação para rastreamento\n    \n- **Performance**: Métricas de performance e uso\n    \n\n**Base URL de Desenvolvimento**: [http://localhost:7006](http://localhost:7006)  \n**Via Gateway YARP**: [http://localhost:7000](http://localhost:7000)  \n**Documentação Swagger**: [http://localhost:7006/swagger](http://localhost:7006/swagger)",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "42432115",
		"_collection_link": "https://subg33.postman.co/workspace/EGESTAO-Development-Team~90477acb-79b6-4626-845f-d1b239133c8b/collection/42497953-4be0ac0a-355b-4448-b05d-3ed180d96b1a?action=share&source=collection_link&creator=42432115"
	},
	"item": [
		{
			"name": "📋 CRUD Operações",
			"item": [
				{
					"name": "✅ Criar Novo Contrato",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"// Testes automatizados para criação de contrato",
									"pm.test(\"Status code é 201 Created\", function () {",
									"    pm.response.to.have.status(201);",
									"});",
									"",
									"pm.test(\"Response tem estrutura correta\", function () {",
									"    const responseJson = pm.response.json();",
									"    pm.expect(responseJson).to.have.property('id');",
									"    pm.expect(responseJson).to.have.property('numeroContrato');",
									"    pm.expect(responseJson).to.have.property('status');",
									"});",
									"",
									"pm.test(\"Contrato criado com status Ativo\", function () {",
									"    const responseJson = pm.response.json();",
									"    pm.expect(responseJson.status).to.equal('Ativo');",
									"});",
									"",
									"// Salvar ID do contrato criado para usar em outros requests",
									"if (pm.response.code === 201) {",
									"    const responseJson = pm.response.json();",
									"    pm.environment.set('contratoId', responseJson.id);",
									"    pm.environment.set('numeroContrato', responseJson.numeroContrato);",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"numeroContrato\": \"CT-{{$timestamp}}\",\n  \"processoSei\": \"SEI-2024-{{$randomInt}}\",\n  \"categoriaObjeto\": \"Prestacao_Servico\",\n  \"descricaoObjeto\": \"Contratação de serviços de limpeza e conservação para as unidades de saúde do município, incluindo fornecimento de materiais e equipamentos necessários.\",\n  \"tipoContratacao\": \"Pregao\",\n  \"tipoContrato\": \"Prestacao_Servico\",\n  \"unidadeDemandanteId\": \"{{unidadeDemandanteId}}\",\n  \"unidadeGestoraId\": \"{{unidadeGestoraId}}\",\n  \"contratacao\": \"Centralizada\",\n  \"vigenciaInicial\": \"2024-01-01\",\n  \"vigenciaFinal\": \"2024-12-31\",\n  \"prazoInicialMeses\": 12,\n  \"valorGlobal\": 150000.00,\n  \"formaPagamento\": \"Mensal, mediante apresentação de nota fiscal\",\n  \"tipoTermoReferencia\": \"processo_rio\",\n  \"termoReferencia\": \"Processo Rio nº 12345/2024 - Contratação de serviços de limpeza\",\n  \"vinculacaoPCA\": \"PCA 2024 - Item 15: Serviços de Limpeza\",\n  \"empresaId\": \"{{empresaId}}\",\n  \"unidadesVinculadas\": [\n    {\n      \"unidadeSaudeId\": \"{{unidadeSaudeId}}\",\n      \"valorAtribuido\": 75000.00,\n      \"observacoes\": \"Unidade principal - maior demanda de serviços\"\n    }\n  ],\n  \"documentos\": [\n    {\n      \"tipoDocumento\": \"Contrato\",\n      \"urlDocumento\": \"https://processo.rio/docs/contrato-123456.pdf\",\n      \"dataEntrega\": \"2024-01-15\",\n      \"observacoes\": \"Contrato principal assinado pelas partes\"\n    },\n    {\n      \"tipoDocumento\": \"TermoReferencia\",\n      \"urlDocumento\": \"https://processo.rio/docs/termo-ref-123456.pdf\",\n      \"dataEntrega\": \"2024-01-10\",\n      \"observacoes\": \"Termo de referência técnico do objeto\"\n    }\n  ],\n  \"funcionarios\": [\n    {\n      \"funcionarioId\": \"{{gestorFuncionarioId}}\",\n      \"tipoGerencia\": \"Gestor\",\n      \"observacoes\": \"Gestor principal do contrato\"\n    },\n    {\n      \"funcionarioId\": \"{{fiscalFuncionarioId}}\",\n      \"tipoGerencia\": \"Fiscal\",\n      \"observacoes\": \"Fiscal técnico responsável\"\n    }\n  ]\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{devcac}}/api/contratos",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos"
							]
						},
						"description": "### 📋 Criar Novo Contrato\n\nEndpoint para cadastrar um novo contrato no sistema com todas as informações necessárias.\n\n---\n\n## 📄 DOCUMENTAÇÃO COMPLETA DE CADASTRO DE CONTRATOS\n\n### 🔥 CAMPOS OBRIGATÓRIOS\n\n#### 📋 Identificação (OBRIGATÓRIOS)\n- **`numeroContrato`** (string, máx 50 chars): Número único do contrato no sistema\n  - Exemplo: `\"CT-2024-001\"`, `\"PREGAO-2024-123\"`\n  - ✅ **ÚNICO NO SISTEMA** - não pode repetir\n- **`processoSei`** (string, máx 100 chars): Número do processo administrativo SEI\n  - Exemplo: `\"SEI-2024-001234\"`\n\n#### 🎯 Objeto do Contrato (OBRIGATÓRIOS)\n- **`categoriaObjeto`** (string, máx 100 chars): Categoria geral do objeto\n  - Valores sugeridos: `\"Prestacao_Servico\"`, `\"Fornecimento\"`, `\"Compra\"`, `\"Manutencao\"`\n- **`descricaoObjeto`** (string, máx 1000 chars): Descrição detalhada do objeto\n  - Exemplo: `\"Contratação de serviços de limpeza e conservação para unidades de saúde\"`\n\n#### 🏗️ Tipos e Classificações (OBRIGATÓRIOS)\n- **`tipoContratacao`** (enum string): **VALORES EXATOS:**\n  - `\"Licitacao\"` - Licitação tradicional\n  - `\"Pregao\"` - Pregão eletrônico/presencial  \n  - `\"Dispensa\"` - Dispensa de licitação\n  - `\"Inexigibilidade\"` - Inexigibilidade de licitação\n\n- **`tipoContrato`** (enum string): **VALORES EXATOS:**\n  - `\"Compra\"` - Aquisição de bens\n  - `\"Prestacao_Servico\"` - Prestação de serviços\n  - `\"Fornecimento\"` - Fornecimento contínuo\n  - `\"Manutencao\"` - Serviços de manutenção\n\n- **`contratacao`** (enum string): **VALORES EXATOS:**\n  - `\"Centralizada\"` - Contratação centralizada\n  - `\"Descentralizada\"` - Contratação descentralizada\n\n#### 🏢 Unidades Responsáveis (OBRIGATÓRIOS - MUDANÇA IMPORTANTE! 🔴)\n⚠️ **ATENÇÃO**: Agora são UUIDs (GUID), não mais strings!\n- **`unidadeDemandanteId`** (UUID): ID da unidade que solicitou a contratação\n  - Formato: `\"550e8400-e29b-41d4-a716-446655440001\"`\n  - ✅ Deve existir na API de Unidades de Saúde (porta 7004)\n- **`unidadeGestoraId`** (UUID): ID da unidade responsável pela gestão\n  - Formato: `\"550e8400-e29b-41d4-a716-446655440002\"`\n  - ✅ Deve existir na API de Unidades de Saúde (porta 7004)\n\n#### ⏰ Vigência e Prazos (OBRIGATÓRIOS)\n- **`vigenciaInicial`** (date): Data de início da vigência\n  - Formato: `\"2024-01-01\"` (ISO 8601)\n- **`vigenciaFinal`** (date): Data de término da vigência\n  - Formato: `\"2024-12-31\"` (ISO 8601)\n  - ✅ **DEVE SER POSTERIOR** à vigenciaInicial\n- **`prazoInicialMeses`** (int): Prazo inicial em meses\n  - Mínimo: 1, Máximo: 60\n  - Exemplo: `12` (12 meses)\n\n#### 💰 Aspectos Financeiros (OBRIGATÓRIOS)\n- **`valorGlobal`** (decimal): Valor total do contrato\n  - ✅ **DEVE SER > 0**\n  - Exemplo: `150000.00`\n- **`formaPagamento`** (string, máx 500 chars): Forma de pagamento\n  - Exemplo: `\"Mensal, mediante apresentação de nota fiscal\"`\n\n#### 📋 Documentação (OBRIGATÓRIOS)\n- **`tipoTermoReferencia`** (enum string): **VALORES EXATOS:**\n  - `\"processo_rio\"` - Link do Processo.Rio\n  - `\"google_drive\"` - Link do Google Drive\n  - `\"texto_livre\"` - Texto livre\n- **`termoReferencia`** (string, máx 2000 chars): Conteúdo/link do termo\n  - Exemplo: `\"Processo Rio nº 12345/2024 - Contratação de serviços\"`\n- **`vinculacaoPCA`** (string, máx 50 chars): Vinculação ao Plano de Contratação Anual\n  - Exemplo: `\"PCA 2024 - Item 15\"`\n\n#### 🔗 Relacionamentos (OBRIGATÓRIOS)\n- **`empresaId`** (UUID): ID da empresa contratada\n  - Formato: `\"550e8400-e29b-41d4-a716-446655440003\"`\n  - ✅ Deve existir na API de Empresas (porta 7002)\n\n---\n\n### 🔧 CAMPOS OPCIONAIS\n\n#### 🏥 Unidades Vinculadas (OPCIONAL)\n- **`unidadesVinculadas`** (array): Lista de unidades beneficiadas pelo contrato\n```json\n[\n  {\n    \"unidadeSaudeId\": \"uuid-da-unidade\",\n    \"valorAtribuido\": 50000.00,\n    \"vigenciaInicialUnidade\": \"2024-01-01\",\n    \"vigenciaFinalUnidade\": \"2024-12-31\",\n    \"observacoes\": \"Unidade principal\"\n  }\n]\n```\n\n#### 📄 Documentos (OPCIONAL)\n- **`documentos`** (array): Lista de documentos do contrato\n```json\n[\n  {\n    \"tipoDocumento\": \"Contrato\",\n    \"urlDocumento\": \"https://processo.rio/docs/contrato.pdf\",\n    \"dataEntrega\": \"2024-01-15\",\n    \"observacoes\": \"Contrato principal assinado\"\n  }\n]\n```\n\n**Tipos de Documento disponíveis:**\n- `\"Contrato\"` - Contrato principal\n- `\"TermoReferencia\"` - Termo de referência\n- `\"Proposta\"` - Proposta comercial\n- `\"NotaEmpenho\"` - Nota de empenho\n- `\"OrdemServico\"` - Ordem de serviço\n- `\"Outro\"` - Outros documentos\n\n#### 👥 Funcionários (OPCIONAL)\n- **`funcionarios`** (array): Lista de funcionários responsáveis\n```json\n[\n  {\n    \"funcionarioId\": \"uuid-funcionario\",\n    \"tipoGerencia\": \"Gestor\",\n    \"observacoes\": \"Gestor principal do contrato\"\n  }\n]\n```\n\n**Tipos de Gerência disponíveis:**\n- `\"Gestor\"` - Responsável pela gestão geral\n- `\"Fiscal\"` - Responsável pela fiscalização técnica\n\n---\n\n### ✅ VALIDAÇÕES E REGRAS DE NEGÓCIO\n\n#### 🔒 Validações Críticas\n- **Número único**: `numeroContrato` deve ser único no sistema\n- **Datas consistentes**: `vigenciaFinal > vigenciaInicial`\n- **Valor positivo**: `valorGlobal > 0`\n- **Prazo válido**: `1 <= prazoInicialMeses <= 60`\n- **IDs válidos**: Todos os UUIDs devem ser válidos e existir nos respectivos sistemas\n\n#### 🔗 Integrações Validadas\n- **Empresas API** (porta 7002): Validação do `empresaId`\n- **Unidades API** (porta 7004): Validação de `unidadeDemandanteId` e `unidadeGestoraId`\n- **Funcionários API** (porta 7008): Validação dos `funcionarioId` informados\n\n#### 📊 Status Automático\nO status é calculado automaticamente baseado nas datas:\n- **Ativo**: Data atual entre vigência inicial e final\n- **Vencendo**: Próximo ao vencimento (30 dias)\n- **Vencido**: Data atual > vigência final\n\n---\n\n### 📊 EXEMPLO COMPLETO DE REQUISIÇÃO\n\n```json\n{\n  \"numeroContrato\": \"CT-2024-001\",\n  \"processoSei\": \"SEI-2024-001234\",\n  \"categoriaObjeto\": \"Prestacao_Servico\",\n  \"descricaoObjeto\": \"Contratação de serviços de limpeza e conservação\",\n  \"tipoContratacao\": \"Pregao\",\n  \"tipoContrato\": \"Prestacao_Servico\",\n  \"unidadeDemandanteId\": \"550e8400-e29b-41d4-a716-446655440001\",\n  \"unidadeGestoraId\": \"550e8400-e29b-41d4-a716-446655440002\",\n  \"contratacao\": \"Centralizada\",\n  \"vigenciaInicial\": \"2024-01-01\",\n  \"vigenciaFinal\": \"2024-12-31\",\n  \"prazoInicialMeses\": 12,\n  \"valorGlobal\": 150000.00,\n  \"formaPagamento\": \"Mensal mediante nota fiscal\",\n  \"tipoTermoReferencia\": \"processo_rio\",\n  \"termoReferencia\": \"Processo Rio nº 12345/2024\",\n  \"vinculacaoPCA\": \"PCA 2024 - Item 15\",\n  \"empresaId\": \"550e8400-e29b-41d4-a716-446655440003\"\n}\n```\n\n---\n\n### ⚠️ ERROS COMUNS\n\n#### 400 Bad Request\n- Campos obrigatórios faltantes\n- Formatos de data/UUID inválidos\n- Valores de enum incorretos\n- Violação de validações (ex: valorGlobal <= 0)\n\n#### 409 Conflict\n- Número de contrato já existe no sistema\n\n#### 404 Not Found\n- EmpresaId não encontrado na API de Empresas\n- UnidadeDemandanteId/UnidadeGestoraId não encontrados na API de Unidades\n- FuncionarioId não encontrado na API de Funcionários\n\n#### 422 Unprocessable Entity\n- Vigência final anterior à inicial\n- Prazo em meses fora dos limites (1-60)\n- Documentos duplicados do mesmo tipo\n\n---\n\n### 🎯 DICAS IMPORTANTES\n\n1. **🔴 MUDANÇA CRÍTICA**: `unidadeDemandante` e `unidadeGestora` agora são UUIDs (`unidadeDemandanteId` e `unidadeGestoraId`)\n2. **Teste a integração**: Certifique-se que os IDs existem nas respectivas APIs\n3. **Valores de enum**: Use exatamente os valores documentados (case-sensitive)\n4. **Datas**: Use formato ISO 8601 (YYYY-MM-DD)\n5. **UUIDs**: Use formato padrão (8-4-4-4-12)\n6. **Decimais**: Use ponto como separador decimal\n\n---\n\n### 📊 Resposta de Sucesso (201)\n```json\n{\n  \"id\": \"guid-do-contrato\",\n  \"numeroContrato\": \"CT-2024-001\",\n  \"status\": \"Ativo\",\n  \"valorGlobal\": 150000.00,\n  \"vigenciaInicial\": \"2024-01-01\",\n  \"vigenciaFinal\": \"2024-12-31\",\n  \"empresaId\": \"550e8400-e29b-41d4-a716-446655440003\",\n  \"unidadeDemandanteId\": \"550e8400-e29b-41d4-a716-446655440001\",\n  \"unidadeGestoraId\": \"550e8400-e29b-41d4-a716-446655440002\",\n  \"unidadeDemandanteNome\": \"Secretaria Municipal de Saúde\",\n  \"unidadeGestoraNome\": \"Departamento de Contratos\",\n  \"dataCadastro\": \"2024-01-01T10:00:00Z\"\n}\n```"
					},
					"response": []
				},
				{
					"name": "🔍 Buscar Contrato por ID",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code é 200 ou 404\", function () {",
									"    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
									"});",
									"",
									"if (pm.response.code === 200) {",
									"    pm.test(\"Response contém dados do contrato\", function () {",
									"        const responseJson = pm.response.json();",
									"        pm.expect(responseJson).to.have.property('id');",
									"        pm.expect(responseJson).to.have.property('numeroContrato');",
									"        pm.expect(responseJson).to.have.property('status');",
									"        pm.expect(responseJson).to.have.property('valorGlobal');",
									"    });",
									"}",
									"",
									"if (pm.response.code === 404) {",
									"    pm.test(\"Mensagem de erro apropriada\", function () {",
									"        pm.expect(pm.response.text()).to.include('não encontrado');",
									"    });",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}"
							]
						},
						"description": "### 🔍 Buscar Contrato por ID\n\nEndpoint para consultar um contrato específico através do seu ID único.\n\n#### 🎯 Funcionalidades\n- **Busca Precisa**: Localiza contrato pelo GUID único\n- **Dados Completos**: Retorna todas as informações do contrato\n- **Relacionamentos**: Inclui dados das entidades relacionadas\n- **Status Atualizado**: Mostra status atual baseado na vigência\n\n#### 📊 Resposta de Sucesso (200)\n```json\n{\n  \"id\": \"guid-do-contrato\",\n  \"numeroContrato\": \"CT-123456\",\n  \"processoSei\": \"SEI-2024-001\",\n  \"categoriaObjeto\": \"Prestação de Serviços\",\n  \"descricaoObjeto\": \"Descrição detalhada do objeto\",\n  \"tipoContratacao\": \"Pregao\",\n  \"tipoContrato\": \"PrestacaoServico\",\n  \"unidadeDemandanteId\": \"550e8400-e29b-41d4-a716-446655440001\",\n  \"unidadeGestoraId\": \"550e8400-e29b-41d4-a716-446655440002\",\n  \"unidadeDemandanteNome\": \"Secretaria de Saúde\",\n  \"unidadeGestoraNome\": \"Departamento de Contratos\",\n  \"contratacao\": \"Centralizada\",\n  \"vigenciaInicial\": \"2024-01-01\",\n  \"vigenciaFinal\": \"2024-12-31\",\n  \"prazoInicialMeses\": 12,\n  \"valorGlobal\": 150000.00,\n  \"formaPagamento\": \"Mensal\",\n  \"tipoTermoReferencia\": \"ProcessoRio\",\n  \"termoReferencia\": \"Processo Rio nº 123\",\n  \"vinculacaoPCA\": \"PCA 2024 - Item 15\",\n  \"status\": \"Ativo\",\n  \"empresaId\": \"guid-da-empresa\",\n  \"unidadeSaudeId\": \"guid-da-unidade\",\n  \"ativo\": true,\n  \"usuarioCadastroId\": \"guid-usuario\",\n  \"dataCadastro\": \"2024-01-01T10:00:00Z\",\n  \"dataAtualizacao\": \"2024-01-01T10:00:00Z\"\n}\n```\n\n#### ❌ Resposta de Erro (404)\n```json\n\"Contrato com ID {id} não encontrado\"\n```\n\n#### 💡 Casos de Uso\n- **Visualização Detalhada**: Exibir todos os dados de um contrato\n- **Edição**: Carregar dados para formulário de edição\n- **Auditoria**: Consultar histórico e informações de auditoria\n- **Relatórios**: Gerar relatórios específicos de um contrato\n\n#### 🔗 Próximos Passos\nApós obter os dados do contrato, você pode:\n- Usar `GET /api/documentos-contrato/contrato/{id}` para ver documentos\n- Usar `GET /api/contratos/{id}/funcionarios` para ver funcionários vinculados\n- Usar `GET /api/alteracoes-contratuais/contrato/{id}` para ver alterações"
					},
					"response": []
				},
				{
					"name": "🔄 Atualizar Contrato",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code é 200 ou 404\", function () {",
									"    pm.expect(pm.response.code).to.be.oneOf([200, 404]);",
									"});",
									"",
									"if (pm.response.code === 200) {",
									"    pm.test(\"Contrato atualizado com sucesso\", function () {",
									"        const responseJson = pm.response.json();",
									"        pm.expect(responseJson).to.have.property('id');",
									"        pm.expect(responseJson).to.have.property('dataAtualizacao');",
									"    });",
									"    ",
									"    pm.test(\"Data de atualização foi modificada\", function () {",
									"        const responseJson = pm.response.json();",
									"        const dataAtualizacao = new Date(responseJson.dataAtualizacao);",
									"        const agora = new Date();",
									"        const diffMinutos = (agora - dataAtualizacao) / (1000 * 60);",
									"        pm.expect(diffMinutos).to.be.below(5); // Atualizado nos últimos 5 minutos",
									"    });",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"processoSei\": \"SEI-2024-{{$randomInt}}-ATUALIZADO\",\n  \"categoriaObjeto\": \"Prestacao_Servico\",\n  \"descricaoObjeto\": \"Contratação de serviços de limpeza e conservação ATUALIZADA para as unidades de saúde do município, incluindo fornecimento de materiais, equipamentos e treinamento especializado.\",\n  \"tipoContratacao\": \"Pregao\",\n  \"tipoContrato\": \"Prestacao_Servico\",\n  \"unidadeDemandanteId\": \"{{unidadeDemandanteId}}\",\n  \"unidadeGestoraId\": \"{{unidadeGestoraId}}\",\n  \"contratacao\": \"Centralizada\",\n  \"vigenciaInicial\": \"2024-01-01\",\n  \"vigenciaFinal\": \"2024-12-31\",\n  \"prazoInicialMeses\": 12,\n  \"valorGlobal\": 175000.00,\n  \"formaPagamento\": \"Mensal, mediante apresentação de nota fiscal e relatório de atividades\",\n  \"tipoTermoReferencia\": \"processo_rio\",\n  \"termoReferencia\": \"Processo Rio nº 12345/2024 - Contratação de serviços de limpeza - REVISÃO 02\",\n  \"vinculacaoPCA\": \"PCA 2024 - Item 15: Serviços de Limpeza e Conservação Especializada\",\n  \"empresaId\": \"{{empresaId}}\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}"
							]
						},
						"description": "### 🔄 Atualizar Contrato\n\nEndpoint para modificar dados de um contrato existente no sistema.\n\n#### 🎯 Funcionalidades\n- **Atualização Parcial**: Permite modificar campos específicos\n- **Validação Completa**: Aplica todas as validações de negócio\n- **Controle de Edição**: Impede edição de contratos vencidos/encerrados\n- **Auditoria**: Registra usuário e data da modificação\n- **Status Automático**: Recalcula status baseado nas novas datas\n\n#### 🔒 Restrições de Edição\n- **Número do Contrato**: NÃO pode ser alterado após criação\n- **Contratos Vencidos**: NÃO podem ser editados\n- **Contratos Encerrados**: NÃO podem ser editados\n- **Campos de Auditoria**: Atualizados automaticamente pelo sistema\n\n#### ✅ Validações Aplicadas\n- **VigenciaFinal**: Deve ser posterior à VigenciaInicial\n- **ValorGlobal**: Deve ser maior que zero\n- **EmpresaId**: Deve existir no módulo de empresas\n- **TipoContratacao**: Deve ser um valor válido\n- **TipoContrato**: Deve ser um valor válido\n- **Status do Contrato**: Deve permitir edição\n\n#### 📊 Resposta de Sucesso (200)\n```json\n{\n  \"id\": \"guid-do-contrato\",\n  \"numeroContrato\": \"CT-123456\",\n  \"processoSei\": \"SEI-2024-001-ATUALIZADO\",\n  \"categoriaObjeto\": \"Prestação de Serviços Especializados\",\n  \"descricaoObjeto\": \"Descrição atualizada...\",\n  \"valorGlobal\": 175000.00,\n  \"status\": \"Ativo\",\n  \"usuarioAtualizacaoId\": \"guid-usuario\",\n  \"dataAtualizacao\": \"2024-01-15T14:30:00Z\",\n  \"dataCadastro\": \"2024-01-01T10:00:00Z\"\n}\n```\n\n#### ⚠️ Possíveis Erros\n- **400 Bad Request**: Dados inválidos\n- **404 Not Found**: Contrato não encontrado\n- **409 Conflict**: Contrato não pode ser editado (vencido/encerrado)\n- **422 Unprocessable Entity**: Violação de regras de negócio\n\n#### 💡 Dicas de Uso\n- **Verificar Status**: Sempre verificar se o contrato pode ser editado\n- **Campos Obrigatórios**: Incluir todos os campos obrigatórios\n- **Valores Monetários**: Usar decimal com 2 casas decimais\n- **Datas**: Usar formato ISO 8601 (YYYY-MM-DD)\n\n#### 🔄 Impactos da Atualização\n- **Status**: Pode ser recalculado baseado nas novas datas\n- **Relacionamentos**: Validações com empresas e unidades são refeitas\n- **Histórico**: Alteração é registrada para auditoria\n- **Notificações**: Gestores podem ser notificados (futuro)"
					},
					"response": []
				},
				{
					"name": "🗑️ Excluir Contrato (Soft Delete)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code é 204 ou 404\", function () {",
									"    pm.expect(pm.response.code).to.be.oneOf([204, 404]);",
									"});",
									"",
									"if (pm.response.code === 204) {",
									"    pm.test(\"Contrato removido com sucesso\", function () {",
									"        pm.expect(pm.response.text()).to.equal('');",
									"    });",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "DELETE",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}"
							]
						},
						"description": "### 🗑️ Excluir Contrato (Soft Delete)\n\nEndpoint para remover logicamente um contrato do sistema.\n\n#### 🛡️ Exclusão Lógica (Soft Delete)\n- **Preservação de Dados**: Contrato não é fisicamente removido do banco\n- **Campo Ativo**: Marcado como `ativo = false`\n- **Auditoria Completa**: Registra usuário e data da exclusão\n- **Recuperação**: Possível restaurar via administração\n- **Integridade**: Preserva relacionamentos e histórico\n\n#### ⚖️ Regras de Negócio\n- **Qualquer Status**: Contratos de qualquer status podem ser excluídos\n- **Relacionamentos**: Documentos e vinculações são preservados\n- **Histórico**: Todo histórico de alterações é mantido\n- **Auditoria**: Registra motivo e responsável pela exclusão\n\n#### ✅ Validações\n- **Existência**: Verifica se o contrato existe\n- **Permissões**: Valida se usuário pode excluir (futuro)\n- **Dependências**: Verifica impactos em outros módulos (futuro)\n\n#### 📊 Resposta de Sucesso (204)\n```\nSem conteúdo - operação realizada com sucesso\n```\n\n#### ❌ Resposta de Erro (404)\n```json\n\"Contrato com ID {id} não encontrado\"\n```\n\n#### 🔄 Impactos da Exclusão\n- **Listagens**: Contrato não aparece mais em consultas normais\n- **Busca por ID**: Retorna 404 Not Found\n- **Relatórios**: Excluído dos relatórios padrão\n- **Integrações**: Status propagado para outros módulos\n\n#### 💡 Alternativas\n- **Suspensão**: Use `PATCH /api/contratos/{id}/suspender` para suspensão temporária\n- **Encerramento**: Use `PATCH /api/contratos/{id}/encerrar` para encerramento definitivo\n- **Restauração**: Contacte administrador para restaurar contrato\n\n#### 🔐 Considerações de Segurança\n- **Log de Auditoria**: Todas as exclusões são registradas\n- **Rastreabilidade**: Possível identificar quem e quando excluiu\n- **Backup**: Dados preservados para compliance e auditoria\n\n#### ⚠️ Atenção\nEsta operação:\n- ✅ É REVERSÍVEL (soft delete)\n- ✅ Mantém integridade dos dados\n- ✅ Preserva histórico completo\n- ❌ Não remove fisicamente do banco\n- ❌ Não impacta relacionamentos existentes"
					},
					"response": []
				}
			],
			"description": "Operações básicas de Create, Read, Update e Delete para contratos"
		},
		{
			"name": "🔍 Consultas e Filtros",
			"item": [
				{
					"name": "📄 Listar Todos os Contratos (Paginado)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"pm.test(\"Status code é 200\", function () {",
									"    pm.response.to.have.status(200);",
									"});",
									"",
									"pm.test(\"Response tem estrutura paginada\", function () {",
									"    const responseJson = pm.response.json();",
									"    pm.expect(responseJson).to.have.property('items');",
									"    pm.expect(responseJson).to.have.property('total');",
									"    pm.expect(responseJson).to.have.property('pagina');",
									"    pm.expect(responseJson).to.have.property('tamanhoPagina');",
									"    pm.expect(responseJson).to.have.property('totalPaginas');",
									"});",
									"",
									"pm.test(\"Items é um array\", function () {",
									"    const responseJson = pm.response.json();",
									"    pm.expect(responseJson.items).to.be.an('array');",
									"});",
									"",
									"pm.test(\"Paginação está correta\", function () {",
									"    const responseJson = pm.response.json();",
									"    pm.expect(responseJson.pagina).to.be.at.least(1);",
									"    pm.expect(responseJson.tamanhoPagina).to.be.at.most(100);",
									"    pm.expect(responseJson.totalPaginas).to.be.at.least(0);",
									"});"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos?pagina=1&tamanhoPagina=20&filtroStatus=Ativo&dataInicialDe=2024-01-01&dataInicialAte=2024-12-31&valorMinimo=10000&valorMaximo=1000000&termoPesquisa=limpeza",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos"
							],
							"query": [
								{
									"key": "pagina",
									"value": "1",
									"description": "Número da página (padrão: 1)"
								},
								{
									"key": "tamanhoPagina",
									"value": "20",
									"description": "Itens por página (padrão: 20, máximo: 100)"
								},
								{
									"key": "filtroStatus",
									"value": "Ativo",
									"description": "Filtro por status: Ativo, Vencendo, Vencido, Suspenso, Encerrado"
								},
								{
									"key": "dataInicialDe",
									"value": "2024-01-01",
									"description": "Data inicial de vigência - início do período"
								},
								{
									"key": "dataInicialAte",
									"value": "2024-12-31",
									"description": "Data inicial de vigência - fim do período"
								},
								{
									"key": "dataFinalDe",
									"value": "",
									"description": "Data final de vigência - início do período",
									"disabled": true
								},
								{
									"key": "dataFinalAte",
									"value": "",
									"description": "Data final de vigência - fim do período",
									"disabled": true
								},
								{
									"key": "valorMinimo",
									"value": "10000",
									"description": "Valor mínimo do contrato"
								},
								{
									"key": "valorMaximo",
									"value": "1000000",
									"description": "Valor máximo do contrato"
								},
								{
									"key": "empresaId",
									"value": "",
									"description": "ID da empresa (GUID)",
									"disabled": true
								},
								{
									"key": "unidadeSaudeId",
									"value": "",
									"description": "ID da unidade de saúde (GUID)",
									"disabled": true
								},
								{
									"key": "termoPesquisa",
									"value": "limpeza",
									"description": "Termo para pesquisa textual em múltiplos campos"
								}
							]
						},
						"description": "### 📄 Listar Todos os Contratos (Paginado)\n\nEndpoint principal para listagem de contratos com sistema completo de filtros e paginação otimizada.\n\n#### 🎯 Funcionalidades\n- **Paginação Inteligente**: Performance otimizada para grandes volumes\n- **Filtros Avançados**: Sistema completo de filtros combinados\n- **Busca Textual**: Pesquisa em múltiplos campos simultaneamente\n- **Ordenação**: Resultados ordenados por data de atualização\n- **Performance**: Queries otimizadas com índices estratégicos\n\n#### 🔍 Filtros Disponíveis\n\n##### 📊 Por Status\n- **Ativo**: Contratos dentro da vigência\n- **Vencendo**: Próximos ao vencimento (30 dias)\n- **Vencido**: Com vigência expirada\n- **Suspenso**: Temporariamente suspensos\n- **Encerrado**: Finalizados definitivamente\n\n##### 📅 Por Período de Vigência\n- **dataInicialDe/Ate**: Filtra por data de início da vigência\n- **dataFinalDe/Ate**: Filtra por data de término da vigência\n- **Combinados**: Permite filtrar períodos complexos\n\n##### 💰 Por Valor\n- **valorMinimo**: Valor mínimo do contrato\n- **valorMaximo**: Valor máximo do contrato\n- **Faixas**: Ideal para análises por porte de contrato\n\n##### 🏢 Por Entidades\n- **empresaId**: Filtra por fornecedor específico\n- **unidadeSaudeId**: Filtra por unidade demandante\n- **Integração**: Valida existência nas respectivas APIs\n\n##### 🔎 Busca Textual\n- **termoPesquisa**: Busca em múltiplos campos:\n  - Número do contrato\n  - Processo SEI\n  - Descrição do objeto\n  - Unidade demandante\n  - Unidade gestora\n  - Forma de pagamento\n  - Termo de referência\n\n#### 📊 Estrutura de Resposta\n```json\n{\n  \"items\": [\n    {\n      \"id\": \"guid-contrato\",\n      \"numeroContrato\": \"CT-123456\",\n      \"processoSei\": \"SEI-2024-001\",\n      \"categoriaObjeto\": \"Prestação de Serviços\",\n      \"descricaoObjeto\": \"Descrição do objeto\",\n      \"status\": \"Ativo\",\n      \"valorGlobal\": 150000.00,\n      \"vigenciaInicial\": \"2024-01-01\",\n      \"vigenciaFinal\": \"2024-12-31\",\n      \"empresaId\": \"guid-empresa\",\n      \"unidadeSaudeId\": \"guid-unidade\"\n    }\n  ],\n  \"total\": 150,\n  \"pagina\": 1,\n  \"tamanhoPagina\": 20,\n  \"totalPaginas\": 8,\n  \"temProximaPagina\": true,\n  \"temPaginaAnterior\": false\n}\n```\n\n#### 📈 Otimizações de Performance\n- **Índices Estratégicos**: Em campos frequentemente filtrados\n- **Paginação Server-Side**: Reduz transferência de dados\n- **Queries Otimizadas**: Evita N+1 queries\n- **Cache Inteligente**: Cache de consultas frequentes (futuro)\n\n#### 💡 Casos de Uso\n- **Dashboard Administrativo**: Visão geral dos contratos\n- **Relatórios Gerenciais**: Base para relatórios diversos\n- **Auditoria**: Consultas para compliance e auditoria\n- **Gestão Operacional**: Acompanhamento diário de contratos\n\n#### 📱 Responsividade\n- **Mobile-First**: Otimizado para dispositivos móveis\n- **Lazy Loading**: Carregamento sob demanda (frontend)\n- **Filtros Persistentes**: Mantém filtros entre sessões (frontend)\n\n#### 🔧 Parâmetros de Paginação\n- **pagina**: Número da página (mínimo: 1)\n- **tamanhoPagina**: Itens por página (máximo: 100)\n- **Padrões**: pagina=1, tamanhoPagina=20\n- **Limitações**: Máximo 100 itens por página para performance\n\n#### ⚡ Dicas de Performance\n- **Filtros Específicos**: Use filtros para reduzir resultados\n- **Paginação Adequada**: Não solicite páginas muito grandes\n- **Cache Frontend**: Implemente cache no frontend\n- **Debounce**: Use debounce em buscas textuais"
					},
					"response": []
				},
				{
					"name": "🔢 Buscar por Número do Contrato",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/numero/{{numeroContrato}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"numero",
								"{{numeroContrato}}"
							]
						},
						"description": "### 🔢 Buscar por Número do Contrato\n\nEndpoint para localizar um contrato através do seu número único.\n\n#### 🎯 Funcionalidades\n- **Busca Única**: Localiza contrato pelo número (único no sistema)\n- **Interface Amigável**: Busca pelo campo que usuários conhecem\n- **Validação**: Garante unicidade do número no sistema\n- **Performance**: Busca otimizada com índice único\n\n#### 💡 Casos de Uso\n- **Consulta Rápida**: Usuários conhecem o número do contrato\n- **Integração Externa**: Sistemas externos usam número como referência\n- **Suporte**: Atendimento ao usuário via número do contrato\n- **Auditoria**: Rastreamento por número em documentos oficiais"
					},
					"response": []
				},
				{
					"name": "🏢 Contratos por Empresa",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/empresa/{{empresaId}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"empresa",
								"{{empresaId}}"
							]
						},
						"description": "### 🏢 Contratos por Empresa\n\nEndpoint para listar todos os contratos de uma empresa específica.\n\n#### 🎯 Funcionalidades\n- **Visão por Fornecedor**: Lista todos contratos de uma empresa\n- **Gestão de Fornecedores**: Acompanhamento de performance por empresa\n- **Análise Contratual**: Histórico de relacionamento comercial\n- **Compliance**: Verificação de limites por fornecedor\n\n#### 📊 Informações Retornadas\n- **Contratos Ativos**: Status atual de cada contrato\n- **Valores Totais**: Soma dos valores por empresa\n- **Períodos**: Vigências atuais e históricas\n- **Tipos**: Diversidade de objetos contratados\n\n#### 💡 Casos de Uso\n- **Gestão de Fornecedores**: Avaliação de performance\n- **Análise Financeira**: Concentração de gastos por fornecedor\n- **Renovações**: Histórico para decisões de renovação\n- **Auditoria**: Compliance e transparência"
					},
					"response": []
				},
				{
					"name": "🏥 Contratos por Unidade de Saúde",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/unidade-saude/{{unidadeSaudeId}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"unidade-saude",
								"{{unidadeSaudeId}}"
							]
						},
						"description": "### 🏥 Contratos por Unidade de Saúde\n\nEndpoint para listar todos os contratos de uma unidade de saúde específica.\n\n#### 🎯 Funcionalidades\n- **Visão por Unidade**: Lista contratos por unidade demandante\n- **Gestão Localizada**: Contratos específicos de cada unidade\n- **Orçamento Local**: Acompanhamento de gastos por unidade\n- **Planejamento**: Base para renovações e novos contratos\n\n#### 📊 Análises Possíveis\n- **Distribuição de Recursos**: Como recursos são alocados\n- **Tipos de Serviços**: Quais serviços cada unidade consome\n- **Sazonalidade**: Padrões temporais por unidade\n- **Eficiência**: Comparação entre unidades similares"
					},
					"response": []
				},
				{
					"name": "⏰ Contratos Vencendo",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/vencendo?diasAntecipados=30",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"vencendo"
							],
							"query": [
								{
									"key": "diasAntecipados",
									"value": "30",
									"description": "Número de dias para considerar como 'vencendo' (padrão: 30)"
								}
							]
						},
						"description": "### ⏰ Contratos Vencendo\n\nEndpoint para listar contratos que estão próximos ao vencimento.\n\n#### 🎯 Funcionalidades\n- **Alerta Preventivo**: Identifica contratos próximos ao fim\n- **Gestão Proativa**: Permite planejamento de renovações\n- **Continuidade**: Evita interrupção de serviços essenciais\n- **Configurável**: Dias de antecedência personalizáveis\n\n#### ⚙️ Parâmetros\n- **diasAntecipados**: Quantos dias antes do vencimento considerar\n- **Padrão**: 30 dias (configurável por instalação)\n- **Flexível**: Pode ser 15, 45, 60 dias conforme necessidade\n\n#### 🚨 Importância\n- **Serviços Essenciais**: Evita descontinuidade em saúde pública\n- **Planejamento**: Tempo para preparar renovações ou licitações\n- **Orçamento**: Preparação orçamentária para renovações\n- **Compliance**: Atendimento a prazos legais"
					},
					"response": []
				},
				{
					"name": "❌ Contratos Vencidos",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/vencidos",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"vencidos"
							]
						},
						"description": "### ❌ Contratos Vencidos\n\nEndpoint para listar contratos com vigência já expirada.\n\n#### 🎯 Funcionalidades\n- **Situação Crítica**: Identifica contratos vencidos\n- **Ação Corretiva**: Permite ações emergenciais\n- **Auditoria**: Controle de compliance temporal\n- **Gestão de Risco**: Identificação de exposições\n\n#### 🚨 Implicações\n- **Risco Operacional**: Serviços podem estar comprometidos\n- **Risco Legal**: Possível irregularidade contratual\n- **Ação Urgente**: Requer providências imediatas\n- **Histórico**: Base para análise de gestão de contratos\n\n#### 💡 Ações Recomendadas\n- **Verificar Status Real**: Confirmar se realmente venceu\n- **Renovação Emergencial**: Se serviço ainda ativo\n- **Encerramento**: Se serviço já foi descontinuado\n- **Análise de Causa**: Por que não foi renovado a tempo"
					},
					"response": []
				}
			],
			"description": "Endpoints para consultas avançadas e filtros específicos"
		},
		{
			"name": "⚙️ Operações Especiais",
			"item": [
				{
					"name": "⏸️ Suspender Contrato",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/suspender",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"suspender"
							]
						},
						"description": "### ⏸️ Suspender Contrato\n\nEndpoint para suspender temporariamente um contrato.\n\n#### 🎯 Funcionalidades\n- **Suspensão Temporária**: Interrompe contrato sem encerrar\n- **Reversível**: Pode ser reativado posteriormente\n- **Status Controlado**: Altera status para 'Suspenso'\n- **Auditoria**: Registra usuário e data da suspensão\n\n#### ⚖️ Casos de Uso\n- **Problemas Temporários**: Questões contratuais temporárias\n- **Auditoria em Andamento**: Suspensão durante investigações\n- **Problemas de Performance**: Fornecedor com problemas temporários\n- **Questões Orçamentárias**: Suspensão por contingenciamento\n\n#### 🔄 Próximos Passos\nApós suspensão, use:\n- `PATCH /api/contratos/{id}/reativar` para reativar\n- `PATCH /api/contratos/{id}/encerrar` para encerrar definitivamente"
					},
					"response": []
				},
				{
					"name": "▶️ Reativar Contrato",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/reativar",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"reativar"
							]
						},
						"description": "### ▶️ Reativar Contrato\n\nEndpoint para reativar um contrato previamente suspenso.\n\n#### 🎯 Funcionalidades\n- **Reativação**: Retorna contrato suspenso ao status ativo\n- **Validação de Vigência**: Verifica se ainda está dentro do prazo\n- **Status Automático**: Calcula status baseado na data atual\n- **Continuidade**: Retoma execução do contrato\n\n#### ✅ Validações\n- **Status Atual**: Deve estar 'Suspenso'\n- **Vigência**: Deve ainda estar dentro do prazo\n- **Condições**: Problemas que causaram suspensão devem estar resolvidos\n\n#### 🔄 Status Resultante\n- **Ativo**: Se dentro da vigência normal\n- **Vencendo**: Se próximo ao vencimento\n- **Vencido**: Se a vigência já expirou durante suspensão"
					},
					"response": []
				},
				{
					"name": "🔒 Encerrar Contrato",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/encerrar",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"encerrar"
							]
						},
						"description": "### 🔒 Encerrar Contrato\n\nEndpoint para encerrar definitivamente um contrato.\n\n#### 🎯 Funcionalidades\n- **Encerramento Definitivo**: Finaliza contrato permanentemente\n- **Irreversível**: Não pode ser reativado após encerramento\n- **Status Final**: Altera status para 'Encerrado'\n- **Bloqueio de Edição**: Contrato fica somente leitura\n\n#### ⚖️ Casos de Uso\n- **Término Antecipado**: Encerramento antes do prazo\n- **Rescisão Amigável**: Acordo entre as partes\n- **Problemas Graves**: Questões contratuais graves\n- **Substituição**: Substituição por novo contrato\n\n#### 🚨 Atenção\n- **Definitivo**: Operação não pode ser desfeita\n- **Impactos**: Pode afetar prestação de serviços\n- **Documentação**: Documente bem o motivo do encerramento\n- **Sucessão**: Considere contratos substitutos"
					},
					"response": []
				},
				{
					"name": "🔄 Atualizar Status de Todos os Contratos",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/atualizar-status",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"atualizar-status"
							]
						},
						"description": "### 🔄 Atualizar Status de Todos os Contratos\n\nEndpoint para recalcular o status de todos os contratos baseado nas datas de vigência.\n\n#### 🎯 Funcionalidades\n- **Atualização em Lote**: Processa todos os contratos\n- **Cálculo Automático**: Baseado na data atual vs vigência\n- **Performance**: Operação otimizada para grande volume\n- **Manutenção**: Ideal para execução agendada (cron job)\n\n#### 📊 Lógica de Cálculo\n- **Ativo**: Data atual entre vigência inicial e final\n- **Vencendo**: Dentro de 30 dias do vencimento\n- **Vencido**: Data atual posterior à vigência final\n- **Suspenso/Encerrado**: Mantém status se definido manualmente\n\n#### 🕐 Quando Executar\n- **Diariamente**: Recomendado via cron job\n- **Após Manutenção**: Depois de alterações em lote\n- **Início do Mês**: Rotina administrativa mensal\n- **Sob Demanda**: Quando necessário recálculo imediato\n\n#### ⚡ Performance\n- **Otimizado**: Query única para todos os contratos\n- **Rápido**: Operação em memória com batch update\n- **Seguro**: Não altera contratos encerrados/suspensos manualmente\n\n#### 💡 Automação\nIdeal para:\n```bash\n# Cron job diário às 06:00\n0 6 * * * curl -X POST http://localhost:7006/api/contratos/atualizar-status\n```"
					},
					"response": []
				}
			],
			"description": "Operações de gestão, controle de status e funções administrativas"
		},
		{
			"name": "👥 Gestão de Funcionários",
			"item": [
				{
					"name": "👨‍💼 Adicionar Funcionário ao Contrato",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"funcionarioId\": \"{{funcionarioId}}\",\n  \"tipoGerencia\": 1,\n  \"observacoes\": \"Gestor principal do contrato - responsável pelo acompanhamento diário da execução e pela comunicação com o fornecedor.\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/funcionarios",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"funcionarios"
							]
						},
						"description": "### 👨‍💼 Adicionar Funcionário ao Contrato\n\nEndpoint para vincular funcionários (gestores ou fiscais) a um contrato específico.\n\n#### 🎯 Funcionalidades\n- **Gestão de Pessoas**: Vincula responsáveis ao contrato\n- **Tipos de Gerência**: Gestor (1) ou Fiscal (2)\n- **Validação**: Verifica existência do funcionário\n- **Flexibilidade**: Permite múltiplos funcionários por tipo\n\n#### 👥 Tipos de Gerência\n- **1 - Gestor**: Responsável pela gestão geral do contrato\n- **2 - Fiscal**: Responsável pela fiscalização técnica\n\n#### ✅ Validações\n- **Funcionário Existente**: Verifica no módulo de funcionários\n- **Funcionário Ativo**: Deve estar ativo no sistema\n- **Duplicação**: Previne vinculação duplicada\n- **Contrato Válido**: Contrato deve existir e permitir edição\n\n#### 📋 Campos\n- **funcionarioId**: GUID do funcionário (obrigatório)\n- **tipoGerencia**: 1=Gestor, 2=Fiscal (obrigatório)\n- **observacoes**: Observações sobre a função (opcional)\n\n#### 💡 Casos de Uso\n- **Início do Contrato**: Definir responsáveis desde o início\n- **Mudança de Equipe**: Alterações na equipe de gestão\n- **Substituições**: Férias, licenças, transferências\n- **Múltiplos Responsáveis**: Equipe de gestão compartilhada"
					},
					"response": []
				},
				{
					"name": "🗑️ Remover Funcionário do Contrato",
					"request": {
						"method": "DELETE",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/funcionarios/{{funcionarioId}}?tipoGerencia=1",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"funcionarios",
								"{{funcionarioId}}"
							],
							"query": [
								{
									"key": "tipoGerencia",
									"value": "1",
									"description": "Tipo de gerência: 1=Gestor, 2=Fiscal"
								}
							]
						},
						"description": "### 🗑️ Remover Funcionário do Contrato\n\nEndpoint para desvincular um funcionário de um contrato específico.\n\n#### 🎯 Funcionalidades\n- **Desvinculação**: Remove funcionário do contrato\n- **Específico**: Remove vinculação específica (funcionário + tipo)\n- **Auditoria**: Mantém histórico da remoção\n- **Flexível**: Permite manter outros tipos de vinculação\n\n#### 📋 Parâmetros\n- **contratoId**: GUID do contrato\n- **funcionarioId**: GUID do funcionário\n- **tipoGerencia**: Tipo específico a ser removido\n\n#### 💡 Exemplo de Uso\nUm funcionário pode ser:\n- Gestor E Fiscal do mesmo contrato (duas vinculações)\n- Remover apenas uma das funções mantendo a outra\n- Substituição de gestor mantendo como fiscal"
					},
					"response": []
				},
				{
					"name": "👥 Listar Funcionários do Contrato",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/{{contratoId}}/funcionarios",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"{{contratoId}}",
								"funcionarios"
							],
							"query": [
								{
									"key": "tipoGerencia",
									"value": "1",
									"description": "Filtro por tipo: 1=Gestor, 2=Fiscal (opcional - sem filtro retorna todos)",
									"disabled": true
								}
							]
						},
						"description": "### 👥 Listar Funcionários do Contrato\n\nEndpoint para consultar todos os funcionários vinculados a um contrato.\n\n#### 🎯 Funcionalidades\n- **Lista Completa**: Todos os funcionários do contrato\n- **Filtro por Tipo**: Apenas gestores ou apenas fiscais\n- **Detalhes**: Informações completas de cada vinculação\n- **Hierarquia**: Organizado por tipo de gerência\n\n#### 🔍 Filtros\n- **Sem filtro**: Retorna todos os funcionários\n- **tipoGerencia=1**: Apenas gestores\n- **tipoGerencia=2**: Apenas fiscais\n\n#### 📊 Resposta\n```json\n[\n  {\n    \"funcionarioId\": \"guid-funcionario\",\n    \"tipoGerencia\": 1,\n    \"observacoes\": \"Gestor principal\",\n    \"dataCadastro\": \"2024-01-01T10:00:00Z\",\n    \"nomeCompleto\": \"João Silva\",\n    \"cargo\": \"Coordenador\"\n  }\n]\n```"
					},
					"response": []
				}
			],
			"description": "Endpoints para vincular e gerenciar funcionários (gestores e fiscais) nos contratos"
		},
		{
			"name": "📊 Relatórios e Estatísticas",
			"item": [
				{
					"name": "✅ Verificar Existência de Número",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/existe/{{numeroContrato}}",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"existe",
								"{{numeroContrato}}"
							]
						},
						"description": "### ✅ Verificar Existência de Número\n\nEndpoint para verificar se um número de contrato já existe no sistema.\n\n#### 🎯 Funcionalidades\n- **Validação Prévia**: Verifica antes de criar contrato\n- **Unicidade**: Garante que números sejam únicos\n- **Performance**: Consulta otimizada\n- **Interface Amigável**: Validação em tempo real\n\n#### 📊 Resposta\n```json\ntrue  // se existe\nfalse // se não existe\n```\n\n#### 💡 Casos de Uso\n- **Formulário de Criação**: Validação em tempo real\n- **Import de Dados**: Verificação antes de importar\n- **API Externa**: Validação por sistemas externos\n- **Auditoria**: Verificar duplicatas no sistema"
					},
					"response": []
				},
				{
					"name": "📈 Resumo de Contratos por Empresa",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"url": {
							"raw": "{{devcac}}/api/contratos/empresa/{{empresaId}}/resumo",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"empresa",
								"{{empresaId}}",
								"resumo"
							]
						},
						"description": "### 📈 Resumo de Contratos por Empresa\n\nEndpoint para obter resumo executivo dos contratos de uma empresa.\n\n#### 🎯 Funcionalidades\n- **Visão Executiva**: Números consolidados por empresa\n- **Gestão de Fornecedores**: Acompanhamento de performance\n- **Análise Financeira**: Valores totais por fornecedor\n- **Tomada de Decisão**: Base para renovações e licitações\n\n#### 📊 Resposta\n```json\n{\n  \"empresaId\": \"guid-empresa\",\n  \"contratosAtivos\": 5,\n  \"valorTotal\": 750000.00\n}\n```\n\n#### 💡 Métricas Incluídas\n- **contratosAtivos**: Quantidade de contratos ativos\n- **valorTotal**: Soma dos valores de todos contratos ativos\n- **empresaId**: Referência da empresa consultada"
					},
					"response": []
				},
				{
					"name": "📊 Resumo de Múltiplas Empresas",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Accept",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "[\n  \"{{empresaId}}\",\n  \"11111111-1111-1111-1111-111111111111\",\n  \"22222222-2222-2222-2222-222222222222\",\n  \"33333333-3333-3333-3333-333333333333\"\n]",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{devcac}}/api/contratos/empresas/resumo-lote",
							"host": [
								"{{devcac}}"
							],
							"path": [
								"api",
								"contratos",
								"empresas",
								"resumo-lote"
							]
						},
						"description": "### 📊 Resumo de Múltiplas Empresas\n\nEndpoint para obter resumo consolidado de contratos para múltiplas empresas em uma única consulta.\n\n#### 🎯 Funcionalidades\n- **Consulta em Lote**: Múltiplas empresas em uma requisição\n- **Performance**: Evita múltiplas chamadas individuais\n- **Dashboard**: Ideal para painéis executivos\n- **Comparação**: Facilita comparação entre fornecedores\n\n#### 📋 Entrada\nArray de GUIDs das empresas:\n```json\n[\n  \"guid-empresa-1\",\n  \"guid-empresa-2\",\n  \"guid-empresa-3\"\n]\n```\n\n#### 📊 Resposta\n```json\n[\n  {\n    \"empresaId\": \"guid-empresa-1\",\n    \"contratosAtivos\": 3,\n    \"valorTotal\": 450000.00\n  },\n  {\n    \"empresaId\": \"guid-empresa-2\",\n    \"contratosAtivos\": 2,\n    \"valorTotal\": 300000.00\n  }\n]\n```\n\n#### 💡 Casos de Uso\n- **Dashboard Executivo**: Visão geral de fornecedores\n- **Análise Comparativa**: Comparar performance entre empresas\n- **Relatórios Gerenciais**: Base para relatórios consolidados\n- **Auditoria**: Concentração de contratos por fornecedor"
					},
					"response": []
				}
			],
			"description": "Endpoints para relatórios, estatísticas e resumos executivos"
		}
	],
	"event": [
		{
			"listen": "prerequest",
			"script": {
				"type": "text/javascript",
				"exec": [
					"// Configurações globais para a collection",
					"",
					"// Define URL base se não estiver configurada",
					"if (!pm.environment.get('baseUrl')) {",
					"    pm.environment.set('baseUrl', 'http://localhost:7006');",
					"}",
					"",
					"// GUIDs de exemplo para testes (substituir pelos reais)",
					"if (!pm.environment.get('empresaId')) {",
					"    pm.environment.set('empresaId', '11111111-1111-1111-1111-111111111111');",
					"}",
					"",
					"if (!pm.environment.get('unidadeSaudeId')) {",
					"    pm.environment.set('unidadeSaudeId', '22222222-2222-2222-2222-222222222222');",
					"}",
					"",
					"if (!pm.environment.get('unidadeDemandanteId')) {",
					"    pm.environment.set('unidadeDemandanteId', '77777777-7777-7777-7777-777777777777');",
					"}",
					"",
					"if (!pm.environment.get('unidadeGestoraId')) {",
					"    pm.environment.set('unidadeGestoraId', '88888888-8888-8888-8888-888888888888');",
					"}",
					"",
					"if (!pm.environment.get('funcionarioId')) {",
					"    pm.environment.set('funcionarioId', '33333333-3333-3333-3333-333333333333');",
					"}",
					"",
					"if (!pm.environment.get('gestorFuncionarioId')) {",
					"    pm.environment.set('gestorFuncionarioId', '44444444-4444-4444-4444-444444444444');",
					"}",
					"",
					"if (!pm.environment.get('fiscalFuncionarioId')) {",
					"    pm.environment.set('fiscalFuncionarioId', '55555555-5555-5555-5555-555555555555');",
					"}",
					"",
					"// Log da configuração",
					"console.log('Base URL:', pm.environment.get('baseUrl'));",
					"console.log('Empresa ID:', pm.environment.get('empresaId'));",
					"console.log('Unidade Saúde ID:', pm.environment.get('unidadeSaudeId'));"
				]
			}
		},
		{
			"listen": "test",
			"script": {
				"type": "text/javascript",
				"exec": [
					"// Testes globais aplicados a todas as requisições",
					"",
					"// Verifica se a resposta foi recebida em tempo hábil",
					"pm.test('Response time é aceitável', function () {",
					"    pm.expect(pm.response.responseTime).to.be.below(5000);",
					"});",
					"",
					"// Verifica se o Content-Type está correto para respostas JSON",
					"if (pm.response.headers.get('Content-Type') && pm.response.headers.get('Content-Type').includes('application/json')) {",
					"    pm.test('Content-Type é application/json', function () {",
					"        pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');",
					"    });",
					"}",
					"",
					"// Verifica se não há erros 5xx (erro do servidor)",
					"pm.test('Sem erros de servidor (5xx)', function () {",
					"    pm.expect(pm.response.code).to.be.below(500);",
					"});",
					"",
					"// Log do status para debug",
					"console.log('Status:', pm.response.code, pm.response.status);",
					"console.log('Response Time:', pm.response.responseTime, 'ms');"
				]
			}
		}
	],
	"variable": [
		{
			"key": "devcac",
			"value": "http://devcac:7000",
			"type": "string"
		}
	]
}FF