{
"openapi": "3.0.1",
"info": {
"title": "EGestao Chat API",
"description": "API para gerenciamento de mensagens de chat do ecossistema EGestão",
"version": "v1"
},
"paths": {
"/": {
"get": {
"tags": [
"EGestao-Chat"
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"type": "string"
}
}
}
}
}
}
},
"/api/Health": {
"get": {
"tags": [
"Health"
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/HealthCheckDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthCheckDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/HealthCheckDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Health/ready": {
      "get": {
        "tags": [
          "Health"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Health/live": {
      "get": {
        "tags": [
          "Health"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Mensagens": {
      "post": {
        "tags": [
          "Mensagens"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarMensagemDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/CriarMensagemDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarMensagemDto"
}
}
}
},
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/MensagemResponseDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MensagemResponseDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/MensagemResponseDto"
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "Mensagens"
        ],
        "parameters": [
          {
            "name": "SistemaId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "EntidadeOrigemId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "AutorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "AutorNome",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Pesquisa",
            "in": "query",
            "schema": {
              "maxLength": 250,
              "minLength": 0,
              "type": "string"
            }
          },
          {
            "name": "DataInicio",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "DataFim",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "Page",
            "in": "query",
            "schema": {
              "maximum": 2147483647,
              "minimum": 1,
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "maximum": 100,
              "minimum": 1,
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "SortDirection",
            "in": "query",
            "schema": {
              "pattern": "^(asc|desc)$",
"type": "string"
}
},
{
"name": "SortBy",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "Offset",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/MensagemResponseDtoResultadoPaginadoDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/MensagemResponseDtoResultadoPaginadoDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/MensagemResponseDtoResultadoPaginadoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Mensagens/{id}": {
      "get": {
        "tags": [
          "Mensagens"
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
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/MensagemResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/MensagemResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/MensagemResponseDto"
}
}
}
}
}
},
"put": {
"tags": [
"Mensagens"
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
"$ref": "#/components/schemas/AtualizarMensagemDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarMensagemDto"
}
},
"application/\*+json": {
"schema": {
"$ref": "#/components/schemas/AtualizarMensagemDto"
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
          "Mensagens"
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
    "/api/Mensagens/sistema/{sistemaId}/entidade/{entidadeOrigemId}": {
      "get": {
        "tags": [
          "Mensagens"
        ],
        "parameters": [
          {
            "name": "sistemaId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "entidadeOrigemId",
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
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
},
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
}
}
}
}
}
},
"/api/Mensagens/autor/{autorId}": {
"get": {
"tags": [
"Mensagens"
],
"parameters": [
{
"name": "autorId",
"in": "path",
"required": true,
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
},
"text/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Mensagens/sistema/{sistemaId}": {
      "get": {
        "tags": [
          "Mensagens"
        ],
        "parameters": [
          {
            "name": "sistemaId",
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
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
},
"application/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
}
}
}
}
}
},
"/api/Mensagens/periodo": {
"get": {
"tags": [
"Mensagens"
],
"parameters": [
{
"name": "dataInicio",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "dataFim",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MensagemResponseDto"
}
}
},
"text/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/MensagemResponseDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Mensagens/estatisticas": {
      "get": {
        "tags": [
          "Mensagens"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/EstatisticasDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/EstatisticasDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/EstatisticasDto"
}
}
}
}
}
}
}
},
"components": {
"schemas": {
"AtualizarMensagemDto": {
"required": [
"texto"
],
"type": "object",
"properties": {
"texto": {
"maxLength": 250,
"minLength": 1,
"type": "string"
}
},
"additionalProperties": false
},
"AutorEstatisticaDto": {
"type": "object",
"properties": {
"autorId": {
"type": "string",
"nullable": true
},
"autorNome": {
"type": "string",
"nullable": true
},
"totalMensagens": {
"type": "integer",
"format": "int32"
},
"ultimaMensagem": {
"type": "string",
"format": "date-time",
"nullable": true
}
},
"additionalProperties": false
},
"CriarMensagemDto": {
"required": [
"autorId",
"entidadeOrigemId",
"sistemaId",
"texto"
],
"type": "object",
"properties": {
"sistemaId": {
"type": "string",
"format": "uuid"
},
"entidadeOrigemId": {
"type": "string",
"format": "uuid"
},
"texto": {
"maxLength": 250,
"minLength": 1,
"type": "string"
},
"autorId": {
"maxLength": 100,
"minLength": 0,
"type": "string"
},
"autorNome": {
"maxLength": 200,
"minLength": 0,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"EstatisticasDto": {
"type": "object",
"properties": {
"totalMensagens": {
"type": "integer",
"format": "int32"
},
"mensagensHoje": {
"type": "integer",
"format": "int32"
},
"mensagensSemana": {
"type": "integer",
"format": "int32"
},
"mensagensMes": {
"type": "integer",
"format": "int32"
},
"totalAutores": {
"type": "integer",
"format": "int32"
},
"totalSistemas": {
"type": "integer",
"format": "int32"
},
"totalEntidades": {
"type": "integer",
"format": "int32"
},
"ultimaMensagem": {
"type": "string",
"format": "date-time",
"nullable": true
},
"dataCalculo": {
"type": "string",
"format": "date-time"
},
"topAutores": {
"type": "array",
"items": {
"$ref": "#/components/schemas/AutorEstatisticaDto"
            },
            "nullable": true
          },
          "topSistemas": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/SistemaEstatisticaDto"
},
"nullable": true
}
},
"additionalProperties": false
},
"HealthCheckDto": {
"type": "object",
"properties": {
"status": {
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
"uptime": {
"type": "string",
"format": "date-span"
},
"dependencies": {
"type": "object",
"additionalProperties": {

            },
            "nullable": true
          },
          "metrics": {
            "type": "object",
            "additionalProperties": {

            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "MensagemResponseDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "sistemaId": {
            "type": "string",
            "format": "uuid"
          },
          "entidadeOrigemId": {
            "type": "string",
            "format": "uuid"
          },
          "texto": {
            "type": "string",
            "nullable": true
          },
          "autorId": {
            "type": "string",
            "nullable": true
          },
          "autorNome": {
            "type": "string",
            "nullable": true
          },
          "enviadoEm": {
            "type": "string",
            "format": "date-time"
          },
          "atualizadoEm": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "criadoEm": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "MensagemResponseDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MensagemResponseDto"
            },
            "nullable": true
          },
          "totalItens": {
            "type": "integer",
            "format": "int32"
          },
          "paginaAtual": {
            "type": "integer",
            "format": "int32"
          },
          "tamanhoPagina": {
            "type": "integer",
            "format": "int32"
          },
          "totalPaginas": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "temProximaPagina": {
            "type": "boolean",
            "readOnly": true
          },
          "temPaginaAnterior": {
            "type": "boolean",
            "readOnly": true
          }
        },
        "additionalProperties": false
      },
      "SistemaEstatisticaDto": {
        "type": "object",
        "properties": {
          "sistemaId": {
            "type": "string",
            "format": "uuid"
          },
          "totalMensagens": {
            "type": "integer",
            "format": "int32"
          },
          "totalEntidades": {
            "type": "integer",
            "format": "int32"
          },
          "ultimaMensagem": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false
      }
    },
    "securitySchemes": {
      "Bearer": {
        "type": "apiKey",
        "description": "JWT Authorization header usando o esquema Bearer. Exemplo: \"Authorization: Bearer {token}\"",
        "name": "Authorization",
        "in": "header"
      }
    }

},
"security": [
{
"Bearer": []
}
]
}
