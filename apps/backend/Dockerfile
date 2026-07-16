FROM node:20
WORKDIR /workspace

RUN npm install -g pnpm@10

# Manifests du workspace d'abord (cache Docker)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/

RUN pnpm install --filter @liveshop/backend... --prod --no-frozen-lockfile

# Code de l'app
COPY apps/backend apps/backend

WORKDIR /workspace/apps/backend
EXPOSE 3001
CMD ["node", "src/app.js"]
