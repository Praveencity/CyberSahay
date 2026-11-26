import next from "eslint-config-next/core-web-vitals";
export default [
  ...next,
  { ignores: [".next/**", "node_modules/**"] },
  { rules: { "react-hooks/set-state-in-effect": "off", "no-undef": "error" } },
];
