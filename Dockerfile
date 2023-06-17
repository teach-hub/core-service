FROM node:16.17-slim

ADD ./src /teachhub/src/
ADD ./data /teachhub/data/
ADD ./package.json /teachhub/
ADD ./package-lock.json /teachhub/
ADD ./tsconfig.json /teachhub/
ADD ./entrypoint.sh /teachhub/

WORKDIR /teachhub/

RUN apt-get update && \
    apt-get -y install sqitch

# TODO: Multistage builds (devDepdencies + prod deps en build stage)
# y solo las de prod para correr la app.

RUN npm ci && npx tsc

# Emulamos un segundo stage "limpio".

RUN rm -rf ./node_modules

# Queremos que el build corra como dev
# (ahi tenemos las dependencias para buildear todo).

ARG PORT
ARG DB_URL
ARG NODE_ENV
ARG GITHUB_APP_CLIENT_ID
ARG GITHUB_APP_CLIENT_SECRET

ENV PORT=$PORT
ENV DB_URL=$DB_URL
ENV NODE_ENV=$NODE_ENV
ENV GITHUB_APP_CLIENT_ID=$GITHUB_APP_CLIENT_ID
ENV GITHUB_APP_CLIENT_SECRET=$GITHUB_APP_CLIENT_SECRET

RUN echo "Using node_env $NODE_ENV"

# Instalamos "de nuevo" las dependencias
# (esta vez solo las de prod).

RUN NODE_ENV=production npm ci

# Entrypoint custom

ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]

