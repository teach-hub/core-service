set -euo pipefail

sqitch deploy production && \
    sqitch verify production && \
    node /teachhub/dist/index.js
