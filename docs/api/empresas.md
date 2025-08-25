{
  "openapi": "3.0.1",
  "info": {
    "title": "EGESTÃO - API de Empresas",
    "description": "API para gerenciamento de empresas e fornecedores...",
    "contact": {
      "name": "Equipe de Desenvolvimento",
      "email": "dev@egestao.com.br"
    },
    "version": "v1"
  },
  "paths": {
    "/api/empresas/{empresaId}/contatos": {
      "post": {
        "tags": [
          "Contatos"
        ],
        "parameters": [
          {
            "name": "empresaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContatoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContatoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContatoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/empresas/{empresaId}/contatos/{contatoId}": {
      "put": {
        "tags": [
          "Contatos"
        ],
        "parameters": [
          {
            "name": "empresaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "contatoId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContatoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContatoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContatoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Contatos"
        ],
        "parameters": [
          {
            "name": "empresaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "contatoId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
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
    "/api/Empresas/{id}": {
      "get": {
        "tags": [
          "Empresas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
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
          "Empresas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarEmpresaDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarEmpresaDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarEmpresaDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Empresas"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
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
    "/api/Empresas/cnpj/{cnpj}": {
      "get": {
        "tags": [
          "Empresas"
        ],
        "parameters": [
          {
            "name": "cnpj",
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
    "/api/Empresas/status": {
      "get": {
        "tags": [
          "Empresas"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Empresas": {
      "get": {
        "tags": [
          "Empresas"
        ],
        "parameters": [
          {
            "name": "pagina",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "tamanhoPagina",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "post": {
        "tags": [
          "Empresas"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarEmpresaDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarEmpresaDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarEmpresaDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Seed/fornecedores": {
      "post": {
        "tags": [
          "Seed"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Seed/fornecedores/exemplo": {
      "get": {
        "tags": [
          "Seed"
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
      "AtualizarContatoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "nome": {
            "type": "string",
            "nullable": true
          },
          "valor": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AtualizarEmpresaDto": {
        "type": "object",
        "properties": {
          "razaoSocial": {
            "type": "string",
            "nullable": true
          },
          "nomeFantasia": {
            "type": "string",
            "nullable": true
          },
          "inscricaoEstadual": {
            "type": "string",
            "nullable": true
          },
          "inscricaoMunicipal": {
            "type": "string",
            "nullable": true
          },
          "endereco": {
            "type": "string",
            "nullable": true
          },
          "bairro": {
            "type": "string",
            "nullable": true
          },
          "cidade": {
            "type": "string",
            "nullable": true
          },
          "estado": {
            "type": "string",
            "nullable": true
          },
          "cep": {
            "type": "string",
            "nullable": true
          },
          "usuarioAtualizacaoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "CriarContatoDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "valor": {
            "type": "string",
            "nullable": true
          },
          "tipo": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "CriarEmpresaDto": {
        "type": "object",
        "properties": {
          "cnpj": {
            "type": "string",
            "nullable": true
          },
          "razaoSocial": {
            "type": "string",
            "nullable": true
          },
          "nomeFantasia": {
            "type": "string",
            "nullable": true
          },
          "inscricaoEstadual": {
            "type": "string",
            "nullable": true
          },
          "inscricaoMunicipal": {
            "type": "string",
            "nullable": true
          },
          "endereco": {
            "type": "string",
            "nullable": true
          },
          "bairro": {
            "type": "string",
            "nullable": true
          },
          "cidade": {
            "type": "string",
            "nullable": true
          },
          "estado": {
            "type": "string",
            "nullable": true
          },
          "cep": {
            "type": "string",
            "nullable": true
          },
          "usuarioCadastroId": {
            "type": "string",
            "format": "uuid"
          },
          "contatos": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/CriarContatoDto"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      }
    }
  }
}