import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Photo from "@/components/Photo";
import PromotionHero, { type HeroSlide } from "@/components/PromotionHero";
import FAQSection from "@/components/FAQSection";
import { money } from "@/utils/format";
import Icon from "@/components/Icon";
import {
  CTA,
  DestinationTile,
  ResortCard,
  SectionHeading,
  Trust,
} from "@/components/Cards";
import { publicData } from "@/services/data";
import { content, fill, whatsappLink } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await publicData());
}
export default async function Home() {
  const data = await publicData();
  const hero = content(data.content, "home", "hero");
  const featured = content(data.content, "home", "featured");
  const story = content(data.content, "home", "story");
  const destinations = content(data.content, "home", "destinations");
  // Carousel copy an editor controls from Site content, rather than from this file.
  const stayCopy = content(data.content, "home", "carousel_stay");
  const destinationCopy = content(data.content, "home", "carousel_destination");
  const fallbackCopy = content(data.content, "home", "carousel_fallback");
  const featuredStays = data.resorts.filter((r) => r.featured);
  // Count the stays behind every destination, then lead with the ones that have somewhere to go.
  const stayCount = (id: string) =>
    data.resorts.filter((r) => r.location_id === id).length;
  const withStays = data.locations.filter((l) => stayCount(l.id));
  const destinationList = withStays.length ? withStays : data.locations;
  const offerSlides: HeroSlide[] = data.offers.filter(o=>o.featured_home).map(o=>{
    const priced=o.resorts.filter(r=>r.promotion?.id===o.id).sort((a,b)=>a.promotion!.price-b.promotion!.price);
    const p=priced[0]?.promotion;
    const href=o.cta_type==="custom"&&o.cta_url?o.cta_url:o.cta_type==="whatsapp"?whatsappLink(data.settings):o.resorts.length===1?`/resorts/${o.resorts[0].slug}`:`/offers#offer-${o.id}`;
    return {id:o.id,detail:priced[0]?`${priced[0].name} · ${priced[0].location.name}`:o.resorts.length===1?`${o.resorts[0].name} · ${o.resorts[0].location.name}`:undefined,title:o.title,subtitle:o.promotional_text,image:o.image||o.resorts[0]?.cover_image||hero?.image||"",mobileImage:o.mobile_image,badge:o.badge,href,cta:o.cta_label||"Explore offer",starts:o.start_date,ends:o.end_date,savings:p?`${money(p.base-p.price)} OFF`:undefined};
  });
  // Keep discovery moving even when no campaign is currently featured.
  const showcase = featuredStays.length ? featuredStays : data.resorts;
  const staySlides: HeroSlide[] = showcase.slice(0, 3).map(r => {
    const values = { name: r.name, location: r.location.name, type: r.property_type };
    return {
      id: `stay-${r.id}`,
      title: fill(stayCopy?.title || "{name}", values),
      subtitle: r.subtitle || fill(stayCopy?.body || "", values),
      image: r.cover_image,
      badge: fill(stayCopy?.eyebrow || "{location} · {type}", values),
      href: `/resorts/${r.slug}`,
      cta: stayCopy?.cta_label || "Explore this stay",
    };
  });
  const destinationSlides: HeroSlide[] = data.locations.slice(0, 2).map(l => {
    const values = { name: l.name, location: l.name };
    return {
      id: `destination-${l.id}`,
      title: fill(destinationCopy?.title || "Slow down in {location}.", values),
      subtitle: fill(destinationCopy?.body || "Find your own corner of Kerala. Beautiful stays, thoughtfully selected.", values),
      image: l.cover_image,
      badge: fill(destinationCopy?.eyebrow || "A PLACE TO GET AWAY", values),
      href: `/resorts?location=${l.slug}`,
      cta: destinationCopy?.cta_label || "Discover stays",
    };
  });
  // The carousel never opens on a campaign. A stay leads, then every featured offer
  // takes its own slide from the second position onwards, and the rest of the stays follow.
  const opening = staySlides.length ? staySlides : destinationSlides;
  const slides: HeroSlide[] = opening.length
    ? [opening[0], ...offerSlides, ...opening.slice(1)]
    : [...offerSlides];
  // Never leave the carousel with a single slide to move between.
  if (slides.length < 2)
    slides.push(...destinationSlides.filter(d => !slides.some(s => s.id === d.id)));
  return (
    <PublicLayout data={data} transparent>
      <PromotionHero slides={slides} hero={hero} fallback={fallbackCopy} locations={data.locations.map(({slug,name})=>({slug,name}))}/>
      {destinationList.length > 0 && (
        <section className="section container home-destinations">
          <SectionHeading
            eyebrow={destinations?.eyebrow}
            title={destinations?.title}
            body={destinations?.body}
            href={destinations?.cta_url}
            label={destinations?.cta_label}
          />
          <div className="destination-tiles">
            {destinationList.map((l) => (
              <DestinationTile
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
            <ResortCard key={r.id} resort={r} />
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
          <p className="image-note">
            A little less hurry.
            <br />A little more here.
          </p>
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
