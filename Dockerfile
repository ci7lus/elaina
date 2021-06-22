FROM node:14.17.1-buster AS build

# Install dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn

# Build application
COPY src/ src/
COPY .postcssrc.json tailwind.config.js tsconfig.json ./
RUN yarn run build

# Static file serving
FROM nginx:stable-alpine
LABEL maintainer="ci7lus <ci7l@googlegroups.com>"

ARG PORT=1234
RUN { \
    echo "server {"; \
    echo "  listen ${PORT};"; \
    echo "  server_name localhost;"; \
    echo "  root /usr/share/nginx/html;"; \
    echo ""; \
    echo "  location / {"; \
    echo "    try_files \$uri \$uri/ /index.html;"; \
    echo "  }"; \
    echo "}"; \
    } > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/*.html /app/dist/*.js /app/dist/*.css /usr/share/nginx/html/

EXPOSE ${PORT}
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
