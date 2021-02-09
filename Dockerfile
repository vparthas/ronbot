FROM node:14
WORKDIR /usr/src/app

COPY package*.json app.js ./
RUN npm install
RUN npm i frontail -g

EXPOSE 3000
EXPOSE 9001

ENV FB_USER ""
ENV FB_PASS ""

CMD ["node", "app.js", "|", "frontail", "-"]