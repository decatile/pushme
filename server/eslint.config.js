import globals from "globals";
import pluginJs from "@eslint/js";
import eslintTs from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...eslintTs.configs.recommended,
];
