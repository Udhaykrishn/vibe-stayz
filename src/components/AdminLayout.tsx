import { cookies } from "next/headers";
import { headers } from "next/headers";
import { cms } from "@/lib/cms-config";
import Icon from "./Icon";
import AdminScripts from "./AdminScripts";
import AdminDrawer from "./AdminDrawer";
export default async function AdminLayout({
  title = "Dashboard",
  description = "",
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const current =
    (await headers()).get("x-vibe-path") ||
    (await cookies()).get("vibe_path")?.value ||
    "";
  const csrf =
    (await cookies()).get("vibe_csrf")?.value ||
    (await headers()).get("x-vibe-csrf") ||
    "";
  const links: [string, string, string][] = [
    ["/admin", "Dashboard", "grid"],
    ...Object.entries(cms)
      .filter(
        ([key]) =>
          !["site_settings", "navigation", "nearby_attractions"].includes(key),
      )
      .map(
        ([key, c]): [string, string, string] => [
          `/admin/${key}`,
          c.label,
          c.icon,
        ],
      ),
    ["/admin/nearby_attractions", "Attractions", "mountain"],
    ["/admin/preview", "Preview", "eye"],
    ["/admin/media", "Media library", "image"],
    ["/admin/navigation", "Navigation", "menu"],
    ["/admin/site_settings/global", "Settings", "settings"],
  ];
  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      <meta name="csrf-token" content={csrf} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="admin-sidebar">
        <a href="/admin" className="admin-brand">
          <img
            src="/images/logo.svg"
            className="brand-logo"
            alt="Vibe Stayz"
            width="1038"
            height="500"
          />
          <span>
            VIBE STAYZ<small>THE CONTENT STUDIO</small>
          </span>
        </a>
        <p className="sidebar-caption">YOUR WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {links.map(([url, label, icon]) => (
            <a
              key={url}
              href={url}
              className={
                (
                  url === "/admin"
                    ? current === url
                    : current.startsWith(url.replace("/global", ""))
                )
                  ? "active"
                  : undefined
              }
            >
              <Icon name={icon} size={19} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank">
            <Icon name="external" size={17} />
            View website
          </a>
          <button data-logout>
            <Icon name="logout" size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <AdminDrawer links={links}/>
          <p>
            Vibe Stayz <span>/</span> {title}
          </p>
          <a href="/" target="_blank">
            View website
            <Icon name="external" size={15} />
          </a>
          <span className="admin-avatar">VS</span>
        </header>
        <main id="main" className="admin-content">
          <div className="admin-page-heading">
            <div>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
        <footer className="admin-footer">Vibe Stayz · Content studio</footer>
      </div>
      <AdminScripts />
    </>
  );
}
