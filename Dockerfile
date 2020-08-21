FROM node:12.18-alpine

COPY . /app
WORKDIR /app

RUN npm install \
 && npm run build-postgresql-client \
 && npm run build

EXPOSE 3000

CMD ["npm", "start"]
