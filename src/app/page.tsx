import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Photo from "@/components/Photo";
import PromotionHero from "@/components/PromotionHero";
import StaySearch from "@/components/StaySearch";
import FAQSection from "@/components/FAQSection";
import Icon from "@/components/Icon";
import {
  CTA,
  LocationCard,
  ResortCard,
  SectionHeading,
  Trust,
} from "@/components/Cards";
import { publicData } from "@/services/data";
import { content } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await publicData());
}
export default async function Home() {
  const data = await publicData();
  const featured = content(data.content, "home", "featured");
  const story = content(data.content, "home", "story");
  const destinations = content(data.content, "home", "destinations");
  const featuredStays = data.resorts.filter((r) => r.featured);
  // Count the stays behind every destination, then lead with the ones that have somewhere to go.
  const stayCount = (id: string) =>
    data.resorts.filter((r) => r.location_id === id).length;
  const withStays = data.locations.filter((l) => stayCount(l.id));
  const destinationList = withStays.length ? withStays : data.locations;
  return (
    <PublicLayout data={data} transparent>
      <PromotionHero banners={data.banners}>
        <StaySearch locations={data.locations.map(({slug,name})=>({slug,name}))}/>
      </PromotionHero>
      {destinationList.length > 0 && (
        <section className="section container home-destinations">
          <SectionHeading
            eyebrow={destinations?.eyebrow}
            title={destinations?.title}
            body={destinations?.body}
            href={destinations?.cta_url}
            label={destinations?.cta_label}
          />
          <div className="home-destination-grid">
            {destinationList.map((l) => (
              <LocationCard
                key={l.id}
                location={l}
                count={stayCount(l.id)}
              />
            ))}
          </div>
        </section>
      )}
      <section className="section container home-featured">
        <SectionHeading
          eyebrow={featured?.eyebrow}
          title={featured?.title}
          body={featured?.body}
          href={featured?.cta_url}
          label={featured?.cta_label}
        />
        <div className="stays-grid">
          {featuredStays.slice(0, 3).map((r) => (
            <ResortCard customer key={r.id} resort={r} />
          ))}
          {!featuredStays.length && (
            <div className="empty-state">
              <h2>New escapes are on their way.</h2>
              <p>
                Our collection is growing. Let us help you find a beautiful
                stay.
              </p>
              <a className="button button-dark" href="/contact">
                Talk to our team
              </a>
            </div>
          )}
        </div>
      </section>
      <section className="story-section">
        <div className="story-image">
          <Photo
            src={story?.image || ""}
            alt="A peaceful heritage courtyard and pool"
            sizes="(max-width:767px) 100vw, 50vw"
          />

        </div>
        <div className="story-copy">
          <p className="eyebrow">{story?.eyebrow}</p>
          <h2>{story?.title}</h2>
          <p>{story?.body}</p>
          <a className="button button-lime" href={story?.cta_url}>
            {story?.cta_label}
            <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>
      <Trust />
      <FAQSection faqs={data.faqs}/>
      <CTA data={data} />
    </PublicLayout>
  );
}
