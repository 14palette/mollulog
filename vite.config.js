import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import { getLoadContext } from "./load-context";

export default defineConfig({
  server: {
    port: 8787,
    allowedHosts: process.env.ALLOWED_HOSTS?.split(","),
  },
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
  ],
});
