FROM node:14-alpine

RUN apk add --update ffmpeg

RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

RUN apk add make && apk add build-base

WORKDIR /bot

COPY . .

RUN npm install 

CMD npm run devStart