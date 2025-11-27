import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/db-schema";

neonConfig.webSocketConstructor = ws;

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not found - running without database persistence");
      return null;
    }
    
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool, { schema });
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return null;
    }
  }
  
  return db;
}

export { schema };

