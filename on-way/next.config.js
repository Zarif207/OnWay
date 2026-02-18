import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Important on Windows monorepo-like setups: prevents Next from inferring
  // an incorrect workspace root (e.g. picking another package-lock.json up-tree),
  // which can break node_modules resolution.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
