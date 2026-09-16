# =================
# STAGE 1 : Builder
# =================
FROM node:22-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Vite fige les VITE_* au build. Vide par defaut : dans une image, le front est
# servi par la meme gateway que l'API, l'URL publique n'est donc pas connue ici
# et une base vide fait tomber les appels sur l'origine de la page.
ARG VITE_API_URL=""
ARG VITE_API_MODE="http"
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_MODE=${VITE_API_MODE}

RUN pnpm build

# ================
# STAGE 2 : Runner
# ================
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
