// @ts-check

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginNext from "@next/eslint-plugin-next";
import parser from "@typescript-eslint/parser"; // optional
import json from "@eslint/json";
// import css from "@eslint/css";

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // TODO
  // {
  // 	files: ["**/*.css"],
  // 	language: "css/css",
  // 	...css.configs.recommended,
  // },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.all,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintPluginPrettierRecommended,
  {
    name: "ESLint Config - nextjs",
    languageOptions: {
      parser, // optional
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": pluginNext,
    },
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    rules: {
      "max-lines-per-function": "off",
      "sort-imports": "off",
      "no-magic-numbers": "off",
      "sort-vars": "off",
      "one-var": "off",
      "no-warning-comments": "off",
      "capitalized-comments": "off",
      "sort-keys": "off",
      "max-statements": "off",
      "func-style": "off",
      "no-undefined": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "id-length": "off",
      "max-lines": "off",
      "no-ternary": "off",
      "no-underscore-dangle": "off",
    },
  },

  {
    plugins: {
      json,
    },
  },

  // lint JSON files
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    language: "json/json",
    ...json.configs.recommended,
  },

  // lint JSONC files
  {
    files: ["**/*.jsonc"],
    language: "json/jsonc",
    ...json.configs.recommended,
  },
);
