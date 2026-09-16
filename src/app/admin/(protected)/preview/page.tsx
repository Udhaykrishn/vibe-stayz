import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import PreviewFrame, { type PreviewTarget } from "@/components/PreviewFrame";
import { exitPreview } from "@/lib/preview-actions";
import { previewing, previewPath } from "@/lib/preview";
import { offerStatus } from "@/lib/offers";
import { siteData } from "@/services/data";
export const metadata = { title: "Preview" };
/** The pages that always exist, whatever is in the collection. */
const PAGES: [string, string][] = [
  ["/", "Home"],
  ["/resorts", "All stays"],
  ["/locations", "Destinations"],
  ["/offers", "Offers"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/image-credits", "Image credits"],
];
export default async function Preview({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const data = await siteData("admin");
  const live = await previewing();
  const targets: PreviewTarget[] = [
    ...PAGES.map(([path, label]) => ({ label, path, group: "Pages" })),
    ...data.resorts
      .filter((resort) => !resort.archived)
      .map((resort) => ({
        label: `${resort.name} · ${resort.location?.name || "No destination"}`,
        path: `/resorts/${resort.slug}`,
        group: "Stays",
        status: resort.published ? "Published" : "Draft",
        draft: !resort.published,
      })),
    ...data.locations.map((location) => ({
      label: location.name,
      path: `/locations/${location.slug}`,
      group: "Destinations",
      status: location.published ? "Published" : "Draft",
      draft: !location.published,
    })),
  ];
  const requested = previewPath((await searchParams).path);
  const initialPath = targets.some((target) => target.path === requested)
    ? requested
    : "/";
  const waiting = [
    ...data.resorts.filter((r) => !r.published && !r.archived).map((r) => ({
      label: r.name,
      detail: "Draft stay",
      path: `/resorts/${r.slug}`,
      edit: `/admin/resorts/${r.id}`,
    })),
    ...data.locations.filter((l) => !l.published).map((l) => ({
      label: l.name,
      detail: "Draft destination",
      path: `/locations/${l.slug}`,
      edit: `/admin/locations/${l.id}`,
    })),
    ...data.offers
      .filter((o) => offerStatus(o) !== "Active")
      .map((o) => ({
        label: o.title,
        detail: `${offerStatus(o)} campaign`,
        path: "/offers",
        edit: `/admin/offers/${o.id}`,
      })),
  ];
  return (
    <AdminLayout
      title="Preview"
      description="See your site the way guests will — drafts, scheduled campaigns and unpublished edits included."
      actions={
        live ? (
          <form action={exitPreview}>
            <input type="hidden" name="back" value="/admin/preview" />
            <button type="submit" className="button button-outline">
              <Icon name="close" size={16} />
              Turn preview off
            </button>
          </form>
        ) : undefined
      }
    >
      <p className="preview-note">
        <Icon name="eye" size={17} />
        <span>
          Preview only follows your own signed-in browser. Nothing here is
          visible to guests until you publish it. Archived stays and hidden
          addresses stay hidden, exactly as on the live site.
        </span>
      </p>
      <PreviewFrame targets={targets} initialPath={initialPath} />
      {!!waiting.length && (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>Waiting to go live</h2>
            <p className="field-help">{waiting.length} items</p>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table list-table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {waiting.map((item) => (
                  <tr key={`${item.edit}`}>
                    <td>
                      <strong>{item.label}</strong>
                    </td>
                    <td>
                      <span className="status-pill draft">{item.detail}</span>
                    </td>
                    <td className="preview-row-actions">
                      <a href={`/admin/preview?path=${encodeURIComponent(item.path)}`}>
                        Preview
                        <Icon name="eye" size={15} />
                      </a>
                      <a className="table-edit" href={item.edit}>
                        Edit
                        <Icon name="edit" size={15} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
