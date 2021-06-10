
FROM node:10 AS ui-build
WORKDIR /usr/src/app
COPY my-app/ ./my-app/
RUN cd my-app && npm install && npm run build

FROM node:10 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/my-app/dist ./my-app/dist
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/server.js ./server/

EXPOSE 3080

CMD ["node", "./server/server.js"]