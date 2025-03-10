# 使用 Nginx 作為基礎鏡像
FROM nginx:alpine

# 複製所有文件到 Nginx 的默認目錄
COPY /dist /usr/share/nginx/html

# 複製自定義的 nginx.conf 文件到 Nginx 配置目錄
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 確保 Nginx 在正確的端口上運行
EXPOSE 8050

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"] 