import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginUnusedImports from "eslint-plugin-unused-imports"; // Plugin na nevyužívané importy

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Pre prácu v prostriedí prehliadača
      },
      parserOptions: {
        ecmaVersion: 2020,  // Podpora moderných ECMAScript funkcií
        sourceType: "module", // Pre podporu ES6 modulov
        jsx: true, // Povolenie pre JSX
      },
    },
  },
  pluginJs.configs.recommended, // Prednastavené pravidlá pre JavaScript
  pluginReact.configs.flat.recommended, // Prednastavené pravidlá pre React (pre React 18+)
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      'unused-imports': pluginUnusedImports, // Na kontrolu nevyužívaných importov
    },
    rules: {
      'react/jsx-uses-react': 'off', // React už nie je potrebný v scope pre JSX (React 18+)
      'react/react-in-jsx-scope': 'off', // Zabezpečí, že už nemusíš mať React importovaný pre JSX
      'react/jsx-uses-vars': 'error', // Zaistíme, že nevyužité JSX premenné sa považujú za chyby
      'unused-imports/no-unused-imports': 'warn', // Varovanie pre nevyužívané importy
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: false }, // Varovanie pre nevyužívané premenné
      ],
    },
  },
];
