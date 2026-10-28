import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@types"],
  webpack: (config) => {
    config.resolve.fallback = {
      net: false,
      tls: false,
      fs: false,
      readline: false,
    };

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add rule for WebAssembly files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    // Let webpack bundle webscape-wanderer's web worker
    config.module.rules.push({
      test: /webscape-wanderer[\\/]dist[\\/]webscape-wanderer\.js$/,
      use: path.resolve(__dirname, "webpack/webscape-worker-loader.cjs"),
    });

    return config;
  },
};

export default nextConfig;
