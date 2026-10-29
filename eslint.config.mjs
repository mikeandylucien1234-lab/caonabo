import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    // Abaissées en avertissement : ce sont des problèmes réels à corriger,
    // mais pas des bugs qui affectent les utilisateurs — on ne bloque pas le
    // build dessus tant qu'ils n'ont pas été traités.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
