set -euo pipefail

cd src/db && \
    sqitch deploy production && sqitch verify production && \
    cd - &&
    node /teachhub/dist/src/index.js
