const js = require("@eslint/js");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "generated/**",
      "eslint.config.js",
    ],
  },

  js.configs.recommended,

  {
    files: ["src/**/*.js", "tests/**/*.js", "seed.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
