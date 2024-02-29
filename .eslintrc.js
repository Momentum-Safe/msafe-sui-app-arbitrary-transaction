module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    // env var
    //
    es2020: true,
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // global var
    //
    // myGlobal: false
  },
  rules: {
    // customize
    '@typescript-eslint/consistent-type-definitions': 0,
    'no-unused-vars': 1,
    'no-new-native-nonconstructor': 0,
    'no-param-reassign': 0,
  },
};
