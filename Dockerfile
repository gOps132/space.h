FROM node:26-alpine AS frontend-build

WORKDIR /workspace/frontend

ARG VITE_SPACEH_API_BASE=
ENV VITE_SPACEH_API_BASE=${VITE_SPACEH_API_BASE}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM php:8.5-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite

WORKDIR /var/www/html

COPY backend/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY backend /var/www/html
COPY --from=frontend-build /workspace/frontend/dist /var/www/html/public/app

EXPOSE 80
