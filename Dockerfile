FROM node:16.17-slim

ARG PORT
ARG DB_URL
ARG NODE_ENV

ADD ./src /teachhub/src/
ADD ./data /teachhub/data/
ADD ./package.json /teachhub/
ADD ./package-lock.json /teachhub/
ADD ./tsconfig.json /teachhub/
ADD ./entrypoint.sh /teachhub/

WORKDIR /teachhub/

ENV PORT=$PORT
ENV DB_URL=$DB_URL
ENV NODE_ENV=$NODE_ENV

RUN apt-get update && \
    apt-get -y install sqitch

RUN npm install && npx tsc

ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]

