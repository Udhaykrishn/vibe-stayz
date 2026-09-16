import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import { MediaPicker, MediaTools } from "@/components/AdminFields";
import { tableRows } from "@/services/data";
import {
  mediaPath,
  mediaUsage,
  storageUrl,
  usageSummary,
  usageTotal,
} from "@/lib/media";
import type { Media } from "@/types";
export const metadata = { title: "Media library" };
const notes: Record<string, string> = {
  replaced: "The photograph has been replaced everywhere it appears.",
  renamed: "The image details have been saved.",
  deleted: "The image has been deleted from your library.",
};
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [search, rows, usage] = await Promise.all([
    searchParams,
    tableRows<Media>("media"),
    mediaUsage(),
  ]);
  const media = rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <AdminLayout
      title="Media library"
      description="The photographs that bring your collection to life. Replace an image here and every page using it updates."
      actions={
        <button className="button button-dark" data-open-library>
          <Icon name="plus" size={18} />
          Upload image
        </button>
      }
    >
      {search.saved && notes[search.saved] && (
        <div className="success-note" role="status">
          {notes[search.saved]}
        </div>
      )}
      <section className="admin-panel">
        <p id="library-status" role="status" />
        <div className="media-library-grid">
          {media.map((m) => {
            const places = usage.get(mediaPath(m.id)) || [];
            const total = usageTotal(places);
            return (
              <article
                key={m.id}
                data-media-card={m.id}
                data-media-filename={m.filename}
                data-media-alt={m.alt || ""}
                data-media-usage={total}
                data-media-where={usageSummary(places)}
              >
                <img
                  src={storageUrl(m)}
                  alt={m.alt || m.filename}
                  width="300"
                  height="220"
                  loading="lazy"
                />
                <div>
                  <h2>{m.filename}</h2>
                  <p>
                    {Math.round(m.size / 1024)} KB ·{" "}
                    {m.content_type.replace("image/", "").toUpperCase()}
                    {m.width && m.height ? ` · ${m.width}×${m.height}` : ""}
                  </p>
                  <p className="media-alt">
                    {m.alt || "No image description yet."}
                  </p>
                  <p className="media-usage">
                    {total
                      ? `In use · ${usageSummary(places)}`
                      : "Not used on the website yet."}
                  </p>
                  <div className="media-card-actions">
                    <button
                      type="button"
                      className="button button-outline"
                      data-replace-media={m.id}
                    >
                      <Icon name="refresh" size={15} />
                      Replace
                    </button>
                    <button
                      type="button"
                      className="button button-outline"
                      data-edit-media={m.id}
                    >
                      <Icon name="edit" size={15} />
                      Edit details
                    </button>
                  </div>
                  <div className="media-card-links">
                    <button className="text-link" data-copy-url={mediaPath(m.id)}>
                      Copy image URL
                      <Icon name="external" size={14} />
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      data-delete-media={m.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!media.length && (
          <div className="empty-state">
            <Icon name="image" size={32} />
            <h2>Every good stay has a story to show.</h2>
            <p>
              Upload photographs here, then choose them in your property,
              destination or content editors.
            </p>
            <button className="button button-dark" data-open-library>
              Upload your first image
            </button>
          </div>
        )}
      </section>
      <MediaPicker />
      <MediaTools />
    </AdminLayout>
  );
}
