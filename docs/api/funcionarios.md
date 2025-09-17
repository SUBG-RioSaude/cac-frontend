{
  "openapi": "3.0.1",
  "info": {
    "title": "EGESTÃO - Funcionários API",
    "description": "API para gerenciamento de funcionários e lotações do sistema EGESTÃO",
    "version": "v1"
  },
  "paths": {
    "/health": {
      "get": {
        "tags": [
          "EGESTAO.Funcionario.API"
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StringStringDateTimeString\u003C\u003Ef__AnonymousType5"
                }
              }
            }
          }
        }
      }
    },
    "/api/Funcionarios": {
      "get": {
        "tags": [
          "Funcionarios"
        ],
        "parameters": [
          {
            "name": "pagina",
            "in": "query",
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
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResultadoPaginadoDtoResult"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResultadoPaginadoDtoResult"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResultadoPaginadoDtoResult"
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Funcionarios"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarFuncionarioDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarFuncionarioDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarFuncionarioDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              }
            }
          }
        }
      }
    },
    "/api/Funcionarios/{id}": {
      "get": {
        "tags": [
          "Funcionarios"
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
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDtoResult"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Funcionarios"
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
                "$ref": "#/components/schemas/AtualizarFuncionarioDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarFuncionarioDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarFuncionarioDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Funcionarios"
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
          }
        }
      },
      "head": {
        "tags": [
          "Funcionarios"
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
          }
        }
      }
    },
    "/api/Funcionarios/matricula/{matricula}": {
      "get": {
        "tags": [
          "Funcionarios"
        ],
        "parameters": [
          {
            "name": "matricula",
            "in": "path",
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
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Funcionarios/cpf/{cpf}": {
      "get": {
        "tags": [
          "Funcionarios"
        ],
        "parameters": [
          {
            "name": "cpf",
            "in": "path",
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
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/FuncionarioDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Funcionarios/lotacao/{lotacaoId}": {
      "get": {
        "tags": [
          "Funcionarios"
        ],
        "parameters": [
          {
            "name": "lotacaoId",
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
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/FuncionarioDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/FuncionarioDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/FuncionarioDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/Lotacoes": {
      "get": {
        "tags": [
          "Lotacoes"
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Lotacoes"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarLotacaoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/CriarLotacaoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/CriarLotacaoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Lotacoes/{id}": {
      "get": {
        "tags": [
          "Lotacoes"
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
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Lotacoes"
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
                "$ref": "#/components/schemas/AtualizarLotacaoDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarLotacaoDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/AtualizarLotacaoDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "Lotacoes"
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
          }
        }
      },
      "head": {
        "tags": [
          "Lotacoes"
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
          }
        }
      }
    },
    "/api/Lotacoes/sigla/{sigla}": {
      "get": {
        "tags": [
          "Lotacoes"
        ],
        "parameters": [
          {
            "name": "sigla",
            "in": "path",
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
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/LotacaoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/Lotacoes/{lotacaoPaiId}/filhas": {
      "get": {
        "tags": [
          "Lotacoes"
        ],
        "parameters": [
          {
            "name": "lotacaoPaiId",
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
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/LotacaoDto"
                  }
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
      "AtualizarFuncionarioDto": {
        "type": "object",
        "properties": {
          "nomeCompleto": {
            "type": "string",
            "nullable": true
          },
          "cpf": {
            "type": "string",
            "nullable": true
          },
          "matricula": {
            "type": "string",
            "nullable": true
          },
          "cargo": {
            "type": "string",
            "nullable": true
          },
          "funcao": {
            "type": "string",
            "nullable": true
          },
          "situacao": {
            "$ref": "#/components/schemas/SituacaoFuncional"
          },
          "vinculo": {
            "$ref": "#/components/schemas/TipoVinculo"
          },
          "dataAdmissao": {
            "type": "string",
            "format": "date-time"
          },
          "dataExoneracao": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "emailInstitucional": {
            "type": "string",
            "nullable": true
          },
          "telefone": {
            "type": "string",
            "nullable": true
          },
          "lotacaoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "AtualizarLotacaoDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "sigla": {
            "type": "string",
            "nullable": true
          },
          "lotacaoPaiId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "CriarFuncionarioDto": {
        "type": "object",
        "properties": {
          "nomeCompleto": {
            "type": "string",
            "nullable": true
          },
          "cpf": {
            "type": "string",
            "nullable": true
          },
          "matricula": {
            "type": "string",
            "nullable": true
          },
          "cargo": {
            "type": "string",
            "nullable": true
          },
          "funcao": {
            "type": "string",
            "nullable": true
          },
          "situacao": {
            "$ref": "#/components/schemas/SituacaoFuncional"
          },
          "vinculo": {
            "$ref": "#/components/schemas/TipoVinculo"
          },
          "dataAdmissao": {
            "type": "string",
            "format": "date-time"
          },
          "dataExoneracao": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "emailInstitucional": {
            "type": "string",
            "nullable": true
          },
          "telefone": {
            "type": "string",
            "nullable": true
          },
          "lotacaoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "CriarLotacaoDto": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "sigla": {
            "type": "string",
            "nullable": true
          },
          "lotacaoPaiId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FuncionarioDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "nomeCompleto": {
            "type": "string",
            "nullable": true
          },
          "cpf": {
            "type": "string",
            "nullable": true
          },
          "matricula": {
            "type": "string",
            "nullable": true
          },
          "cargo": {
            "type": "string",
            "nullable": true
          },
          "funcao": {
            "type": "string",
            "nullable": true
          },
          "situacao": {
            "$ref": "#/components/schemas/SituacaoFuncional"
          },
          "vinculo": {
            "$ref": "#/components/schemas/TipoVinculo"
          },
          "dataAdmissao": {
            "type": "string",
            "format": "date-time"
          },
          "dataExoneracao": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "emailInstitucional": {
            "type": "string",
            "nullable": true
          },
          "telefone": {
            "type": "string",
            "nullable": true
          },
          "lotacaoId": {
            "type": "string",
            "format": "uuid"
          },
          "lotacaoNome": {
            "type": "string",
            "nullable": true
          },
          "lotacaoSigla": {
            "type": "string",
            "nullable": true
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "FuncionarioDtoResult": {
        "type": "object",
        "properties": {
          "sucesso": {
            "type": "boolean"
          },
          "mensagem": {
            "type": "string",
            "nullable": true
          },
          "dados": {
            "$ref": "#/components/schemas/FuncionarioDto"
          },
          "erros": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FuncionarioDtoResultadoPaginadoDto": {
        "type": "object",
        "properties": {
          "dados": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/FuncionarioDto"
            },
            "nullable": true
          },
          "totalRegistros": {
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
            "format": "int32"
          },
          "temPaginaAnterior": {
            "type": "boolean"
          },
          "temProximaPagina": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "FuncionarioDtoResultadoPaginadoDtoResult": {
        "type": "object",
        "properties": {
          "sucesso": {
            "type": "boolean"
          },
          "mensagem": {
            "type": "string",
            "nullable": true
          },
          "dados": {
            "$ref": "#/components/schemas/FuncionarioDtoResultadoPaginadoDto"
          },
          "erros": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "LotacaoDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "nome": {
            "type": "string",
            "nullable": true
          },
          "sigla": {
            "type": "string",
            "nullable": true
          },
          "lotacaoPaiId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "lotacaoPaiNome": {
            "type": "string",
            "nullable": true
          },
          "dataCadastro": {
            "type": "string",
            "format": "date-time"
          },
          "ativo": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "SituacaoFuncional": {
        "enum": [1, 2, 3, 4],
        "type": "integer",
        "format": "int32"
      },
      "StringStringDateTimeString\u003C\u003Ef__AnonymousType5": {
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
          "timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "environment": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "TipoVinculo": {
        "enum": [1, 2, 3, 4],
        "type": "integer",
        "format": "int32"
      }
    }
  }
}