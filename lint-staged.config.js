module.exports = {
    '**/*.ts?(x)': () => ['npm run typecheck', 'npm run lint:fix'],
    '**/*.(css|scss)': () => 'npm run stylelint:fix',
};
