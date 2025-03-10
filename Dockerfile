FROM node:20.11-alpine as build

WORKDIR /app
COPY . /app

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8050
CMD ["nginx","-g","daemon off;"]