# --- Étape 1 : build de l'app React/Vite ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Laissé vide par défaut : les appels API deviennent relatifs (ex: /api/movies),
# ce qui permet à Nginx de les rediriger vers le backend, peu importe l'IP utilisée.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Étape 2 : servir les fichiers statiques avec Nginx ---
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
