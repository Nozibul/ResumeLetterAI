require('dotenv').config({ path: '.env.local' });

module.exports = {
  extends: [
    'airbnb-base',
    'plugin:security/recommended',
    'prettier'
  ],
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'security/detect-object-injection': 'off'
  }
};