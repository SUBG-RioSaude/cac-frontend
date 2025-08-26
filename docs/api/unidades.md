{
"openapi": "3.0.1",
"info": {
"title": "EGESTAO.UnidadeSaude.API",
"version": "v1"
},
"paths": {
"/api/caps": {
"get": {
"tags": [
"Caps"
],
"responses": {
"200": {
"description": "Success",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/CapDto"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      },
      "post": {
        "tags": [
          "Caps"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CapCreateDto"
}
}
},
"required": true
},
"responses": {
"201": {
"description": "Created",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CapDto"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
}
},
"/api/caps/{id}": {
"get": {
"tags": [
"Caps"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"style": "simple",
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "Success",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CapDto"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"404": {
"description": "Not Found",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      },
      "put": {
        "tags": [
          "Caps"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "style": "simple",
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
                "$ref": "#/components/schemas/CapDto"
}
}
},
"required": true
},
"responses": {
"200": {
"description": "Success",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/CapDto"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"404": {
"description": "Not Found",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      },
      "delete": {
        "tags": [
          "Caps"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"404": {
"description": "Not Found",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      }
    },
    "/api/caps/buscar": {
      "get": {
        "tags": [
          "Caps"
        ],
        "parameters": [
          {
            "name": "nome",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/CapDto"
}
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      }
    },
    "/api/Seed/unidades": {
      "post": {
        "tags": [
          "Seed"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/Seed/caps": {
      "post": {
        "tags": [
          "Seed"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/TipoAdministracao": {
      "get": {
        "tags": [
          "TipoAdministracao"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "TipoAdministracao"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TipoAdministracaoCreateDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/TipoAdministracaoCreateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/TipoAdministracaoCreateDto"
}
}
}
},
"responses": {
"200": {
"description": "Success"
}
}
}
},
"/api/TipoAdministracao/{id}": {
"get": {
"tags": [
"TipoAdministracao"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"style": "simple",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "Success"
}
}
},
"put": {
"tags": [
"TipoAdministracao"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"style": "simple",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/TipoAdministracaoUpdateDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/TipoAdministracaoUpdateDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/TipoAdministracaoUpdateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/TipoUnidade": {
      "get": {
        "tags": [
          "TipoUnidade"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "TipoUnidade"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TipoUnidadeCreateDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/TipoUnidadeCreateDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/TipoUnidadeCreateDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/TipoUnidade/{id}": {
      "get": {
        "tags": [
          "TipoUnidade"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "put": {
        "tags": [
          "TipoUnidade"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TipoUnidadeUpdateDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/TipoUnidadeUpdateDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/TipoUnidadeUpdateDto"
}
}
}
},
"responses": {
"200": {
"description": "Success"
}
}
}
},
"/api/unidades": {
"get": {
"tags": [
"Unidades"
],
"parameters": [
{
"name": "pagina",
"in": "query",
"style": "form",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "tamanhoPagina",
"in": "query",
"style": "form",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "ordenarPor",
"in": "query",
"style": "form",
"schema": {
"type": "string"
}
},
{
"name": "direcaoOrdenacao",
"in": "query",
"style": "form",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "Success",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UnidadeSaudeDtoResultadoPaginadoDto"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
},
"post": {
"tags": [
"Unidades"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/UnidadeSaudeCreateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UnidadeSaudeDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "500": {
            "description": "Server Error"
          }
        }
      }
    },
    "/api/unidades/{id}": {
      "get": {
        "tags": [
          "Unidades"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UnidadeSaudeDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
},
"put": {
"tags": [
"Unidades"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"style": "simple",
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
"$ref": "#/components/schemas/UnidadeSaudeDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UnidadeSaudeDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
},
"delete": {
"tags": [
"Unidades"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"style": "simple",
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "Success"
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
}
},
"/api/unidades/buscar": {
"get": {
"tags": [
"Unidades"
],
"parameters": [
{
"name": "nome",
"in": "query",
"required": true,
"style": "form",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "Success",
"content": {
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/UnidadeSaudeDto"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
}
}
}
},
"500": {
"description": "Server Error"
}
}
}
}
},
"components": {
"schemas": {
"CapCreateDto": {
"required": [
"nome",
"uo"
],
"type": "object",
"properties": {
"nome": {
"maxLength": 255,
"minLength": 0,
"type": "string"
},
"uo": {
"maxLength": 100,
"minLength": 0,
"type": "string"
},
"ativo": {
"type": "boolean"
}
},
"additionalProperties": false
},
"CapDto": {
"required": [
"nome",
"uo"
],
"type": "object",
"properties": {
"id": {
"type": "string",
"format": "uuid"
},
"ativo": {
"type": "boolean"
},
"nome": {
"maxLength": 255,
"minLength": 0,
"type": "string"
},
"uo": {
"maxLength": 100,
"minLength": 0,
"type": "string"
}
},
"additionalProperties": false
},
"ProblemDetails": {
"type": "object",
"properties": {
"type": {
"type": "string",
"nullable": true
},
"title": {
"type": "string",
"nullable": true
},
"status": {
"type": "integer",
"format": "int32",
"nullable": true
},
"detail": {
"type": "string",
"nullable": true
},
"instance": {
"type": "string",
"nullable": true
}
},
"additionalProperties": {

        }
      },
      "TipoAdministracaoCreateDto": {
        "required": [
          "descricao"
        ],
        "type": "object",
        "properties": {
          "descricao": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "TipoAdministracaoUpdateDto": {
        "required": [
          "descricao",
          "id"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "descricao": {
            "minLength": 1,
            "type": "string"
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "TipoUnidadeCreateDto": {
        "required": [
          "descricao"
        ],
        "type": "object",
        "properties": {
          "descricao": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "TipoUnidadeUpdateDto": {
        "required": [
          "descricao",
          "id"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "descricao": {
            "minLength": 1,
            "type": "string"
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "UnidadeSaudeCreateDto": {
        "required": [
          "capId",
          "nome",
          "tipoAdministracaoId",
          "tipoUnidadeId"
        ],
        "type": "object",
        "properties": {
          "nome": {
            "maxLength": 255,
            "minLength": 0,
            "type": "string"
          },
          "capId": {
            "type": "string",
            "format": "uuid"
          },
          "ativo": {
            "type": "boolean"
          },
          "endereco": {
            "type": "string",
            "nullable": true
          },
          "bairro": {
            "type": "string",
            "nullable": true
          },
          "ua": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "subsecretaria": {
            "type": "string",
            "nullable": true
          },
          "sigla": {
            "type": "string",
            "nullable": true
          },
          "ap": {
            "type": "string",
            "nullable": true
          },
          "uo": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "ug": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "cnes": {
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "string",
            "nullable": true
          },
          "longitude": {
            "type": "string",
            "nullable": true
          },
          "tipoUnidadeId": {
            "type": "integer",
            "format": "int32"
          },
          "tipoAdministracaoId": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "UnidadeSaudeDto": {
        "required": [
          "capId",
          "nome"
        ],
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "ativo": {
            "type": "boolean"
          },
          "nome": {
            "maxLength": 255,
            "minLength": 0,
            "type": "string"
          },
          "sigla": {
            "type": "string",
            "nullable": true
          },
          "capId": {
            "type": "string",
            "format": "uuid"
          },
          "cap": {
            "$ref": "#/components/schemas/CapDto"
          }
        },
        "additionalProperties": false
      },
      "UnidadeSaudeDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "dados": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/UnidadeSaudeDto"
            },
            "nullable": true
          },
          "paginaAtual": {
            "type": "integer",
            "format": "int32"
          },
          "tamanhoPagina": {
            "type": "integer",
            "format": "int32"
          },
          "totalRegistros": {
            "type": "integer",
            "format": "int32"
          },
          "totalPaginas": {
            "type": "integer",
            "format": "int32"
          },
          "temPaginaAnterior": {
            "type": "boolean",
            "readOnly": true
          },
          "temProximaPagina": {
            "type": "boolean",
            "readOnly": true
          },
          "ordenadoPor": {
            "type": "string",
            "nullable": true
          },
          "direcaoOrdenacao": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      }
    }

}
}
