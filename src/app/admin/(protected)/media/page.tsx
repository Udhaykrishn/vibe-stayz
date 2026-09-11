import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import { MediaPicker } from "@/components/AdminFields";
import { tableRows } from "@/services/data";
import { storageUrl } from "@/lib/media";
import type { Media } from "@/types";
export const metadata = { title: "Media library" };
export default async function MediaPage() {
  const media = (await tableRows<Media>("media")).sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  return (
    <AdminLayout
      title="Media library"
      description="The photographs that bring your collection to life."
      actions={
        <button className="button button-dark" data-open-library>
          <Icon name="plus" size={18} />
          Upload image
        </button>
      }
    >
      <section className="admin-panel">
        <div className="media-library-grid">
          {media.map((m) => (
            <article key={m.id}>
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
                </p>
                <button className="text-link" data-copy-url={storageUrl(m)}>
                  Copy image URL
                  <Icon name="external" size={14} />
                </button>
              </div>
            </article>
          ))}
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
        <p id="copy-status" role="status" />
      </section>
      <MediaPicker />
    </AdminLayout>
  );
}
