# Sistema de Autenticação - CAC Frontend

Este documento explica como usar o sistema de autenticação implementado seguindo as regras de negócio da API.

## 🏗️ Arquitetura

O sistema de autenticação é composto pelos seguintes componentes:

### 1. **Middleware (`middleware.tsx`)**
- `ProtectedRoute`: Protege rotas baseado no estado de autenticação
- `AuthGuard`: Verifica autenticação ao montar componentes

### 2. **Store de Autenticação (`auth-store.ts`)**
- Gerenciamento de estado global usando Zustand
- Persistência de dados de autenticação
- Ações para login, logout, renovação de tokens, etc.
- **Validação de tokens JWT antes de salvar**

### 3. **Serviço de Autenticação (`auth-service.ts`)**
- Chamadas para a API de autenticação
- Tratamento de erros e respostas
- Configuração do axios para autenticação
- **Tratamento seguro de erros sem uso de `any`**

### 4. **Utilitário de Cookies (`cookie-utils.ts`)**
- Gerenciamento seguro de cookies para tokens
- Configurações de segurança (secure, sameSite, httpOnly)
- Expiração automática baseada na duração dos tokens
- **Detecção automática de ambiente (dev/prod)**
- **Validação de formato de cookies**

### 5. **Tipos TypeScript (`types/auth.ts`)**
- Interfaces para todas as estruturas de dados
- Baseadas na documentação da API

### 6. **Hook Personalizado (`hooks/use-auth.ts`)**
- Facilita o uso da autenticação nos componentes
- Hooks para guardas de rota e redirecionamentos

### 7. **Configuração Axios (`axios.ts`)**
- Interceptadores para renovação automática de tokens
- **Validação de formato JWT antes de enviar**
- Tratamento seguro de erros 401

## 🚀 Como Usar

### 1. **Configuração de Rotas**

```tsx
import { ProtectedRoute } from '@/middleware'

// Rota que requer autenticação
<Route element={<ProtectedRoute requireAuth={true} />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

// Rota que requer usuário não autenticado
<Route element={<ProtectedRoute requireGuest={true} />}>
  <Route path="/login" element={<Login />} />
</Route>
```

### 2. **Uso nos Componentes**

```tsx
import { useAuth } from '@/hooks/use-auth'

function MeuComponente() {
  const { 
    usuario, 
    estaAutenticado, 
    login, 
    logout,
    useAuthGuard 
  } = useAuth()

  // Protege o componente
  useAuthGuard(true)

  return (
    <div>
      {estaAutenticado ? (
        <p>Bem-vindo, {usuario?.nomeCompleto}!</p>
      ) : (
        <p>Faça login para continuar</p>
      )}
    </div>
  )
}
```

### 3. **Fluxo de Login**

```tsx
const { login, confirmarCodigo2FA } = useAuth()

// 1. Primeira etapa - Enviar credenciais
const handleLogin = async () => {
  const sucesso = await login(email, senha)
  if (sucesso) {
    // Redireciona para verificação 2FA
    navigate('/verificar-codigo')
  }
}

// 2. Segunda etapa - Confirmar código 2FA
const handleConfirmarCodigo = async () => {
  const sucesso = await confirmarCodigo2FA(email, codigo)
  if (sucesso) {
    // Login bem-sucedido, redireciona automaticamente
  }
}
```

## 🔐 Fluxo de Autenticação

### 1. **Login**
1. Usuário insere email e senha
2. Sistema valida credenciais e envia código 2FA
3. Usuário é redirecionado para verificação

### 2. **Verificação 2FA**
1. Usuário insere código de 6 dígitos
2. Sistema valida código e retorna tokens
3. **Tokens são validados e armazenados em cookies seguros**
4. Se senha expirada, redireciona para troca de senha
5. Se sucesso, redireciona para página principal

### 3. **Troca de Senha (se necessário)**
1. Usuário cria nova senha seguindo requisitos
2. Sistema valida e atualiza senha
3. Usuário é autenticado automaticamente

### 4. **Renovação Automática**
1. Interceptador do axios detecta token expirado
2. Sistema tenta renovar token automaticamente
3. Se falhar, faz logout e redireciona para login

## 🛡️ Segurança

### 1. **Tokens em Cookies Seguros**
- **JWT Token**: Armazenado em cookie com expiração de 2 horas
- **Refresh Token**: Armazenado em cookie com expiração de 7 dias
- **Configurações de Segurança**:
  - `secure: true` - Apenas HTTPS (em produção)
  - `sameSite: 'strict'` - Proteção CSRF
  - `httpOnly: false` - Acessível via JavaScript (necessário para renovação)
  - `path: '/'` - Disponível em toda aplicação

### 2. **Validação de Tokens**
- **Formato JWT**: Validação de estrutura (3 partes separadas por ponto)
- **Validação antes de salvar**: Tokens são validados antes de armazenar
- **Validação antes de enviar**: Tokens são validados antes de usar em requisições
- **Detecção de expiração**: Verifica se tokens estão próximos de expirar

### 3. **Tratamento de Erros Seguro**
- **Sem uso de `any`**: Todos os tipos são explicitamente definidos
- **Type assertion seguro**: Uso de `as unknown as Type` para conversões
- **Validação de respostas**: Verifica estrutura das respostas da API
- **Logs de erro**: Registra erros para debugging sem expor informações sensíveis

### 4. **Validações**
- Verificação de permissões por sistema
- Controle de sessões ativas
- Logout seguro com invalidação de tokens
- **Validação de formato de tokens em todas as operações**

