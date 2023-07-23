set -euo pipefail

cd src/db && \
    sqitch deploy --verify production && \
    cd - &&
    node /teachhub/dist/src/index.js
