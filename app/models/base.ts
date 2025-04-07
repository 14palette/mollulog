import type { Env } from "~/env.server";

export async function fetchCached<T>(env: Env, dataKey: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
  const cacheKey = `cache::${dataKey}`;
  const cached = await env.KV_USERDATA.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const data = await fn();
  await env.KV_USERDATA.put(cacheKey, JSON.stringify(data), {
    expirationTtl: ttl ?? 60,
  });
  return data;
}

export async function deleteCache(env: Env, ...cacheKeys: string[]) {
  await Promise.all(cacheKeys.map((key) => env.KV_USERDATA.delete(`cache::${key}`)));
}

export async function flushCacheAll(env: Env) {
  await env.KV_USERDATA.list({ prefix: "cache::" }).then((keys) => {
    keys.keys.forEach((key) => env.KV_USERDATA.delete(key.name));
  });
}

export function isUniqueConstraintError(err: Error): { table: string, column: string } | null {
  const match = err.message.match(/UNIQUE constraint failed: (\w+)\.(\w+)/);
  if (match) {
    return { table: match[1], column: match[2] };
  }

  return null;
}
