set -euo pipefail

cd src/db && \
    sqitch target add production db:pg://$DB_URL && \
    sqitch deploy --verify production && \
    cd - &&
    node /teachhub/dist/src/index.js
