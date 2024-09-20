import { build } from "esbuild";

build({
  entryPoints: ["src/server.js"],
  bundle: true,
  minify: true,
  outfile: "dist/server.js",
  platform: "node",
  format: "esm",
  target: ["node20"],
  external: [
    "express",
    "body-parser",
    "compression",
    "cookie-parser",
    "cors",
    "dotenv",
    "ejs",
    "express-rate-limit",
    "jsonwebtoken",
    "lodash",
    "mongoose",
    "multer",
    "sharp",
    "socket.io",
    "stripe",
    "colors",
    "path",
    "util",
  ],
  loader: {
    ".js": "js",
    ".mjs": "js",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
  },
}).catch(() => process.exit(1));
