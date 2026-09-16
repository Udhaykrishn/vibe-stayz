import type { Location, ResortView, SiteData } from "@/types";
import { money, whatsappLink } from "@/utils/format";
import Icon from "./Icon";
import Photo from "./Photo";
import StayPrice from "./StayPrice";

export function SectionHeading({
  eyebrow,
  title,
  body = "",
  href = "",
  label = "Explore more",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {body && <p className="section-intro">{body}</p>}
      </div>
      {href && (
        <a className="text-link" href={href}>
          {label}
          <Icon name="arrow" size={20} />
        </a>
      )}
    </div>
  );
}
export function ResortCard({ resort: r }: { resort: ResortView }) {
  return (
    <article className="stay-card">
      <a
        href={`/resorts/${r.slug}`}
        className="stay-photo"
        aria-label={`View ${r.name}`}
      >
        <Photo src={r.cover_image} alt={r.image_alt || r.name} />
        <span className="photo-tag">{r.property_type}</span>
        {r.promotion ? <span className="offer-dot">{r.promotion.discount}% off</span> : r.featured === 1 ? <span className="offer-dot">Featured</span> : null}
      </a>
      <div className="stay-info">
        <p className="card-location">
          <Icon name="pin" size={14} />
          {r.location.name}, Kerala
        </p>
        <h3>
          <a href={`/resorts/${r.slug}`}>{r.name}</a>
        </h3>
        <p className="card-subtitle">{r.subtitle}</p>
        <div className="stay-specs">
          <span>
            <Icon name="users" size={17} />
            {r.max_guests} guests
          </span>
          {r.bedrooms && (
            <span>
              <Icon name="bed" size={17} />
              {r.bedrooms} bedrooms
            </span>
          )}
          <span>
            <Icon name={r.amenities[0]?.icon || "leaf"} size={17} />
            {r.amenities[0]?.name || "Private stay"}
          </span>
        </div>
        {r.bathrooms != null && <p className="card-bath"><Icon name="bath" size={16}/>{r.bathrooms} bathrooms</p>}
        <div className="card-bottom">
          <StayPrice resort={r}/>
          <a
            className="card-view"
            href={`/resorts/${r.slug}`}
            aria-label={`View details for ${r.name}`}
          >
            View stay <Icon name="arrow" size={17}/>
          </a>
        </div>
      </div>
    </article>
  );
}
export function LocationCard({
  location: l,
  count,
}: {
  location: Location;
  count: number;
}) {
  return (
    <a className="destination-card" href={`/locations/${l.slug}`}>
      <Photo src={l.cover_image} alt={l.image_alt || l.name} />
      <div className="destination-copy">
        <span className="destination-count">
          {count} {count === 1 ? "stay" : "stays"} to discover
        </span>
        <h3>{l.name}</h3>
        <p>{l.subtitle}</p>
      </div>
      <span className="destination-arrow">
        <Icon name="arrow" />
      </span>
    </a>
  );
}
export function DestinationTile({
  location: l,
  count,
}: {
  location: Location;
  count: number;
}) {
  return (
    <a className="destination-tile" href={`/locations/${l.slug}`}>
      <span className="destination-tile-icon">
        <Icon name={l.icon || "pin"} size={24} />
      </span>
      <span className="destination-tile-text">
        <strong>{l.name}</strong>
        <small>
          {count ? `${count} ${count === 1 ? "stay" : "stays"}` : "Coming soon"}
        </small>
      </span>
      <Icon name="arrow" size={17} className="destination-tile-arrow" />
    </a>
  );
}
export function OfferCard({
  offer: o,
  settings,
}: {
  offer: SiteData["offers"][number];
  settings: SiteData["settings"];
}) {
  const href =
    o.cta_type === "custom" && o.cta_url ? o.cta_url : o.cta_type === "resort" && o.resorts[0]
      ? `/resorts/${o.resorts[0].slug}`
      : whatsappLink(settings);
  return (
    <article className="offer-card" id={`offer-${o.id}`}>
      <div className="offer-image">
        <Photo src={o.image} alt={o.title} />
        <span className="photo-tag">{o.badge || "Escape idea"}</span>
      </div>
      <div className="offer-copy">
        <p className="eyebrow">{o.promotional_text}</p>
        <h3>{o.title}</h3>
        <p>{o.description}</p>
        <div className="offer-stay-links">{o.resorts.map(r=><a key={r.id} href={`/resorts/${r.slug}`}><span>{r.name}</span><StayPrice resort={r}/></a>)}</div>
        <a href={href} className="text-link">
          {o.cta_label}
          <Icon name="arrow" size={18} />
        </a>
      </div>
    </article>
  );
}
export function Trust() {
  return (
    <section className="trust-strip container" aria-labelledby="trust-title">
      <div>
        <p className="eyebrow">THE VIBE STAYZ WAY</p>
        <h2 id="trust-title">
          Little details.
          <br />A better getaway.
        </h2>
      </div>
      <div className="trust-item">
        <Icon name="shield" size={29} />
        <h3>Thoughtfully selected</h3>
        <p>
          Places with character,
          <br />
          and room to feel at home.
        </p>
      </div>
      <div className="trust-item">
        <Icon name="leaf" size={29} />
        <h3>Beautiful settings</h3>
        <p>
          A little closer to nature.
          <br />A world away from routine.
        </p>
      </div>
      <div className="trust-item">
        <Icon name="headphones" size={29} />
        <h3>A personal connection</h3>
        <p>
          Real conversations.
          <br />
          Help when you need it.
        </p>
      </div>
    </section>
  );
}
export function CTA({ data }: { data: SiteData }) {
  const c = data.content.find(
    (item) => item.page === "home" && item.section === "cta",
  );
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div>
          <p className="eyebrow">{c?.eyebrow}</p>
          <h2>{c?.title}</h2>
        </div>
        <div>
          <p>{c?.body}</p>
          <a href={whatsappLink(data.settings)} className="button button-lime">
            <Icon name="whatsapp" size={20} />
            {data.settings.cta_label}
          </a>
          <a href={c?.cta_url || "/resorts"} className="text-link light">
            {c?.cta_label || "Explore resorts"}
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
