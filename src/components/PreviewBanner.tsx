import { previewing } from "@/lib/preview";
import Icon from "./Icon";
import PreviewExit from "./PreviewExit";
/**
 * Shown on every public page while an editor is previewing, so draft content is never
 * mistaken for the live site — including in a tab opened outside the admin panel.
 */
export default async function PreviewBanner() {
  if (!(await previewing())) return null;
  return (
    <aside className="preview-banner" role="status">
      <Icon name="eye" size={16} />
      <p>
        <strong>Preview</strong>
        <span>
          Drafts and scheduled campaigns are visible here. Guests still see the
          published site.
        </span>
      </p>
      <a href="/admin/preview">Admin</a>
      <PreviewExit />
    </aside>
  );
}
