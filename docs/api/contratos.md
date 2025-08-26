{
  "openapi": "3.0.1",
  "info": {
    "title": "EGESTÃO - API de Contratos",
    "description": "API para gerenciamento de contratos do sistema EGESTÃO",
    "version": "v1"
  },
  "paths": {
    "/api/Aditivos": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém todos os aditivos com paginação e filtros",
        "parameters": [
          {
            "name": "pagina",
            "in": "query",
            "description": "Número da página (padrão: 1)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "tamanhoPagina",
            "in": "query",
            "description": "Tamanho da página (padrão: 20)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            }
          },
          {
            "name": "contratoId",
            "in": "query",
            "description": "ID do contrato para filtrar",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "description": "Status do aditivo",
            "style": "form",
            "schema": {
              "$ref": "#/components/schemas/StatusAditivo"
            }
          },
          {
            "name": "tipoAditivo",
            "in": "query",
            "description": "Tipo do aditivo",
            "style": "form",
            "schema": {
              "$ref": "#/components/schemas/TipoAditivo"
            }
          },
          {
            "name": "dataEfeitoInicial",
            "in": "query",
            "description": "Data inicial do período de efeito",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataEfeitoFinal",
            "in": "query",
            "description": "Data final do período de efeito",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "termo",
            "in": "query",
            "description": "Termo para pesquisa textual",
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
                  "$ref": "#/components/schemas/AditivoResumoDtoResultadoPaginadoDto"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Cria um novo aditivo",
        "requestBody": {
          "description": "Dados do aditivo a ser criado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarAditivoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarAditivoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarAditivoDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      }
    },
    "/api/Aditivos/{id}": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém um aditivo específico por ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
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
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      },
      "put": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Atualiza um aditivo existente",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados atualizados do aditivo",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarAditivoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarAditivoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarAditivoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      },
      "delete": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Remove logicamente um aditivo",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "motivo",
            "in": "query",
            "description": "Motivo da exclusão",
            "style": "form",
            "schema": {
              "type": "string",
              "default": "Exclusão solicitada"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Aditivos/contrato/{contratoId}": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém aditivos de um contrato específico",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/contrato/{contratoId}/historico": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém histórico completo de aditivos de um contrato",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/aguardando-aprovacao": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém aditivos aguardando aprovação",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/contrato/{contratoId}/vigentes": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém aditivos vigentes de um contrato",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/{id}/enviar-para-aprovacao": {
      "patch": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Envia aditivo para aprovação",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
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
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      }
    },
    "/api/Aditivos/{id}/aprovar": {
      "patch": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Aprova um aditivo",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados da aprovação",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AprovarAditivoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AprovarAditivoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AprovarAditivoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      }
    },
    "/api/Aditivos/{id}/rejeitar": {
      "patch": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Rejeita um aditivo",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados da rejeição",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RejeitarAditivoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/RejeitarAditivoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/RejeitarAditivoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      }
    },
    "/api/Aditivos/{id}/arquivar": {
      "patch": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Arquiva um aditivo",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do aditivo",
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
                  "$ref": "#/components/schemas/AditivoDto"
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
          }
        }
      }
    },
    "/api/Aditivos/estatisticas": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém estatísticas de aditivos por status",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "integer",
                    "format": "int32"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/contrato/{contratoId}/total-alteracoes-valor": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Calcula o total de alterações de valor de um contrato",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "number",
                  "format": "double"
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/com-alteracao-valor": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém aditivos com alterações de valor",
        "parameters": [
          {
            "name": "dataInicial",
            "in": "query",
            "description": "Data inicial do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinal",
            "in": "query",
            "description": "Data final do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
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
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Aditivos/com-alteracao-prazo": {
      "get": {
        "tags": [
          "Aditivos"
        ],
        "summary": "Obtém aditivos com alterações de prazo",
        "parameters": [
          {
            "name": "dataInicial",
            "in": "query",
            "description": "Data inicial do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinal",
            "in": "query",
            "description": "Data final do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
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
                    "$ref": "#/components/schemas/AditivoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém todos os apostilamentos com paginação e filtros",
        "parameters": [
          {
            "name": "pagina",
            "in": "query",
            "description": "Número da página (padrão: 1)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "tamanhoPagina",
            "in": "query",
            "description": "Tamanho da página (padrão: 20)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            }
          },
          {
            "name": "contratoId",
            "in": "query",
            "description": "ID do contrato para filtrar",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "tipoApostilamento",
            "in": "query",
            "description": "Tipo do apostilamento",
            "style": "form",
            "schema": {
              "$ref": "#/components/schemas/TipoApostilamento"
            }
          },
          {
            "name": "dataRegistroInicial",
            "in": "query",
            "description": "Data inicial do período de registro",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataRegistroFinal",
            "in": "query",
            "description": "Data final do período de registro",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "termo",
            "in": "query",
            "description": "Termo para pesquisa textual",
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
                  "$ref": "#/components/schemas/ApostilamentoResumoDtoResultadoPaginadoDto"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Cria um novo apostilamento",
        "requestBody": {
          "description": "Dados do apostilamento a ser criado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarApostilamentoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarApostilamentoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarApostilamentoDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApostilamentoDto"
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
          }
        }
      }
    },
    "/api/Apostilamentos/{id}": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém um apostilamento específico por ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do apostilamento",
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
                  "$ref": "#/components/schemas/ApostilamentoDto"
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
          }
        }
      },
      "put": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Atualiza um apostilamento existente",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do apostilamento",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados atualizados do apostilamento",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarApostilamentoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarApostilamentoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarApostilamentoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApostilamentoDto"
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
          }
        }
      },
      "delete": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Remove logicamente um apostilamento",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do apostilamento",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "motivo",
            "in": "query",
            "description": "Motivo da exclusão",
            "style": "form",
            "schema": {
              "type": "string",
              "default": "Exclusão solicitada"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Apostilamentos/contrato/{contratoId}": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos de um contrato específico",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/contrato/{contratoId}/historico": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém histórico completo de apostilamentos de um contrato",
        "parameters": [
          {
            "name": "contratoId",
            "in": "path",
            "description": "ID do contrato",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/tipo/{tipo}": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos por tipo específico",
        "parameters": [
          {
            "name": "tipo",
            "in": "path",
            "description": "Tipo do apostilamento",
            "required": true,
            "style": "simple",
            "schema": {
              "$ref": "#/components/schemas/TipoApostilamento"
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
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/recentes": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos recentes",
        "parameters": [
          {
            "name": "dias",
            "in": "query",
            "description": "Número de dias para considerar como recente (padrão: 30)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 30
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
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/editaveis": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos editáveis",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/buscar": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Busca apostilamentos por termo na descrição",
        "parameters": [
          {
            "name": "termo",
            "in": "query",
            "description": "Termo para busca",
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
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/reajustes-previstos": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém reajustes previstos em um período",
        "parameters": [
          {
            "name": "dataInicial",
            "in": "query",
            "description": "Data inicial do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinal",
            "in": "query",
            "description": "Data final do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
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
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/{id}/descricao": {
      "patch": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Atualiza apenas a descrição de um apostilamento",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do apostilamento",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados da nova descrição",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarDescricaoApostilamentoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarDescricaoApostilamentoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarDescricaoApostilamentoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApostilamentoDto"
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
          }
        }
      }
    },
    "/api/Apostilamentos/estatisticas": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém estatísticas de apostilamentos",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EstatisticasApostilamentoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/com-fundamentacao-obrigatoria": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos com fundamentação obrigatória",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Apostilamentos/periodo": {
      "get": {
        "tags": [
          "Apostilamentos"
        ],
        "summary": "Obtém apostilamentos por período de registro",
        "parameters": [
          {
            "name": "dataInicial",
            "in": "query",
            "description": "Data inicial do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinal",
            "in": "query",
            "description": "Data final do período",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
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
                    "$ref": "#/components/schemas/ApostilamentoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém todos os contratos com paginação e filtros",
        "parameters": [
          {
            "name": "pagina",
            "in": "query",
            "description": "Número da página (padrão: 1)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "tamanhoPagina",
            "in": "query",
            "description": "Tamanho da página (padrão: 20)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            }
          },
          {
            "name": "filtroStatus",
            "in": "query",
            "description": "Filtro por status",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "dataInicialDe",
            "in": "query",
            "description": "Data inicial de vigência (início do período)",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataInicialAte",
            "in": "query",
            "description": "Data inicial de vigência (fim do período)",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinalDe",
            "in": "query",
            "description": "Data final de vigência (início do período)",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dataFinalAte",
            "in": "query",
            "description": "Data final de vigência (fim do período)",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "valorMinimo",
            "in": "query",
            "description": "Valor mínimo do contrato",
            "style": "form",
            "schema": {
              "type": "number",
              "format": "double"
            }
          },
          {
            "name": "valorMaximo",
            "in": "query",
            "description": "Valor máximo do contrato",
            "style": "form",
            "schema": {
              "type": "number",
              "format": "double"
            }
          },
          {
            "name": "empresaId",
            "in": "query",
            "description": "ID da empresa",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "unidadeSaudeId",
            "in": "query",
            "description": "ID da unidade de saúde",
            "style": "form",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "termoPesquisa",
            "in": "query",
            "description": "Termo para pesquisa textual",
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
                  "$ref": "#/components/schemas/ContratoDtoResultadoPaginadoDto"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Contratos"
        ],
        "summary": "Cria um novo contrato",
        "requestBody": {
          "description": "Dados do contrato a ser criado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContratoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContratoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarContratoDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ContratoDto"
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
          "409": {
            "description": "Conflict",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos/{id}": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém um contrato específico por ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
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
                  "$ref": "#/components/schemas/ContratoDto"
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
          }
        }
      },
      "put": {
        "tags": [
          "Contratos"
        ],
        "summary": "Atualiza um contrato existente",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "description": "Dados atualizados do contrato",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContratoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContratoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarContratoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ContratoDto"
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
          }
        }
      },
      "delete": {
        "tags": [
          "Contratos"
        ],
        "summary": "Remove um contrato (soft delete)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Contratos/numero/{numeroContrato}": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém um contrato por número",
        "parameters": [
          {
            "name": "numeroContrato",
            "in": "path",
            "description": "Número do contrato",
            "required": true,
            "style": "simple",
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
                  "$ref": "#/components/schemas/ContratoDto"
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
          }
        }
      }
    },
    "/api/Contratos/empresa/{empresaId}": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém contratos por empresa",
        "parameters": [
          {
            "name": "empresaId",
            "in": "path",
            "description": "ID da empresa",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ContratoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos/unidade-saude/{unidadeSaudeId}": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém contratos por unidade de saúde",
        "parameters": [
          {
            "name": "unidadeSaudeId",
            "in": "path",
            "description": "ID da unidade de saúde",
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
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ContratoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos/vencendo": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém contratos que estão vencendo",
        "parameters": [
          {
            "name": "diasAntecipados",
            "in": "query",
            "description": "Número de dias para considerar como \"vencendo\" (padrão: 30)",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 30
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
                    "$ref": "#/components/schemas/ContratoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos/vencidos": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Obtém contratos vencidos",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ContratoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Contratos/{id}/suspender": {
      "patch": {
        "tags": [
          "Contratos"
        ],
        "summary": "Suspende um contrato",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Contratos/{id}/reativar": {
      "patch": {
        "tags": [
          "Contratos"
        ],
        "summary": "Reativa um contrato suspenso",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Contratos/{id}/encerrar": {
      "patch": {
        "tags": [
          "Contratos"
        ],
        "summary": "Encerra um contrato",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID do contrato",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
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
          }
        }
      }
    },
    "/api/Contratos/atualizar-status": {
      "post": {
        "tags": [
          "Contratos"
        ],
        "summary": "Atualiza o status de todos os contratos",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/Contratos/existe/{numeroContrato}": {
      "get": {
        "tags": [
          "Contratos"
        ],
        "summary": "Verifica se existe um contrato com o número informado",
        "parameters": [
          {
            "name": "numeroContrato",
            "in": "path",
            "description": "Número do contrato",
            "required": true,
            "style": "simple",
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
                  "type": "boolean"
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
      "AdicionarUnidadeContratoDto": {
        "required": [
          "unidadeSaudeId",
          "valorAtribuido"
        ],
        "type": "object",
        "properties": {
          "unidadeSaudeId": {
            "type": "string",
            "format": "uuid"
          },
          "valorAtribuido": {
            "minimum": 0.01,
            "type": "number",
            "format": "double"
          },
          "vigenciaInicialUnidade": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "vigenciaFinalUnidade": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "observacoes": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AditivoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "numeroAditivo": {
            "type": "integer",
            "format": "int32"
          },
          "tipoAditivo": {
            "$ref": "#/components/schemas/TipoAditivo"
          },
          "status": {
            "$ref": "#/components/schemas/StatusAditivo"
          },
          "deltaValor": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "novoValorGlobal": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "prorrogacaoDias": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "novaVigenciaFinal": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "descricaoAlteracao": {
            "type": "string",
            "nullable": true
          },
          "justificativa": {
            "type": "string",
            "nullable": true
          },
          "dataEfeito": {
            "type": "string",
            "format": "date-time"
          },
          "dataAssinatura": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          },
          "usuarioCadastroId": {
            "type": "string",
            "format": "uuid"
          },
          "usuarioAtualizacaoId": {
            "type": "string",
            "format": "uuid"
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "dataAtualizacao": {
            "type": "string",
            "format": "date-time"
          },
          "ativo": {
            "type": "boolean"
          },
          "contrato": {
            "$ref": "#/components/schemas/ContratoDto"
          },
          "podeSerEditado": {
            "type": "boolean"
          },
          "percentualAlteracaoValor": {
            "type": "number",
            "format": "double",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AditivoResumoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "numeroAditivo": {
            "type": "integer",
            "format": "int32"
          },
          "tipoAditivo": {
            "$ref": "#/components/schemas/TipoAditivo"
          },
          "status": {
            "$ref": "#/components/schemas/StatusAditivo"
          },
          "descricaoAlteracao": {
            "type": "string",
            "nullable": true
          },
          "dataEfeito": {
            "type": "string",
            "format": "date-time"
          },
          "dataAssinatura": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "deltaValor": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "prorrogacaoDias": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "contratoNumero": {
            "type": "string",
            "nullable": true
          },
          "contratoDescricaoObjeto": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AditivoResumoDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "dados": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/AditivoResumoDto"
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
          "temProximaPagina": {
            "type": "boolean"
          },
          "temPaginaAnterior": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "ApostilamentoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "numeroApostilamento": {
            "type": "integer",
            "format": "int32"
          },
          "tipoApostilamento": {
            "$ref": "#/components/schemas/TipoApostilamento"
          },
          "descricaoRegistro": {
            "type": "string",
            "nullable": true
          },
          "fundamentacaoLegal": {
            "type": "string",
            "nullable": true
          },
          "dataRegistro": {
            "type": "string",
            "format": "date-time"
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "observacoes": {
            "type": "string",
            "nullable": true
          },
          "usuarioCadastroId": {
            "type": "string",
            "format": "uuid"
          },
          "usuarioAtualizacaoId": {
            "type": "string",
            "format": "uuid"
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "dataAtualizacao": {
            "type": "string",
            "format": "date-time"
          },
          "ativo": {
            "type": "boolean"
          },
          "contrato": {
            "$ref": "#/components/schemas/ContratoDto"
          },
          "podeSerEditado": {
            "type": "boolean"
          },
          "requerFundamentacaoLegal": {
            "type": "boolean"
          },
          "resumo": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ApostilamentoResumoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "numeroApostilamento": {
            "type": "integer",
            "format": "int32"
          },
          "tipoApostilamento": {
            "$ref": "#/components/schemas/TipoApostilamento"
          },
          "descricaoRegistro": {
            "type": "string",
            "nullable": true
          },
          "dataRegistro": {
            "type": "string",
            "format": "date-time"
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "contratoNumero": {
            "type": "string",
            "nullable": true
          },
          "contratoDescricaoObjeto": {
            "type": "string",
            "nullable": true
          },
          "resumo": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ApostilamentoResumoDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "dados": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ApostilamentoResumoDto"
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
          "temProximaPagina": {
            "type": "boolean"
          },
          "temPaginaAnterior": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "AprovarAditivoDto": {
        "type": "object",
        "properties": {
          "dataAssinatura": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "observacoes": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AtualizarAditivoDto": {
        "type": "object",
        "properties": {
          "tipoAditivo": {
            "$ref": "#/components/schemas/TipoAditivo"
          },
          "deltaValor": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "novoValorGlobal": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "prorrogacaoDias": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "novaVigenciaFinal": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "descricaoAlteracao": {
            "type": "string",
            "nullable": true
          },
          "justificativa": {
            "type": "string",
            "nullable": true
          },
          "dataEfeito": {
            "type": "string",
            "format": "date-time"
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AtualizarApostilamentoDto": {
        "type": "object",
        "properties": {
          "tipoApostilamento": {
            "$ref": "#/components/schemas/TipoApostilamento"
          },
          "descricaoRegistro": {
            "type": "string",
            "nullable": true
          },
          "fundamentacaoLegal": {
            "type": "string",
            "nullable": true
          },
          "dataRegistro": {
            "type": "string",
            "format": "date-time"
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "observacoes": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "AtualizarContratoDto": {
        "type": "object",
        "properties": {
          "processoSei": {
            "type": "string",
            "nullable": true
          },
          "categoriaObjeto": {
            "type": "string",
            "nullable": true
          },
          "descricaoObjeto": {
            "type": "string",
            "nullable": true
          },
          "tipoContratacao": {
            "type": "string",
            "nullable": true
          },
          "tipoContrato": {
            "type": "string",
            "nullable": true
          },
          "unidadeDemandante": {
            "type": "string",
            "nullable": true
          },
          "unidadeGestora": {
            "type": "string",
            "nullable": true
          },
          "contratacao": {
            "type": "string",
            "nullable": true
          },
          "vigenciaInicial": {
            "type": "string",
            "format": "date-time"
          },
          "vigenciaFinal": {
            "type": "string",
            "format": "date-time"
          },
          "prazoInicialMeses": {
            "type": "integer",
            "format": "int32"
          },
          "valorGlobal": {
            "type": "number",
            "format": "double"
          },
          "formaPagamento": {
            "type": "string",
            "nullable": true
          },
          "tipoTermoReferencia": {
            "type": "string",
            "nullable": true
          },
          "termoReferencia": {
            "type": "string",
            "nullable": true
          },
          "vinculacaoPCA": {
            "type": "string",
            "nullable": true
          },
          "empresaId": {
            "type": "string",
            "format": "uuid"
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "AtualizarDescricaoApostilamentoDto": {
        "type": "object",
        "properties": {
          "novaDescricao": {
            "type": "string",
            "nullable": true
          },
          "motivoAlteracao": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ContratoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "numeroContrato": {
            "type": "string",
            "nullable": true
          },
          "processoSei": {
            "type": "string",
            "nullable": true
          },
          "categoriaObjeto": {
            "type": "string",
            "nullable": true
          },
          "descricaoObjeto": {
            "type": "string",
            "nullable": true
          },
          "tipoContratacao": {
            "type": "string",
            "nullable": true
          },
          "tipoContrato": {
            "type": "string",
            "nullable": true
          },
          "unidadeDemandante": {
            "type": "string",
            "nullable": true
          },
          "unidadeGestora": {
            "type": "string",
            "nullable": true
          },
          "contratacao": {
            "type": "string",
            "nullable": true
          },
          "vigenciaInicial": {
            "type": "string",
            "format": "date-time"
          },
          "vigenciaFinal": {
            "type": "string",
            "format": "date-time"
          },
          "prazoInicialMeses": {
            "type": "integer",
            "format": "int32"
          },
          "valorGlobal": {
            "type": "number",
            "format": "double"
          },
          "formaPagamento": {
            "type": "string",
            "nullable": true
          },
          "tipoTermoReferencia": {
            "type": "string",
            "nullable": true
          },
          "termoReferencia": {
            "type": "string",
            "nullable": true
          },
          "vinculacaoPCA": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "string",
            "nullable": true
          },
          "empresaId": {
            "type": "string",
            "format": "uuid"
          },
          "ativo": {
            "type": "boolean"
          },
          "usuarioCadastroId": {
            "type": "string",
            "format": "uuid"
          },
          "usuarioAtualizacaoId": {
            "type": "string",
            "format": "uuid"
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "dataAtualizacao": {
            "type": "string",
            "format": "date-time"
          },
          "unidadesVinculadas": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ContratoUnidadeSaudeDto"
            },
            "nullable": true
          },
          "valorTotalAtribuido": {
            "type": "number",
            "format": "double"
          },
          "valorDisponivel": {
            "type": "number",
            "format": "double"
          },
          "quantidadeUnidadesVinculadas": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "ContratoDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "dados": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ContratoDto"
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
          "temProximaPagina": {
            "type": "boolean"
          },
          "temPaginaAnterior": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "ContratoUnidadeSaudeDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "unidadeSaudeId": {
            "type": "string",
            "format": "uuid"
          },
          "valorAtribuido": {
            "type": "number",
            "format": "double"
          },
          "percentualValor": {
            "type": "number",
            "format": "double"
          },
          "vigenciaInicialUnidade": {
            "type": "string",
            "format": "date-time"
          },
          "vigenciaFinalUnidade": {
            "type": "string",
            "format": "date-time"
          },
          "observacoes": {
            "type": "string",
            "nullable": true
          },
          "ativo": {
            "type": "boolean"
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "dataAtualizacao": {
            "type": "string",
            "format": "date-time"
          },
          "usuarioCadastroId": {
            "type": "string",
            "format": "uuid"
          },
          "usuarioAtualizacaoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "CriarAditivoDto": {
        "type": "object",
        "properties": {
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "tipoAditivo": {
            "$ref": "#/components/schemas/TipoAditivo"
          },
          "deltaValor": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "novoValorGlobal": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "prorrogacaoDias": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "novaVigenciaFinal": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "descricaoAlteracao": {
            "type": "string",
            "nullable": true
          },
          "justificativa": {
            "type": "string",
            "nullable": true
          },
          "dataEfeito": {
            "type": "string",
            "format": "date-time"
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "CriarApostilamentoDto": {
        "type": "object",
        "properties": {
          "contratoId": {
            "type": "string",
            "format": "uuid"
          },
          "tipoApostilamento": {
            "$ref": "#/components/schemas/TipoApostilamento"
          },
          "descricaoRegistro": {
            "type": "string",
            "nullable": true
          },
          "fundamentacaoLegal": {
            "type": "string",
            "nullable": true
          },
          "dataRegistro": {
            "type": "string",
            "format": "date-time"
          },
          "documentoReferencia": {
            "type": "string",
            "nullable": true
          },
          "numeroProcesso": {
            "type": "string",
            "nullable": true
          },
          "observacoes": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "CriarContratoDto": {
        "type": "object",
        "properties": {
          "numeroContrato": {
            "type": "string",
            "nullable": true
          },
          "processoSei": {
            "type": "string",
            "nullable": true
          },
          "categoriaObjeto": {
            "type": "string",
            "nullable": true
          },
          "descricaoObjeto": {
            "type": "string",
            "nullable": true
          },
          "tipoContratacao": {
            "type": "string",
            "nullable": true
          },
          "tipoContrato": {
            "type": "string",
            "nullable": true
          },
          "unidadeDemandante": {
            "type": "string",
            "nullable": true
          },
          "unidadeGestora": {
            "type": "string",
            "nullable": true
          },
          "contratacao": {
            "type": "string",
            "nullable": true
          },
          "vigenciaInicial": {
            "type": "string",
            "format": "date-time"
          },
          "vigenciaFinal": {
            "type": "string",
            "format": "date-time"
          },
          "prazoInicialMeses": {
            "type": "integer",
            "format": "int32"
          },
          "valorGlobal": {
            "type": "number",
            "format": "double"
          },
          "formaPagamento": {
            "type": "string",
            "nullable": true
          },
          "tipoTermoReferencia": {
            "type": "string",
            "nullable": true
          },
          "termoReferencia": {
            "type": "string",
            "nullable": true
          },
          "vinculacaoPCA": {
            "type": "string",
            "nullable": true
          },
          "empresaId": {
            "type": "string",
            "format": "uuid"
          },
          "ativo": {
            "type": "boolean"
          },
          "unidadesVinculadas": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/AdicionarUnidadeContratoDto"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "EstatisticasApostilamentoDto": {
        "type": "object",
        "properties": {
          "contagemPorTipo": {
            "type": "object",
            "additionalProperties": {
              "type": "integer",
              "format": "int32"
            },
            "nullable": true
          },
          "totalApostilamentos": {
            "type": "integer",
            "format": "int32"
          },
          "apostilamentosUltimos30Dias": {
            "type": "integer",
            "format": "int32"
          },
          "ultimoApostilamento": {
            "type": "string",
            "format": "date-time",
            "nullable": true
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
      "RejeitarAditivoDto": {
        "type": "object",
        "properties": {
          "motivo": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "StatusAditivo": {
        "enum": [1, 2, 3, 4, 5],
        "type": "integer",
        "format": "int32"
      },
      "TipoAditivo": {
        "enum": [1, 2, 3, 4, 5, 99],
        "type": "integer",
        "format": "int32"
      },
      "TipoApostilamento": {
        "enum": [1, 2, 3, 4, 5, 6, 7, 99],
        "type": "integer",
        "format": "int32"
      }
    }
  }
}