﻿# Client/Dockerfile

# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve stage ---
FROM nginx:stable-alpine
# Copy build artifacts
COPY --from=build /app/dist /usr/share/nginx/html
# Copy your custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
