import AdminLayout from "@/components/AdminLayout";
import Icon from "@/components/Icon";
import { siteData } from "@/services/data";
import { previewHref } from "@/lib/preview";
export const metadata = { title: "Dashboard" };
export default async function Dashboard() {
  const data = await siteData("admin");
  const stats = [
    ["All resorts", data.resorts.length, "bed", "/admin/resorts"],
    [
      "Published stays",
      data.resorts.filter((r) => r.published && !r.archived).length,
      "check",
      "/admin/resorts",
    ],
    ["Destinations", data.locations.length, "pin", "/admin/locations"],
    [
      "Active offers",
      data.offers.filter((o) => o.active).length,
      "offer",
      "/admin/offers",
    ],
    [
      "Featured stays",
      data.resorts.filter((r) => r.featured).length,
      "star",
      "/admin/resorts",
    ],
  ] as const;
  const recent = [
    ...data.resorts.map((r) => ({
      name: r.name,
      type: "Resort",
      url: `/admin/resorts/${r.id}`,
      updated: r.updated_at,
    })),
    ...data.content.map((c) => ({
      name: `${c.page} · ${c.section}`,
      type: "Page content",
      url: `/admin/page_content/${c.id}`,
      updated: c.updated_at,
    })),
  ]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 6);
  return (
    <AdminLayout
      title="Good stays start here."
      description="A little care behind the scenes. A lovely experience for every guest."
      actions={
        <div className="page-actions">
          <a href={previewHref("/")} className="button button-outline">
            <Icon name="eye" size={16} />
            Preview site
          </a>
          <a href="/admin/resorts/new" className="button button-dark">
            <Icon name="plus" size={18} />
            Add a resort
          </a>
        </div>
      }
    >
      <div className="stats-grid">
        {stats.map(([label, value, icon, url]) => (
          <a key={label} href={url} className="stat-card">
            <div>
              <p>{label}</p>
              <Icon name={icon} size={19} />
            </div>
            <strong>{value}</strong>
          </a>
        ))}
      </div>
      <div className="dashboard-columns">
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>Your featured collection</h2>
            <a href="/admin/resorts">
              Manage stays
              <Icon name="arrow" size={16} />
            </a>
          </div>
          {data.resorts
            .filter((r) => r.featured)
            .slice(0, 3)
            .map((r) => (
              <a
                key={r.id}
                href={`/admin/resorts/${r.id}`}
                className="dashboard-stay"
              >
                <img src={r.cover_image} alt={r.name} width="100" height="75" />
                <div>
                  <h3>{r.name}</h3>
                  <p>
                    {r.location.name} · {r.property_type}
                  </p>
                </div>
                <span
                  className={`status-pill ${r.published && !r.archived ? "published" : "draft"}`}
                >
                  {r.archived
                    ? "Archived"
                    : r.published
                      ? "Published"
                      : "Draft"}
                </span>
              </a>
            ))}
        </section>
        <section className="admin-panel launch-panel">
          <p className="eyebrow">READY FOR YOUR GUESTS?</p>
          <h2>The finishing touches.</h2>
          <p>
            Keep your collection up to date and make it easy for guests to reach
            you.
          </p>
          <a href="/admin/site_settings/global">
            <Icon name={data.settings.whatsapp ? "check" : "phone"} size={19} />
            <span>
              {data.settings.whatsapp
                ? "WhatsApp number is connected"
                : "Add your WhatsApp number"}
            </span>
            <Icon name="arrow" size={16} />
          </a>
          <a href="/admin/resorts">
            <Icon name="image" size={19} />
            <span>Replace sample stays and photos</span>
            <Icon name="arrow" size={16} />
          </a>
          <a href="/admin/site_settings/global">
            <Icon name={data.settings.show_demo ? "leaf" : "check"} size={19} />
            <span>
              {data.settings.show_demo
                ? "Hide sample content before launch"
                : "Sample content is hidden"}
            </span>
            <Icon name="arrow" size={16} />
          </a>
        </section>
      </div>
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Recently updated</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table recent-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Type</th>
                <th>Last updated</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.url}>
                  <td>
                    <a href={item.url}>{item.name}</a>
                  </td>
                  <td>{item.type}</td>
                  <td>
                    {new Date(item.updated).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <a className="table-edit" href={item.url}>
                      Edit
                      <Icon name="arrow" size={15} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
