import { build } from "esbuild";

build({
  entryPoints: ["src/server.js"],
  bundle: true,
  outfile: "dist/server.js",
  platform: "node",
  format: "esm",
  minify: true,
  target: ["es2020"],
}).catch(() => process.exit(1));
