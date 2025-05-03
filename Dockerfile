# Этап сборки (builder)
FROM node:slim AS builder

WORKDIR /app

# Копируем файлы проекта
COPY src/ .

# Устанавливаем зависимости (если нужны, например для минификации)
RUN npm install -g uglify-js clean-css-cli

# Минифицируем JavaScript
RUN uglifyjs scripts.js -o scripts.min.js --compress --mangle

# Минифицируем CSS
RUN cleancss -o styles.min.css styles.css

# Этап финального образа
FROM nginx:alpine

# Удаляем дефолтную конфигурацию Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Копируем нашу конфигурацию Nginx
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

# Запрещаем вывод версии Nginx в заголовках
RUN echo "server_tokens off;" > /etc/nginx/conf.d/server_tokens.conf

# Копируем минифицированные файлы из этапа builder
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/scripts.min.js /usr/share/nginx/html/scripts.js
COPY --from=builder /app/styles.min.css /usr/share/nginx/html/styles.css

# Удаляем лишнее
RUN rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

# Устанавливаем права
# RUN chown -R nginx:nginx /usr/share/nginx/html && \
#     chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]