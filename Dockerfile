# Multi-stage build otimizado para frontend React/TypeScript
FROM node:20-alpine AS base

# Habilitar corepack para pnpm
RUN corepack enable pnpm

# Instalar dependencies necessárias para alpine
RUN apk add --no-cache libc6-compat

# Estágio de dependências
FROM base AS deps
WORKDIR /app

# Copiar arquivos de configuração do pnpm e package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Configurar pnpm para otimização
RUN pnpm config set store-dir /app/.pnpm-store

# Instalar dependências com cache otimizado
RUN --mount=type=cache,id=pnpm,target=/app/.pnpm-store \
    pnpm install --frozen-lockfile --prefer-offline

# Estágio de build
FROM base AS builder
WORKDIR /app

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar arquivos de configuração
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY vite.config.ts tsconfig*.json components.json ./
COPY eslint.config.js ./

# Copiar código fonte
COPY src ./src
COPY public ./public
COPY index.html ./

# Definir variáveis de ambiente para build
ENV NODE_ENV=production

# ARGs para informações de versão e build (injetados pelo CI/CD)
ARG BUILD_TIME
ARG COMMIT_SHA
ARG BUILD_NUMBER
ARG APP_ENV=production

# Converter ARGs de build em ENVs para o Vite usar durante o build
ENV VITE_BUILD_TIME=${BUILD_TIME}
ENV VITE_COMMIT_SHA=${COMMIT_SHA}
ENV VITE_BUILD_NUMBER=${BUILD_NUMBER}
ENV VITE_APP_ENV=${APP_ENV}

# ARGs para variáveis de ambiente da aplicação (podem ser passados no build)
ARG VITE_API_URL=http://devcac:7000/api
ARG VITE_API_URL_AUTH=http://devcac:7000
ARG VITE_VIACEP_URL=https://viacep.com.br/ws
ARG VITE_SYSTEM_ID=7b8659bb-1aeb-4d74-92c1-110c1d27e576
ARG VITE_CHAT_URL=http://devcac:7014/chat

# Converter ARGs em ENVs para o Vite usar durante o build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_URL_AUTH=${VITE_API_URL_AUTH}
ENV VITE_VIACEP_URL=${VITE_VIACEP_URL}
ENV VITE_SYSTEM_ID=${VITE_SYSTEM_ID}
ENV VITE_CHAT_URL=${VITE_CHAT_URL}



# Executar build de produção
RUN echo "🏗️ Building production..." && \
    pnpm build

# Verificar se o build foi gerado corretamente
RUN ls -la dist/ && test -f dist/index.html

# Estágio de produção com nginx otimizado
FROM nginx:alpine AS runner

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html



# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

# Labels para metadados
LABEL org.opencontainers.image.title="CAC Frontend"
LABEL org.opencontainers.image.description="Interface React/TypeScript para sistema CAC"
LABEL org.opencontainers.image.source="https://github.com/SUBG-RioSaude/cac-frontend"

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
