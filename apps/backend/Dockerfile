FROM node:20
WORKDIR /workspace

RUN npm install -g pnpm@10.4.1

# Manifests du workspace d'abord (cache Docker) — tous les importers
# sont requis pour la validation --frozen-lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/web-buyer/package.json apps/web-buyer/
COPY apps/vendor-pwa/package.json apps/vendor-pwa/

RUN pnpm install --filter @liveshop/backend... --prod --frozen-lockfile

# Code de l'app
COPY apps/backend apps/backend

WORKDIR /workspace/apps/backend
EXPOSE 3001
CMD ["node", "src/app.js"]
