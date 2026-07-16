FROM node:18 as build
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec pnpm (sans frozen-lockfile)
RUN pnpm install --no-frozen-lockfile

# Copier le reste du code
COPY . .

# Build avec pnpm en mode PRODUCTION (important pour .env.production)
ENV NODE_ENV=production

# Debug : Afficher le contenu de .env.production
RUN echo "📋 Contenu de .env.production:" && cat .env.production || echo "❌ Fichier .env.production non trouvé"

RUN pnpm run build

# Debug : Vérifier que l'URL est correcte dans le build
RUN echo "🔍 Vérification du build..." && \
    grep -r "localhost:3001" dist/ && echo "⚠️ ATTENTION: localhost:3001 trouvé dans le build!" || echo "✅ Pas de localhost:3001 dans le build" && \
    grep -r "api.livelink.store" dist/ && echo "✅ api.livelink.store trouvé dans le build" || echo "⚠️ ATTENTION: api.livelink.store NOT FOUND"

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
