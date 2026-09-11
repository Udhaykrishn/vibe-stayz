import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import { cms } from "@/lib/cms-config";
import { isEntity, tableRows } from "@/services/data";
type Props = {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ q?: string; status?: string; saved?: string }>;
};
export async function generateMetadata({ params }: Props) {
  const { entity } = await params;
  return { title: cms[entity]?.label || "Admin" };
}
export default async function EntityList({ params, searchParams }: Props) {
  const { entity } = await params;
  if (!cms[entity] || !isEntity(entity)) notFound();
  if (entity === "site_settings") redirect("/admin/site_settings/global");
  const config = cms[entity];
  const all = (
    await tableRows<Record<string, string | number | null>>(entity)
  ).sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
  const search = await searchParams;
  const q = (search.q || "").toLowerCase();
  const status = search.status || "";
  const records = all.filter(
    (r) =>
      (!q ||
        `${r.name || r.title || r.label || ""} ${r.page || ""} ${r.section || ""}`
          .toLowerCase()
          .includes(q)) &&
      (!status ||
        (status === "sample" && r.is_demo) ||
        (status === "published" && (r.published || r.active) && !r.archived) ||
        (status === "draft" && !(r.published || r.active)) ||
        (status === "archived" && r.archived)),
  );
  const canCreate = entity !== "page_content";
  return (
    <AdminLayout
      title={config.label}
      description={config.description}
      actions={
        canCreate ? (
          <a href={`/admin/${entity}/new`} className="button button-dark">
            <Icon name="plus" size={17} />
            Add {config.singular.toLowerCase()}
          </a>
        ) : undefined
      }
    >
      {search.saved && (
        <div className="success-note" role="status">
          Your changes have been saved.
        </div>
      )}
      <section className="admin-panel">
        <form className="admin-list-filters">
          <label className="admin-search">
            <Icon name="search" size={18} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={`Search ${config.label.toLowerCase()}`}
              aria-label={`Search ${config.label}`}
            />
          </label>
          <select
            name="status"
            aria-label="Filter by status"
            defaultValue={status}
          >
            <option value="">All statuses</option>
            <option value="published">Published / active</option>
            <option value="draft">Draft / inactive</option>
            <option value="sample">Sample content</option>
            {entity === "resorts" && <option value="archived">Archived</option>}
          </select>
          <button className="button button-outline" type="submit">
            Filter
          </button>
          <p>{records.length} items</p>
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{config.singular}</th>
                <th>Status</th>
                <th>Order</th>
                <th>Updated</th>
                <th>
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={String(r.id)}>
                  <td>
                    <a
                      className="record-title"
                      href={`/admin/${entity}/${r.id}`}
                    >
                      {(r.cover_image || r.image || r.photo) && (
                        <img
                          src={String(r.cover_image || r.image || r.photo)}
                          alt=""
                          width="68"
                          height="50"
                        />
                      )}
                      <span>
                        <strong>
                          {entity === "page_content"
                            ? `${r.page} · ${r.section}`
                            : r.name || r.title || r.label}
                        </strong>
                        <small>
                          {r.subtitle || r.category || r.badge || ""}
                          {r.is_demo ? " · Sample" : ""}
                        </small>
                      </span>
                    </a>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${r.archived || r.published === 0 || r.active === 0 ? "draft" : "published"}`}
                    >
                      {r.archived
                        ? "Archived"
                        : r.published === 0 || r.active === 0
                          ? "Draft"
                          : "Active"}
                    </span>
                    {r.featured === 1 && (
                      <span className="featured-tag">Featured</span>
                    )}
                  </td>
                  <td>{r.display_order}</td>
                  <td>
                    {new Date(String(r.updated_at)).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" },
                    )}
                  </td>
                  <td>
                    <a href={`/admin/${entity}/${r.id}`} className="table-edit">
                      Edit
                      <Icon name="edit" size={15} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <div className="empty-state">
            <Icon name={config.icon} size={30} />
            <h2>No {config.label.toLowerCase()} here yet.</h2>
            <p>
              {q || status
                ? "Try another search or clear your filters."
                : "Add your first item to start building your collection."}
            </p>
            <a
              className="button button-dark"
              href={q || status ? `/admin/${entity}` : `/admin/${entity}/new`}
            >
              {q || status
                ? "Clear filters"
                : `Add ${config.singular.toLowerCase()}`}
            </a>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
