import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is currently causing a fatal panic with Tailwind v4 on this environment.
  // Falling back to default loader for stability.
};

export default nextConfig;
