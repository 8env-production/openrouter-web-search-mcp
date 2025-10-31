# syntax=docker/dockerfile:1

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    npm_config_cache=/tmp/npm-cache

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

EXPOSE 80

CMD ["node", "src/index.js"]