### 5. **Armazenamento**
- **Tokens**: Cookies seguros com expiração automática
- **Dados do usuário**: Zustand store (localStorage)
- **Dados temporários**: sessionStorage
- **Limpeza automática**: Ao logout ou expiração

## 📱 Responsividade

Todas as páginas de autenticação são responsivas e seguem o design system:
- **Mobile First**: Otimizadas para dispositivos móveis
- **Breakpoints**: sm, md, lg
- **Animações**: Framer Motion para transições suaves
- **Acessibilidade**: ARIA labels e navegação por teclado

## 🔧 Configuração

### Variáveis de Ambiente
```env
VITE_API_URL_AUTH=http://devcac:7010
SYSTEM_ID=7b8659bb-1aeb-4d74-92c1-110c1d27e576
```

### Dependências
```json
{
  "zustand": "^5.0.7",
  "axios": "^1.6.0",
  "framer-motion": "^10.16.0"
}
```

### Configuração de Cookies
```typescript
// Configurações automáticas aplicadas baseadas no ambiente
export const authCookieConfig = {
  token: {
    path: '/',
    secure: !isDevelopment && !isLocalhost, // Seguro apenas em produção
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 // 2 horas
  },
  refreshToken: {
    path: '/',
    secure: !isDevelopment && !isLocalhost, // Seguro apenas em produção
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 dias
  }
}
```

## 🧪 Testes

O sistema inclui testes unitários para:
- Validação de formulários
- Fluxo de autenticação
- Gerenciamento de estado
- Interceptadores HTTP
- Gerenciamento de cookies
- **Validação de formato de tokens JWT**
- **Configurações de ambiente**

## 📝 Exemplos de Uso

### Página Protegida
```tsx
function Dashboard() {
  const { useAuthGuard, usuario } = useAuth()
  
  // Protege a rota
  useAuthGuard(true)
  
  return <div>Dashboard de {usuario?.nomeCompleto}</div>
}
```

### Componente com Logout
```tsx
function Header() {
  const { logout, usuario } = useAuth()
  
  return (
    <header>
      <span>{usuario?.nomeCompleto}</span>
      <button onClick={logout}>Sair</button>
    </header>
  )
}
```

### Verificação de Permissões
```tsx
function AdminPanel() {
  const { usuario } = useAuth()
  
  if (usuario?.tipoUsuario !== 'ADMIN') {
    return <div>Acesso negado</div>
  }
  
  return <div>Painel administrativo</div>
}
```

### Verificação de Cookies
```tsx
import { hasAuthCookies, clearAuthCookies } from '@/lib/auth'

// Verifica se existem cookies de autenticação válidos
if (hasAuthCookies()) {
  console.log('Usuário tem cookies de autenticação válidos')
}

// Limpa cookies (útil para logout manual)
clearAuthCookies()
```

### Validação de Tokens
```tsx
import { getToken, isTokenNearExpiry, getTokenInfo } from '@/lib/auth'

const token = getToken()
if (token) {
  // Verifica se está próximo de expirar
  if (isTokenNearExpiry(token)) {
    console.log('Token próximo de expirar')
  }
  
  // Obtém informações do token
  const info = getTokenInfo(token)
  if (info) {
    console.log('Token expira em:', info.exp)
  }
}
```

## 🚨 Tratamento de Erros

O sistema trata automaticamente:
- Tokens expirados
- Erros de rede
- Respostas inválidas da API
- Estados de carregamento
- Redirecionamentos
- Cookies inválidos ou expirados
- **Tokens com formato inválido**
- **Falhas na renovação automática**

## 🔄 Atualizações

Para atualizar o sistema:
1. Modifique os tipos em `types/auth.ts`
2. Atualize o serviço em `auth-service.ts`
3. Ajuste o store em `auth-store.ts`
4. Configure cookies em `cookie-utils.ts`
5. Teste as funcionalidades
6. Atualize a documentação

## 🍪 Vantagens dos Cookies

### Segurança
- **Proteção CSRF**: `sameSite: 'strict'`
- **HTTPS Only**: `secure: true` (em produção)
- **Expiração automática**: Baseada na duração dos tokens
- **Validação de formato**: Verifica estrutura JWT antes de usar
- **Detecção de ambiente**: Adapta configurações automaticamente

### Funcionalidade
- **Renovação automática**: Interceptadores axios funcionam perfeitamente
- **Persistência**: Sobrevivem a recarregamentos da página
- **Compatibilidade**: Funciona em todos os navegadores modernos
- **Debug**: Fácil de inspecionar no DevTools
- **Validação**: Verifica integridade dos tokens em todas as operações

## 🚨 Melhorias de Segurança Implementadas

### 1. **Validação de Tokens JWT**
- Verificação de formato antes de salvar
- Validação antes de usar em requisições
- Rejeição de tokens malformados

### 2. **Configuração Adaptativa de Cookies**
- `secure: true` apenas em produção
- Suporte a desenvolvimento local
- Detecção automática de ambiente

### 3. **Tratamento Seguro de Erros**
- Eliminação do uso de `any`
- Type assertion seguro
- Logs de erro sem exposição de dados sensíveis

### 4. **Validação em Múltiplas Camadas**
- Store: Valida antes de salvar
- Axios: Valida antes de enviar
- Utilitários: Valida ao recuperar

---

**Desenvolvido seguindo as diretrizes de desenvolvimento front-end do projeto CAC com foco máximo em segurança**
