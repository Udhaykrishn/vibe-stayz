import type { Media } from "@/types";
import { runtime } from "./env";
export function storageUrl(item: Pick<Media, "object_key">) {
  return runtime()
    .supabase.storage.from(runtime().SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(item.object_key).data.publicUrl;
}
