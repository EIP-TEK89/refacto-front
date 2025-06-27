FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --no-cache

COPY . .

RUN npm run build

FROM nginx:stable-alpine

# Copy the built app to nginx html directory
# This project is configured to output to 'build' directory in vite.config.ts
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
