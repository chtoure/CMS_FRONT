# Étape 1 : Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On compile le projet Vue.js
RUN npm run build-only

# Étape 2 : Serveur web Nginx
FROM nginx:alpine

# Copie du build généré vers le répertoire par défaut de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration de Nginx pour une Single Page Application (Redirection vers index.html)
RUN sed -i 's/index  index.html index.htm;/index  index.html index.htm;\n        try_files $uri $uri\/ \/index.html;/g' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
