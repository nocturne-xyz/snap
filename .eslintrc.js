module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
  },

  extends: ["../../node_modules/@metamask/eslint-config"],

  overrides: [
    {
      files: ["**/*.js"],
      extends: ["../../node_modules/@metamask/eslint-config-nodejs"],
    },

    {
      files: ["**/*.{ts,tsx}"],
      extends: ["../../node_modules/@metamask/eslint-config-typescript"],
      rules: {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/no-empty-function": "off",
        "jsdoc/require-description": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-returns": "off",
        "consistent-return": "off",
        "no-negated-condition": "off",
        "no-case-declarations": "off",
      },
    },
  ],

  ignorePatterns: [
    "!.prettierrc.js",
    "**/!.eslintrc.js",
    "**/dist*/",
    "**/*__GENERATED__*",
    "**/build",
    "**/public",
    "**/.cache",
  ],
};
