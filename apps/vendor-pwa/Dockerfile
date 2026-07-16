FROM node:20 AS build
WORKDIR /workspace

RUN npm install -g pnpm@10.4.1

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/web-buyer/package.json apps/web-buyer/
COPY apps/vendor-pwa/package.json apps/vendor-pwa/

RUN pnpm install --filter @liveshop/vendor-pwa... --frozen-lockfile

COPY apps/vendor-pwa apps/vendor-pwa

ENV NODE_ENV=production
RUN pnpm --filter @liveshop/vendor-pwa build

FROM nginx:alpine
COPY --from=build /workspace/apps/vendor-pwa/dist /usr/share/nginx/html
COPY apps/vendor-pwa/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
