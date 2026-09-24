import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import { CTA, OfferCard } from "@/components/Cards";
import { publicData } from "@/services/data";
import { content } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = await publicData();
  const c = content(data.content, "offers", "hero");
  return pageMetadata(data, {
    title: "Offers & escape ideas",
    description: c?.body,
    path: "/offers",
  });
}
export default async function Offers() {
  const data = await publicData();
  const c = content(data.content, "offers", "hero");
  return (
    <PublicLayout data={data}>
      <div className="container">
        <section className="page-heading">
          <p className="eyebrow">{c?.eyebrow}</p>
          <h1>{c?.title}</h1>
          <p className="lede">{c?.body}</p>
        </section>
        <section className="results-section">
          <div className="offers-grid">
            {data.offers.map((o) => (
              <OfferCard customer key={o.id} offer={o} settings={data.settings} />
            ))}
          </div>
          {!data.offers.length && (
            <div className="empty-state">
              <h2>Your next getaway is still waiting.</h2>
              <p>
                There are no special offers at the moment. Explore our
                collection or ask our team for a stay suggestion.
              </p>
              <a className="button button-dark" href="/resorts">
                Explore resorts
              </a>
            </div>
          )}
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 25 }}>
            Offers are informational. Contact our team for current prices,
            inclusions and terms.
          </p>
        </section>
      </div>
      <CTA data={data} />
    </PublicLayout>
  );
}
