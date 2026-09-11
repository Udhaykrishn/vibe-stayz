import { getSupabase } from "./supabase";
import type { RuntimeEnv } from "../types";
export const runtime = (): RuntimeEnv => ({
  supabase: getSupabase(),
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  DEMO_MODE: process.env.DEMO_MODE,
  SITE_ORIGIN: process.env.SITE_ORIGIN,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || "media",
});
