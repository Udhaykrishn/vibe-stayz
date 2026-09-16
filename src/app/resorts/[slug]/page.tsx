import type { Metadata } from "next";
import ResortMap from "@/components/ResortMap";
import StayPrice from "@/components/StayPrice";
import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import Gallery from "@/components/Gallery";
import ShareButton from "@/components/ShareButton";
import Icon from "@/components/Icon";
import Photo from "@/components/Photo";
import { ResortCard, SectionHeading } from "@/components/Cards";
import { publicData } from "@/services/data";
import { money, paragraphs, safeJson, whatsappLink } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
import "@/styles/property.css";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await publicData();
  const r = data.resorts.find((x) => x.slug === slug);
  return r
    ? pageMetadata(data, {
        title: r.seo_title || r.name,
        description: r.seo_description || r.short_description,
        image: r.cover_image,
        path: `/resorts/${slug}`,
        noindex: !!r.is_demo,
      })
    : { title: "Stay not found" };
}
export default async function ResortPage({ params }: Props) {
  const { slug } = await params;
  const data = await publicData();
  const r = data.resorts.find((x) => x.slug === slug);
  if (!r) notFound();
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  const url = new URL(`/resorts/${slug}`, origin).href;
  const wa = whatsappLink(data.settings, r, url);
  const similar = data.resorts
    .filter((x) => x.id !== r.id)
    .sort(
      (a, b) =>
        Number(b.location_id === r.location_id) -
          Number(a.location_id === r.location_id) ||
        Number(b.property_type === r.property_type) -
          Number(a.property_type === r.property_type),
    )
    .slice(0, 3);
  const photos = r.gallery.length
    ? r.gallery
    : [
        {
          id: "cover",
          resort_id: r.id,
          url: r.cover_image,
          alt: r.image_alt,
          display_order: 0,
        },
      ];
  const schema = r.is_demo
    ? undefined
    : {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "LodgingBusiness",
            name: r.name,
            description: r.short_description,
            url,
            image: r.gallery.map((i) => new URL(i.url, url).href),
            address: {
              "@type": "PostalAddress",
              addressLocality: r.location.name,
              addressRegion: "Kerala",
              addressCountry: "IN",
              ...(r.show_address ? { streetAddress: r.address } : {}),
            },
            amenityFeature: r.amenities.map((a) => ({
              "@type": "LocationFeatureSpecification",
              name: a.name,
              value: true,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: new URL("/", url).href,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Resorts",
                item: new URL("/resorts", url).href,
              },
              { "@type": "ListItem", position: 3, name: r.name, item: url },
            ],
          },
        ],
      };
  return (
    <PublicLayout data={data} detail>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(schema) }}
        />
      )}
      <div className="container property-top">
        <div className="breadcrumbs">
          <a href="/">Home</a>
          <Icon name="chevron" />
          <a href="/resorts">Resorts</a>
          <Icon name="chevron" />
          <a href={`/locations/${r.location.slug}`}>{r.location.name}</a>
          <Icon name="chevron" />
          <span>{r.name}</span>
        </div>
        <div className="property-title">
          <div>
            <p className="eyebrow">
              {r.property_type} · {r.location.name.toUpperCase()}
            </p>
            <h1>{r.name}</h1>
            <p className="property-subtitle">{r.subtitle}</p>
          </div>
          <ShareButton />
        </div>
        <Gallery images={photos} name={r.name} />
        {r.is_demo === 1 && (
          <p className="property-demo">
            Concept stay · Sample details and rates. Images are illustrative.
          </p>
        )}
        <div className="property-columns">
          <div className="property-main">
            <div className="property-facts">
              <span>
                <Icon name="users" size={24} />
                <strong>Up to {r.max_guests} guests</strong>
              </span>
              {r.bedrooms && (
                <span>
                  <Icon name="bed" size={24} />
                  <strong>{r.bedrooms} bedrooms</strong>
                </span>
              )}
              {r.bathrooms && (
                <span>
                  <Icon name="bath" size={24} />
                  <strong>{r.bathrooms} bathrooms</strong>
                </span>
              )}
            </div>
            <nav className="property-tabs" aria-label="Property sections">
              <a href="#overview">The stay</a>
              <a href="#amenities">Amenities</a>
              <a href="#location">Location</a>
              <a href="#good-to-know">Good to know</a>
            </nav>
            <section id="overview" className="property-section">
              <p className="eyebrow">YOUR PLACE TO UNWIND</p>
              <h2>A stay to make your own.</h2>
              <div className="prose">
                {paragraphs(r.description).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {r.highlights.length > 0 && (
                <div className="highlights">
                  {r.highlights.map((h) => (
                    <span key={h}>
                      <Icon name="check" size={16} />
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </section>
            <section id="amenities" className="property-section">
              <p className="eyebrow">THE LITTLE COMFORTS</p>
              <h2>Everything for a lovely stay.</h2>
              <div className="amenities-grid">
                {r.amenities.map((a) => (
                  <div key={a.id}>
                    <Icon name={a.icon} size={24} />
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
              {!r.amenities.length && (
                <p className="muted">
                  Ask our team about the amenities at this stay.
                </p>
              )}
            </section>
            <section id="good-to-know" className="property-section">
              <p className="eyebrow">BEFORE YOU ARRIVE</p>
              <h2>A few things to know.</h2>
              <div className="arrival-times">
                <div>
                  <Icon name="clock" />
                  <p>
                    Check-in time<strong>{r.check_in}</strong>
                  </p>
                </div>
                <div>
                  <Icon name="clock" />
                  <p>
                    Check-out time<strong>{r.check_out}</strong>
                  </p>
                </div>
              </div>
              {r.rules.length > 0 && (
                <details open className="house-rules">
                  <summary>House rules</summary>
                  <ul>
                    {r.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </details>
              )}
              <details className="house-rules">
                <summary>Pricing & stay information</summary>
                <dl>
                  {(
                    [
                      ["Weekday pricing", r.weekday_rate],
                      ["Weekend pricing", r.weekend_rate],
                      ["Group package", r.group_package],
                      ["Additional guests", r.extra_guest_info],
                    ] as const
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                <p>{r.pricing_disclaimer}</p>
              </details>
            </section>
          </div>
          <aside className="enquiry-sidebar">
            <div className="enquiry-card">
              <p className="eyebrow">YOUR NEXT ESCAPE</p>
              <StayPrice resort={r} detailed/>
              <p className="price-intro">The whole place. Your kind of pace.</p>
              <div className="enquiry-divider" />
              <h2>Like the look of this stay?</h2>
              <p>
                Let’s talk about the details. Our team can help with current
                pricing and everything you’d like to know.
              </p>
              <a href={wa} className="button button-dark">
                <Icon name="whatsapp" size={20} />
                {data.settings.cta_label}
              </a>
              <p className="enquiry-reassurance">
                <Icon name="headphones" size={15} />A real conversation, with a
                real person.
              </p>
              <div className="enquiry-smallprint">{r.pricing_disclaimer}</div>
            </div>
            <a className="help-link" href="/contact">
              Need a little guidance? Get in touch
              <Icon name="arrow" size={16} />
            </a>
          </aside>
        </div>
        <ResortMap resort={r}/>
        {similar.length > 0 && (
          <section className="section similar-section">
            <SectionHeading
              eyebrow="KEEP EXPLORING"
              title="You may also love…"
              href="/resorts"
              label="All stays"
            />
            <div className="stays-grid">
              {similar.map((s) => (
                <ResortCard key={s.id} resort={s} />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="mobile-enquiry">
        <StayPrice resort={r}/>
        <a href={wa} className="button button-dark">
          <Icon name="whatsapp" size={19} />
          Enquire on WhatsApp
        </a>
      </div>
    </PublicLayout>
  );
}
