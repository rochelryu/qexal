# Utilisez une image Node.js officielle comme base
FROM node:20-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN rm -rf /app

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

ENV PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin/python3:$PATH"

# Copiez le package.json et le package-lock.json pour installer les dépendances
COPY package*.json ./

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev

RUN apk add --no-cache python3

RUN npm install -g npm@10.2.0

RUN npm install -g node-gyp

RUN npm install -g @nestjs/cli

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers de l'application
COPY . .

# lance le build de l'application nodeJS
RUN npm run build

# Exposez le port sur lequel l'application écoute
EXPOSE 5005
EXPOSE 5006

# Commande pour démarrer l'application en production
CMD ["npm", "run", "start:prod"]