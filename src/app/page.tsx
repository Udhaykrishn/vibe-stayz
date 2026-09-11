import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import Photo from "@/components/Photo";
import Icon from "@/components/Icon";
import {
  CTA,
  LocationCard,
  OfferCard,
  ResortCard,
  SectionHeading,
  Trust,
} from "@/components/Cards";
import { siteData } from "@/services/data";
import { content, whatsappLink } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await siteData());
}
export default async function Home() {
  const data = await siteData();
  const hero = content(data.content, "home", "hero");
  const featured = content(data.content, "home", "featured");
  const destinations = content(data.content, "home", "destinations");
  const story = content(data.content, "home", "story");
  const offers = content(data.content, "home", "offers");
  const reviews = content(data.content, "home", "testimonials");
  const featuredStays = data.resorts.filter((r) => r.featured);
  const locations = data.locations.filter((l) => l.featured);
  const review = data.testimonials[0];
  return (
    <PublicLayout data={data} transparent>
      <section className="hero">
        <Photo
          src={hero?.image || ""}
          alt="A private tropical villa and infinity pool overlooking the hills at sunset"
          className="hero-image"
          eager
          sizes="100vw"
        />
        <div className="container hero-content">
          <p className="eyebrow">{hero?.eyebrow}</p>
          <h1>{hero?.title}</h1>
          <p className="hero-description">{hero?.body}</p>
          <div className="hero-buttons">
            <a
              className="button button-lime"
              href={hero?.cta_url || "/resorts"}
            >
              {hero?.cta_label || "Explore resorts"}
              <Icon name="arrow" size={18} />
            </a>
            <a
              href={whatsappLink(data.settings)}
              className="button button-white-outline"
            >
              <Icon name="whatsapp" size={17} />
              Enquire on WhatsApp
            </a>
          </div>
        </div>
        <p className="hero-caption">
          <Icon name="pin" size={15} />
          Your next escape, somewhere beautiful.
        </p>
        <form
          className="discovery-bar container"
          action="/resorts"
          role="search"
        >
          <div className="search-field">
            <Icon name="search" size={24} />
            <label htmlFor="hero-search">
              A place you have in mind
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Search a stay or destination"
              />
            </label>
          </div>
          <div className="search-field">
            <Icon name="pin" size={24} />
            <label htmlFor="hero-location">
              Your destination
              <select id="hero-location" name="location" defaultValue="">
                <option value="">Anywhere in Kerala</option>
                {data.locations.map((l) => (
                  <option key={l.id} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="search-field">
            <Icon name="users" size={24} />
            <label htmlFor="hero-guests">
              Room for everyone
              <select name="guests" id="hero-guests" defaultValue="">
                <option value="">Any group size</option>
                <option value="2">2+ guests</option>
                <option value="4">4+ guests</option>
                <option value="8">8+ guests</option>
                <option value="12">12+ guests</option>
              </select>
            </label>
          </div>
          <button className="button button-lime" type="submit">
            <Icon name="search" size={18} />
            Find your stay
          </button>
        </form>
      </section>
      <div className="destination-ribbon">
        <div className="container">
          {locations.slice(0, 4).map((l) => (
            <a key={l.id} href={`/locations/${l.slug}`}>
              <Icon name={l.icon} size={29} />
              {l.name}
            </a>
          ))}
        </div>
      </div>
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
      <section className="section container destinations-section">
        <SectionHeading
          eyebrow={destinations?.eyebrow}
          title={destinations?.title}
          body={destinations?.body}
          href={destinations?.cta_url}
          label={destinations?.cta_label}
        />
        <div className="destinations-grid">
          {locations.slice(0, 4).map((l) => (
            <LocationCard
              key={l.id}
              location={l}
              count={data.resorts.filter((r) => r.location_id === l.id).length}
            />
          ))}
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
      {data.offers.length > 0 && (
        <section className="section offers-section">
          <div className="container">
            <SectionHeading
              eyebrow={offers?.eyebrow}
              title={offers?.title}
              body={offers?.body}
              href={offers?.cta_url}
              label={offers?.cta_label}
            />
            <div className="offers-grid">
              {data.offers.slice(0, 2).map((o) => (
                <OfferCard key={o.id} offer={o} settings={data.settings} />
              ))}
            </div>
          </div>
        </section>
      )}
      {review && (
        <section className="testimonials-section">
          <div className="container testimonial-inner">
            <div className="testimonials-heading">
              <p className="eyebrow">{reviews?.eyebrow}</p>
              <h2>{reviews?.title}</h2>
            </div>
            <div className="quote-card">
              <div
                className="quote-stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Icon key={i} name="star" size={14} />
                ))}
              </div>
              <blockquote>“{review.quote}”</blockquote>
              <p className="quote-person">
                {review.name} · {review.location}
                {review.is_demo === 1 && (
                  <span className="sample-tag">Sample guest story</span>
                )}
              </p>
            </div>
          </div>
        </section>
      )}
      <CTA data={data} />
    </PublicLayout>
  );
}
