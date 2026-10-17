import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";
export default defineConfig([
  ...next,
  ...ts,
  {
    files: ["components/editorial.tsx", "studio/**/*.{ts,tsx}"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  globalIgnores([".next/**", "out/**", "studio/dist/**", "next-env.d.ts"]),
  { rules: { "@next/next/no-img-element": "off" } },
]);
