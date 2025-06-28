export interface Env {
  KV_USERDATA: KVNamespace;
  KV_SESSION: KVNamespace;
  DB: D1Database;

  HOST: string;
  STAGE: "dev" | "staging" | "prod";

  SESSION_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
}
