export interface Env {
  KV_USERDATA: KVNamespace;
  KV_SESSION: KVNamespace;
  KV_STATIC_DATA: KVNamespace<string>;
  DB: D1Database;

  HOST: string;
  STAGE: "dev" | "prod";

  SESSION_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  SUPERUSER_NAME: string;

  EMAIL_ROUTE_HOST: string;
  EMAIL_ROUTE_API_KEY: string;
  EMAIL_ROUTE_DESTINATION: string;
}
