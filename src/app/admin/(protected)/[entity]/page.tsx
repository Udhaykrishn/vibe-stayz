import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import OfferAdminList from "@/components/OfferAdminList";
import { siteData } from "@/services/data";
import { cms } from "@/lib/cms-config";
import { isEntity, tableRows } from "@/services/data";
import { previewHref, recordPath } from "@/lib/preview";
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
  if (entity === "offers") return <AdminLayout title="Offers" description={config.description} actions={<div className="page-actions"><a href={previewHref("/offers")} className="button button-outline"><Icon name="eye" size={16}/>Preview site</a><a href="/admin/offers/new" className="button button-dark">Create campaign</a></div>}><OfferAdminList data={await siteData("admin")}/></AdminLayout>;
  const all = (
    await tableRows<Record<string, string | number | null>>(entity)
  ).filter(r => entity !== "page_content" || r.page !== "home" || !["hero", "carousel_stay", "carousel_destination", "carousel_fallback"].includes(String(r.section))).sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
  const search = await searchParams;
  const q = (search.q || "").toLowerCase();
  const status = search.status || "";
  const records = all.filter(
    (r) =>
      (!q ||
        `${r.name || r.title || r.question || r.label || ""} ${r.page || ""} ${r.section || ""}`
          .toLowerCase()
          .includes(q)) &&
      (!status ||
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
        <div className="page-actions">
          <a
            href={previewHref(recordPath(entity, {}) || "/")}
            className="button button-outline"
          >
            <Icon name="eye" size={16} />
            Preview
          </a>
          {canCreate && (
            <a href={`/admin/${entity}/new`} className="button button-dark">
              <Icon name="plus" size={17} />
              Add {config.singular.toLowerCase()}
            </a>
          )}
        </div>
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
            {entity === "resorts" && <option value="archived">Archived</option>}
          </select>
          <button className="button button-outline" type="submit">
            Filter
          </button>
          <p>{records.length} items</p>
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table list-table">
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
                            : r.name || r.title || r.question || r.label}
                        </strong>
                        <small>
                          {r.subtitle || r.category || r.badge || ""}
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
                          ? entity === "hero_banners" ? "Inactive" : "Draft"
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
