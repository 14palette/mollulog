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
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
