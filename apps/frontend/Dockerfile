FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN bun install
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
