FROM node:12.18-alpine

ARG DATABASE_TYPE

ENV DATABASE_URL "postgresql://umami:umami@db:5432/umami" \
    DATABASE_TYPE=$DATABASE_TYPE

COPY . /app
WORKDIR /app

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "start"]
