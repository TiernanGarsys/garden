FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm install 
RUN npm ci --only=production

EXPOSE 3000
# TODO(tiernan): Fix issues with 404s when trying to run in dev mode
CMD [ "npm", "start" ]

