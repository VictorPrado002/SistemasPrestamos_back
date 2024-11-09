import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,  // Para entorno del navegador
        ...globals.node      // Para entorno de Node.js
      },
      ecmaVersion: 2021,      // Configuración de ECMAScript 2021
      sourceType: "module"    // Para utilizar import/export en módulos ES
    },
    rules: {
      // Define la regla de complejidad ciclomática
      "complexity": ["error", { "max": 0 }],
     // "no-console": "warn"
    }
  }
];
