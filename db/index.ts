import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "../auth-schema";
import * as appSchema from "./schema";

export const db = drizzle(neon(process.env.DATABASE_URL!), {
  schema: { ...authSchema, ...appSchema },
});