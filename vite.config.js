import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import { getLoadContext } from "./load-context";

export default defineConfig({
  server: {
    port: 8787,
    allowedHosts: process.env.ALLOWED_HOSTS?.split(","),
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext,
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
