import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/**
 * Drizzle CLI uses `pg`. Neon’s **pooled** URL (`-pooler` host) can hang on some DDL.
 * Prefer Neon’s **direct** connection string for migrations via `MIGRATE_DATABASE_URL`.
 * `connect_timeout` avoids an endless spinner if the network or URL is wrong.
 */
function migrateConnectionUrl(): string {
  const raw =
    process.env.MIGRATE_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Set DATABASE_URL in .env.local (or MIGRATE_DATABASE_URL with Neon’s direct / non-pooler URL for migrations)."
    );
  }
  if (raw.includes("connect_timeout=")) {
    return raw;
  }
  return raw.includes("?") ? `${raw}&connect_timeout=20` : `${raw}?connect_timeout=20`;
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: migrateConnectionUrl(),
  },
});
