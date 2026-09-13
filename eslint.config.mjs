import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLint 9 requires flat config; eslint-config-next's "next/core-web-vitals"
// preset is still authored as a legacy shareable config, so this uses the
// official compat shim (same pattern create-next-app generates) rather
// than the old .eslintrc.json, which ESLint 9 can no longer read directly.
const eslintConfig = [...compat.extends("next/core-web-vitals")];

export default eslintConfig;
