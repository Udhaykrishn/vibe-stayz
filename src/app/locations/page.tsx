import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import { CTA, LocationCard } from "@/components/Cards";
import { siteData } from "@/services/data";
import { content } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = await siteData();
  const c = content(data.content, "locations", "hero");
  return pageMetadata(data, {
    title: "Explore Kerala destinations",
    description: c?.body,
    path: "/locations",
  });
}
export default async function Locations() {
  const data = await siteData();
  const c = content(data.content, "locations", "hero");
  return (
    <PublicLayout data={data}>
      <div className="container">
        <section className="page-heading">
          <p className="eyebrow">{c?.eyebrow}</p>
          <h1>{c?.title}</h1>
          <p className="lede">{c?.body}</p>
        </section>
        <section className="results-section">
          <div className="destinations-grid">
            {data.locations.map((l) => (
              <LocationCard
                key={l.id}
                location={l}
                count={
                  data.resorts.filter((r) => r.location_id === l.id).length
                }
              />
            ))}
          </div>
          {!data.locations.length && (
            <div className="empty-state">
              <h2>Our next destinations are on their way.</h2>
              <p>Tell us where you would like to go.</p>
              <a className="button button-dark" href="/contact">
                Talk to us
              </a>
            </div>
          )}
        </section>
      </div>
      <CTA data={data} />
    </PublicLayout>
  );
}
