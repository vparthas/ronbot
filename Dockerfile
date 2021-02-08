FROM node:14
WORKDIR /usr/src/app

COPY package*.json app.js ./
RUN npm install

EXPOSE 3000
EXPOSE 9001

ENV FB_USER "CHANGEME"
ENV FB_PASS "CHANGEME"

CMD ["node", "app.js", "|", "frontail"]