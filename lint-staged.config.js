// lint-staged.config.js
module.exports = {
  '**/*.ts?(x)': (staged) => {
    const fileNames = staged.join(' ');

    return ['tsc --noEmit --pretty', `eslint ${fileNames}`, `prettier -w ${fileNames}`];
  },
};
