{
  "openapi": "3.0.4",
  "info": {
    "title": "EGESTÃO - API de Autenticação",
    "description": "API para autenticação, autorização e gestão de usuários do sistema EGESTÃO",
    "contact": {
      "name": "Equipe EGESTÃO",
      "email": "dev@egestao.com.br"
    },
    "version": "v1.0"
  },
  "paths": {
    "/api/Auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
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
    "/api/Auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDto"
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
    "/api/Auth/trocar-senha": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoTrocarSenha"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoTrocarSenha"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoTrocarSenha"
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
    "/api/Auth/refresh-token": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoRefreshTokenRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoRefreshTokenRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoRefreshTokenRequest"
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
    "/api/Auth/confirmar-codigo-2fa": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoConfirmarEmail"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoConfirmarEmail"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoConfirmarEmail"
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
    "/api/Auth/esqueci-senha": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoEsqueciSenha"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoEsqueciSenha"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoEsqueciSenha"
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
    "/api/Auth/logout": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
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
    "/api/Auth/logout-all-sessions": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
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
    "/api/Auth/sessoes-ativas": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
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
    "/api/Auth/debug-token": {
      "post": {
        "tags": [
          "Auth"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoLogoutRequest"
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
    "/api/Auth/listar-tokens-ativos": {
      "get": {
        "tags": [
          "Auth"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Funcoes": {
      "get": {
        "tags": [
          "Funcoes"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "post": {
        "tags": [
          "Funcoes"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoFuncaoCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoFuncaoCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoFuncaoCreate"
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
    "/api/Funcoes/{id}": {
      "get": {
        "tags": [
          "Funcoes"
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
          "Funcoes"
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
                "$ref": "#/components/schemas/DtoFuncaoCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoFuncaoCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoFuncaoCreate"
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
          "Funcoes"
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
    "/health": {
      "get": {
        "tags": [
          "Micro-Auth"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/StringStringDateTimeString<>f__AnonymousType33"
                }
              }
            }
          }
        }
      }
    },
    "/api/Permissoes": {
      "get": {
        "tags": [
          "Permissoes"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoPermissaoResponse"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoPermissaoResponse"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoPermissaoResponse"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Permissoes"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoPermissaoCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoPermissaoCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoPermissaoCreate"
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
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/Permissoes/{id}": {
      "get": {
        "tags": [
          "Permissoes"
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
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoPermissaoResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Permissoes"
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
                "$ref": "#/components/schemas/DtoPermissaoCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoPermissaoCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoPermissaoCreate"
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
          "Permissoes"
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
    "/api/Sistemas": {
      "get": {
        "tags": [
          "Sistemas"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoSistemaResponse"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoSistemaResponse"
                  }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/DtoSistemaResponse"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Sistemas"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoSistemaCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoSistemaCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoSistemaCreate"
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
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/Sistemas/{id}": {
      "get": {
        "tags": [
          "Sistemas"
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
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoSistemaResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Sistemas"
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
                "$ref": "#/components/schemas/DtoSistemaCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoSistemaCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoSistemaCreate"
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
          "Sistemas"
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
    "/api/Unidades": {
      "get": {
        "tags": [
          "Unidades"
        ],
        "responses": {
          "200": {
            "description": "OK"
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
                "$ref": "#/components/schemas/DtoUnidadeComEnderecoCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUnidadeComEnderecoCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUnidadeComEnderecoCreate"
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
    "/api/Unidades/{id}": {
      "get": {
        "tags": [
          "Unidades"
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
          "Unidades"
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
                "$ref": "#/components/schemas/DtoUnidadeCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUnidadeCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUnidadeCreate"
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
          "Unidades"
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
    "/api/UsuarioPermissaoSistema": {
      "get": {
        "tags": [
          "UsuarioPermissaoSistema"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "UsuarioPermissaoSistema"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
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
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/UsuarioPermissaoSistema/{id}": {
      "get": {
        "tags": [
          "UsuarioPermissaoSistema"
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
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "UsuarioPermissaoSistema"
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
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioPermissaoSistemaCreate"
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
          "UsuarioPermissaoSistema"
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
    "/api/UsuarioPermissaoSistema/verificar-acesso/{sistemaId}": {
      "get": {
        "tags": [
          "UsuarioPermissaoSistema"
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
            "description": "OK"
          }
        }
      }
    },
    "/api/UsuarioPermissaoSistema/meus-sistemas": {
      "get": {
        "tags": [
          "UsuarioPermissaoSistema"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Usuarios": {
      "get": {
        "tags": [
          "Usuarios"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              },
              "text/json": {
                "schema": {
                  "type": "array",
                  "items": { }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "Usuarios"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioRegister"
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
    "/api/Usuarios/{id}": {
      "get": {
        "tags": [
          "Usuarios"
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
          "Usuarios"
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
                "$ref": "#/components/schemas/DtoUsuarioUpdate"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioUpdate"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/DtoUsuarioUpdate"
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
          "Usuarios"
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
    "/api/Usuarios/{id}/ativar": {
      "put": {
        "tags": [
          "Usuarios"
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
    "/api/Usuarios/{id}/inativar": {
      "put": {
        "tags": [
          "Usuarios"
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
    }
  },
  "components": {
    "schemas": {
      "DtoConfirmarEmail": {
        "required": [
          "codigo",
          "email"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          },
          "codigo": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoEsqueciSenha": {
        "required": [
          "email"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          }
        },
        "additionalProperties": false
      },
      "DtoFuncaoCreate": {
        "required": [
          "nome"
        ],
        "type": "object",
        "properties": {
          "nome": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoLogoutRequest": {
        "required": [
          "refreshToken"
        ],
        "type": "object",
        "properties": {
          "refreshToken": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoPermissaoCreate": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "descricao": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "DtoPermissaoResponse": {
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
          "descricao": {
            "type": "string",
            "nullable": true
          },
          "atualizadoEm": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "DtoRefreshTokenRequest": {
        "required": [
          "refreshToken"
        ],
        "type": "object",
        "properties": {
          "refreshToken": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoSistemaCreate": {
        "type": "object",
        "properties": {
          "nome": {
            "type": "string",
            "nullable": true
          },
          "descricao": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "DtoSistemaResponse": {
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
          "descricao": {
            "type": "string",
            "nullable": true
          },
          "atualizadoEm": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "DtoTrocarSenha": {
        "required": [
          "email",
          "novaSenha"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          },
          "novaSenha": {
            "minLength": 8,
            "type": "string"
          },
          "tokenTrocaSenha": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "DtoUnidadeComEnderecoCreate": {
        "required": [
          "bairro",
          "cap",
          "cep",
          "cidade",
          "estado",
          "logradouro",
          "nome",
          "numero"
        ],
        "type": "object",
        "properties": {
          "nome": {
            "minLength": 1,
            "type": "string"
          },
          "cap": {
            "minLength": 1,
            "type": "string"
          },
          "logradouro": {
            "minLength": 1,
            "type": "string"
          },
          "numero": {
            "minLength": 1,
            "type": "string"
          },
          "complemento": {
            "type": "string",
            "nullable": true
          },
          "bairro": {
            "minLength": 1,
            "type": "string"
          },
          "cidade": {
            "minLength": 1,
            "type": "string"
          },
          "estado": {
            "minLength": 1,
            "type": "string"
          },
          "cep": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoUnidadeCreate": {
        "required": [
          "cap",
          "enderecoId",
          "nome"
        ],
        "type": "object",
        "properties": {
          "nome": {
            "minLength": 1,
            "type": "string"
          },
          "cap": {
            "minLength": 1,
            "type": "string"
          },
          "enderecoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "DtoUsuarioPermissaoSistemaCreate": {
        "type": "object",
        "properties": {
          "usuarioId": {
            "type": "string",
            "format": "uuid"
          },
          "sistemaId": {
            "type": "string",
            "format": "uuid"
          },
          "permissaoId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "DtoUsuarioPermissaoSistemaResponse": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "usuarioId": {
            "type": "string",
            "format": "uuid"
          },
          "sistemaId": {
            "type": "string",
            "format": "uuid"
          },
          "permissaoId": {
            "type": "string",
            "format": "uuid"
          },
          "atribuidoEm": {
            "type": "string",
            "format": "date-time"
          },
          "atualizadoEm": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "DtoUsuarioRegister": {
        "required": [
          "bairro",
          "cep",
          "cidade",
          "cpf",
          "dataNascimento",
          "email",
          "estado",
          "funcaoId",
          "logradouro",
          "nomeCompleto",
          "numero",
          "senhaExpiraEm",
          "sexo",
          "telefone",
          "unidadeId",
          "vinculo"
        ],
        "type": "object",
        "properties": {
          "email": {
            "maxLength": 100,
            "minLength": 0,
            "type": "string",
            "format": "email"
          },
          "nomeCompleto": {
            "maxLength": 100,
            "minLength": 3,
            "type": "string"
          },
          "matricula": {
            "maxLength": 20,
            "minLength": 0,
            "type": "string",
            "nullable": true
          },
          "cpf": {
            "maxLength": 14,
            "minLength": 11,
            "type": "string"
          },
          "telefone": {
            "maxLength": 15,
            "minLength": 10,
            "type": "string"
          },
          "sexo": {
            "minLength": 1,
            "pattern": "^(M|F|O|MASCULINO|FEMININO|OUTRO)$",
            "type": "string"
          },
          "dataNascimento": {
            "type": "string",
            "format": "date"
          },
          "senhaExpiraEm": {
            "type": "string",
            "format": "date"
          },
          "vinculo": {
            "maxLength": 50,
            "minLength": 0,
            "type": "string"
          },
          "unidadeId": {
            "type": "string",
            "format": "uuid"
          },
          "funcaoId": {
            "type": "string",
            "format": "uuid"
          },
          "logradouro": {
            "maxLength": 100,
            "minLength": 3,
            "type": "string"
          },
          "numero": {
            "maxLength": 10,
            "minLength": 0,
            "type": "string"
          },
          "complemento": {
            "maxLength": 50,
            "minLength": 0,
            "type": "string",
            "nullable": true
          },
          "bairro": {
            "maxLength": 50,
            "minLength": 2,
            "type": "string"
          },
          "cidade": {
            "maxLength": 50,
            "minLength": 2,
            "type": "string"
          },
          "estado": {
            "maxLength": 2,
            "minLength": 2,
            "pattern": "^[A-Z]{2}$",
            "type": "string"
          },
          "cep": {
            "maxLength": 9,
            "minLength": 8,
            "pattern": "^\\d{5}-?\\d{3}$",
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "DtoUsuarioUpdate": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "ativo": {
            "type": "boolean"
          },
          "emailConfirmado": {
            "type": "boolean"
          },
          "tipoUsuario": {
            "type": "string",
            "nullable": true
          },
          "nomeCompleto": {
            "type": "string",
            "nullable": true
          },
          "matricula": {
            "type": "string",
            "nullable": true
          },
          "cpf": {
            "type": "string",
            "nullable": true
          },
          "telefone": {
            "type": "string",
            "nullable": true
          },
          "sexo": {
            "type": "string",
            "nullable": true
          },
          "dataNascimento": {
            "type": "string",
            "format": "date-time"
          },
          "vinculo": {
            "type": "string",
            "nullable": true
          },
          "unidadeId": {
            "type": "string",
            "format": "uuid"
          },
          "funcaoId": {
            "type": "string",
            "format": "uuid"
          },
          "enderecoId": {
            "type": "string",
            "format": "uuid"
          },
          "logradouro": {
            "type": "string",
            "nullable": true
          },
          "numero": {
            "type": "string",
            "nullable": true
          },
          "complemento": {
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
          }
        },
        "additionalProperties": false
      },
      "LoginDto": {
        "required": [
          "email",
          "senha"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          },
          "senha": {
            "minLength": 1,
            "type": "string"
          },
          "sistemaId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "StringStringDateTimeString<>f__AnonymousType33": {
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
      "Bearer": [ ]
    }
  ]
}