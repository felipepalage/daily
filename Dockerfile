# ---- Estágio 1: build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Instala as dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera o build de produção (standalone)
COPY . .
RUN npm run build

# ---- Estágio 2: runtime (imagem final, mínima) ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Escuta em todas as interfaces para ser acessível na rede
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copia só o necessário do build standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
