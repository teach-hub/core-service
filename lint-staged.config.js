// lint-staged.config.js
module.exports = {
  "**/*.ts?(x)": (staged) => ["tsc --noEmit --pretty", `prettier -w ${staged.join(' ')}`],
};
