FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json ./
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN bun install --production
ENV DB_PATH=/app/data/finance.db
EXPOSE 3000
CMD ["bun", "run", "index.ts"]
