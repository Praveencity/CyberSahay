FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PLAYWRIGHT_BROWSERS_PATH=/opt/browsers PORT=3000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/next.config.mjs ./
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && ./node_modules/.bin/playwright install --with-deps --only-shell chromium \
    && rm -rf /var/lib/apt/lists/*
USER node
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec ./node_modules/.bin/next start --hostname 0.0.0.0"]
