FROM node:16.17-slim

ADD ./src /teachhub/src/
ADD ./data /teachhub/data/
ADD ./package.json /teachhub/
ADD ./package-lock.json /teachhub/
ADD ./tsconfig.json /teachhub/
ADD ./entrypoint.sh /teachhub/

WORKDIR /teachhub/

EXPOSE 3000

RUN apt-get update && \
    apt-get -y install sqitch

RUN npm install && npx tsc

ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]

