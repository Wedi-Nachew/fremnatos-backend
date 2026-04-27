FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npm run build content-service

CMD ["node", "dist/apps/content-service/main"]