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
}
