import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const DATABASE_URL = 'postgresql://postgres.bmjkiuvaaiqaczkxkopi:B6A1Ha23092011@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
