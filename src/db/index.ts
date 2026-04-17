import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

export function getDb(): Db {
  if (cached) {
    return cached;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local (see .env.example)."
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}
