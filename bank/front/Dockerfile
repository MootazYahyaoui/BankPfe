FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular @angular/build:application -> fichiers dans dist/.../browser (pas la racine dist)
COPY --from=build /app/dist/propsbank-dashboard/browser /usr/share/nginx/html

EXPOSE 80
