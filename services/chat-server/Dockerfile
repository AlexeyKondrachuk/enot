FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
RUN npm ci

COPY lib ./lib
COPY services/chat-server ./services/chat-server

EXPOSE 3001
CMD ["npm", "run", "chat:start"]
