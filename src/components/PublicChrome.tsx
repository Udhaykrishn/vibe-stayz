"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { SiteData } from "@/types";
import { whatsappLink } from "@/utils/format";
import Icon from "./Icon";

export default function PublicChrome({
  data,
  transparent = false,
  detail = false,
  children,
}: {
  data: Pick<SiteData, "settings" | "navigation"> & {locations: Pick<SiteData["locations"][number], "slug" | "name" | "id">[]};
  transparent?: boolean;
  detail?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const menu = useRef<HTMLDialogElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const s = data.settings;
  const wa = whatsappLink(s);
  const mainNav = [
    { id: "home", label: "Home", url: "/" },
    { id: "resorts", label: "Resorts", url: "/resorts" },
    { id: "about", label: "About", url: "/about" },
    { id: "contact", label: "Contact", url: "/contact" },
  ];
  const isActive = (url: string) => url === "/" ? pathname === "/" : pathname.startsWith(url);
  const openMenu = () => {
    if (typeof menu.current?.showModal === "function") menu.current.showModal();
    else menu.current?.setAttribute("open", "");
  };
  const closeMenu = () => {
    if (typeof menu.current?.close === "function") menu.current.close();
    else menu.current?.removeAttribute("open");
  };
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    if (sentinel.current) observer.observe(sentinel.current);
    const onError = (event: Event) => {
      const image = event.target as HTMLImageElement;
      if (!(image instanceof HTMLImageElement) || !image.matches("[data-photo]") || image.dataset.fallback) return;
      image.dataset.fallback = "true";
      image.removeAttribute("srcset");
      image.src = "/images/heritage-640.webp";
      image.alt = "Image temporarily unavailable";
    };
    document.addEventListener("error", onError, true);
    document.body.classList.toggle("has-hero", transparent);
    document.body.classList.toggle("has-mobile-enquiry", detail);
    return () => {
      observer.disconnect();
      document.removeEventListener("error", onError, true);
      document.body.classList.remove("has-hero", "has-mobile-enquiry");
    };
  }, [transparent, detail]);
  return (
    <div className="customer-site">
      <div ref={sentinel} className="header-sentinel" aria-hidden="true" />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header
        className={`site-header${transparent ? " transparent" : ""}${scrolled ? " scrolled" : ""}`}
        id="site-header"
      >
        <div className="header-inner container">
          <a className="brand" href="/" aria-label={`${s.site_name} home`}>
            <img src="/images/logo.svg" className="brand-logo" alt={s.site_name} width="1038" height="500" />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNav
              .map((n) => (
                <a
                  key={n.id}
                  href={n.url}
                  className={isActive(n.url) ? "active" : undefined}
                  aria-current={isActive(n.url) ? "page" : undefined}
                >
                  {n.label}
                </a>
              ))}
          </nav>
          <a className="header-enquire" href={wa} aria-label="Let’s plan a stay">
            <Icon name="whatsapp" size={18} />
            <span>Let’s plan a stay</span>
          </a>
          <button
            className="menu-toggle"
            aria-label="Open navigation"
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            <Icon name="menu" size={25} />
          </button>
        </div>
      </header>
      <dialog
        ref={menu}
        className="mobile-menu"
        id="mobile-menu"
        aria-labelledby="menu-title"
        onClick={(event) => {
          if (event.target === menu.current) closeMenu();
        }}
      >
        <div className="menu-top">
          <p id="menu-title">Explore {s.site_name}</p>
          <button
            className="icon-button"
              onClick={closeMenu}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {mainNav
            .map((n) => (
              <a
                key={n.id}
                href={n.url}
                aria-current={isActive(n.url) ? "page" : undefined}
              >
                {n.label}
                <Icon name="arrow" />
              </a>
            ))}
        </nav>
        <a href={wa} className="button button-lime">
          <Icon name="whatsapp" />
          {s.cta_label}
        </a>
        <p className="menu-tagline">Your next Kerala escape starts here.</p>
      </dialog>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <a href="/" aria-label={`${s.site_name} home`}>
              <img
                src="/images/logo.svg"
                className="brand-logo"
                alt={s.site_name}
                width="1038"
                height="500"
                loading="lazy"
              />
            </a>
            <p>{s.footer_description}</p>
            <div className="social-links">
              {(["instagram", "facebook", "youtube", "linkedin"] as const).map(
                (key) =>
                  s[key] && (
                    <a
                      key={key}
                      href={s[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {key[0].toUpperCase() + key.slice(1)}
                    </a>
                  ),
              )}
            </div>
          </div>
          <div>
            <h2>Take a look around</h2>
            {data.navigation
              .filter(
                (n) =>
                  n.in_footer &&
                  !["/locations", "/offers"].includes(n.url.replace(/\/$/, "")),
              )
              .map((n) => (
                <a key={n.id} href={n.url}>
                  {n.label}
                </a>
              ))}
          </div>
          <div>
            <h2>Find your somewhere</h2>
            {data.locations.slice(0, 6).map((l) => (
              <a key={l.id} href={`/locations/${l.slug}`}>
                {l.name}
              </a>
            ))}
          </div>
          <div>
            <h2>Let’s talk getaways</h2>
            <a href={wa} className="footer-wa">
              <Icon name="whatsapp" size={18} />
              Enquire on WhatsApp
            </a>
            {s.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}
            {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
            {s.address && <p>{s.address}</p>}
            <p className="footer-motto">Stay. Escape. Experience.</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>
            © {new Date().getFullYear()} {s.site_name}. {s.copyright}
          </p>
          <a href="/image-credits">Photography credits</a>
        </div>
      </footer>
      {s.floating_enabled === 1 && !detail && (
        <a href={wa} className="floating-wa" aria-label="Enquire on WhatsApp">
          <Icon name="whatsapp" size={26} />
        </a>
      )}
    </div>
  );
}
