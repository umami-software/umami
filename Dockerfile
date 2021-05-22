FROM node:14.17.0-alpine3.13 AS build
WORKDIR /build
RUN yarn config set --home enableTelemetry 0
COPY package.json /build/
RUN yarn
COPY . /build
RUN yarn build
# RUN yarn prisma migrate dev
CMD ["yarn", "start"]
