FROM node:24-alpine AS builder
WORKDIR /app
# Prisma generation runs during npm ci (postinstall).
COPY package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_SITE_URL=https://enotdev.su \
    NEXT_PUBLIC_CHAT_SOCKET_URL=https://enotdev.su \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
# Prisma CLI and tsx are required for migrations and the chat process.
COPY --from=builder --chown=node:node /app ./
USER node
EXPOSE 3000 3001
CMD ["npm", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]