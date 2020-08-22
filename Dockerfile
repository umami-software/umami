FROM node:12.18-alpine

ENV DATABASE_URL "postgresql://umami:umami@db:5432/umami"

COPY . /app
WORKDIR /app

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "start"]
