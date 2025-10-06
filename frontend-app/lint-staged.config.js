module.exports = {
  '**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{css,scss}': ['stylelint --fix'],
};