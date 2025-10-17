{
"openapi": "3.0.4",
"info": {
"title": "EGESTÃO - Sistema de Gestão Centralizado",
"description": "Documentação Swagger CENTRALIZADA - TODAS as APIs dos microserviços em UM SÓ LUGAR",
"contact": {
"name": "Equipe EGESTÃO",
"email": "dev@egestao.com.br"
},
"version": "1.0.0"
},
"paths": {
"/": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StringStringStringDateTimeStringStringStringString\u003C\u003Ef__AnonymousType1StringStringStringStringString\u003C\u003Ef__AnonymousType2String\u003C\u003Ef__AnonymousType0"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": [
          "EGESTAO.Agregador"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StringStringStringDateTimeStringString\u003C\u003Ef**AnonymousType3"
}
}
}
}
}
}
},
"/swagger-proxy/empresas/swagger.json": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/swagger-proxy/unidades/swagger.json": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/swagger-proxy/contratos/swagger.json": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/swagger-proxy/funcionarios/swagger.json": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/swagger-proxy/auth/swagger.json": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/gateway/status": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/teste": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/StringString\u003C\u003Ef**AnonymousType4"
}
}
}
}
}
}
},
"/api/empresas": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/empresas/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contatos/empresa/{empresaId}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "empresaId",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contatos": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/unidades": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/unidades/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/caps": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/caps/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TipoAdministracao": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TipoAdministracao/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TipoUnidade": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TipoUnidade/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/numero/{numeroContrato}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "numeroContrato",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/empresa/{empresaId}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "empresaId",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/unidade-saude/{unidadeSaudeId}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "unidadeSaudeId",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/vencendo": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/vencidos": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/{id}/suspender": {
"patch": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/{id}/reativar": {
"patch": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/{id}/encerrar": {
"patch": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/atualizar-status": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/contratos/existe/{numeroContrato}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "numeroContrato",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/seed/fornecedores": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/funcionarios": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/funcionarios/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/lotacoes": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/lotacoes/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/auth/login": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/auth/refresh": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/auth/register": {
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/usuarios": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"EGESTAO.Agregador"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/usuarios/{id}": {
"get": {
"tags": [
"EGESTAO.Agregador"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
}
},
"components": {
"schemas": {
"StringString\u003C\u003Ef**AnonymousType4": {
"type": "object",
"properties": {
"message": {
"type": "string",
"nullable": true
},
"gateway": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"StringStringString\u003C\u003Ef**AnonymousType1": {
"type": "object",
"properties": {
"swagger_ui": {
"type": "string",
"nullable": true
},
"health_check": {
"type": "string",
"nullable": true
},
"gateway_status": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"StringStringStringDateTimeStringString\u003C\u003Ef**AnonymousType3": {
"type": "object",
"properties": {
"status": {
"type": "string",
"nullable": true
},
"service": {
"type": "string",
"nullable": true
},
"version": {
"type": "string",
"nullable": true
},
"timestamp": {
"type": "string",
"format": "date-time"
},
"environment": {
"type": "string",
"nullable": true
},
"gateway_connection": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"StringStringStringDateTimeStringStringStringString\u003C\u003Ef**AnonymousType1StringStringStringStringString\u003C\u003Ef**AnonymousType2String\u003C\u003Ef**AnonymousType0": {
"type": "object",
"properties": {
"service": {
"type": "string",
"nullable": true
},
"version": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
},
"timestamp": {
"type": "string",
"format": "date-time"
},
"gateway_url": {
"type": "string",
"nullable": true
},
"endpoints": {
"$ref": "#/components/schemas/StringStringString\u003C\u003Ef__AnonymousType1"
          },
          "available_services": {
            "$ref": "#/components/schemas/StringStringStringStringString\u003C\u003Ef**AnonymousType2"
},
"instructions": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"StringStringStringStringString\u003C\u003Ef**AnonymousType2": {
"type": "object",
"properties": {
"empresas": {
"type": "string",
"nullable": true
},
"unidades": {
"type": "string",
"nullable": true
},
"contratos": {
"type": "string",
"nullable": true
},
"funcionarios": {
"type": "string",
"nullable": true
},
"auth": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
}
}
}
}
