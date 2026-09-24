import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import Photo from "@/components/Photo";
import { destinationImages } from "@/lib/destination-images";
import { CTA, ResortCard, SectionHeading } from "@/components/Cards";
import { publicData } from "@/services/data";
import { pageMetadata } from "@/lib/metadata";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await publicData();
  const l = data.locations.find((x) => x.slug === slug);
  return l
    ? pageMetadata(data, {
        title: l.seo_title || `Stays in ${l.name}`,
        description: l.seo_description || l.description,
        image: l.cover_image,
        path: `/locations/${slug}`,
      })
    : { title: "Destination not found" };
}
export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const data = await publicData();
  const l = data.locations.find((x) => x.slug === slug);
  if (!l) notFound();
  const cover = l.cover_image || destinationImages[l.slug];
  const resorts = data.resorts.filter((r) => r.location_id === l.id);
  return (
    <PublicLayout data={data}>
      <section className="destination-hero">
        {cover && <Photo
          src={cover}
          alt={l.image_alt || l.name}
          eager
          sizes="100vw"
        />}
        <div className="container">
          <a className="destination-back" href="/locations">All destinations</a>
          <h1>{l.name}</h1>
          <p>{l.subtitle}</p>
        </div>
      </section>
      <div className="container">
        <section className="destination-description">
          <div>
            <p className="eyebrow">A LITTLE ABOUT {l.name.toUpperCase()}</p>
            <h2>
              A change of pace.
              <br />A beautiful place.
            </h2>
          </div>
          <p>{l.description}</p>
        </section>
        <section className="section">
          <SectionHeading
            eyebrow="MAKE YOURSELF AT HOME"
            title={`Find your stay in ${l.name}`}
            body={resorts.length ? `${resorts.length} ${resorts.length === 1 ? "stay" : "stays"} to discover` : "A new destination for your next escape."}
          />
          <div className="stays-grid">
            {resorts.map((r) => (
              <ResortCard customer key={r.id} resort={r} />
            ))}
            {!resorts.length && (
              <div className="empty-state">
                <h2>Something lovely is on its way.</h2>
                <p>
                  We’re adding stays in {l.name}. Browse our other destinations
                  in the meantime.
                </p>
                <a className="button button-dark" href="/resorts">
                  Explore all stays
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
      <CTA data={data} />
    </PublicLayout>
  );
}
