import type { Metadata } from "next";
import PublicLayout from "@/components/PublicLayout";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import { publicData } from "@/services/data";
import { content, whatsappLink, digits } from "@/utils/format";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  const data = await publicData();
  const c = content(data.content, "contact", "hero");
  return pageMetadata(data, {
    title: "Contact us",
    description: c?.body,
    path: "/contact",
  });
}
export default async function Contact() {
  const data = await publicData();
  const s = data.settings;
  const c = content(data.content, "contact", "hero");
  const ready = !!digits(s.whatsapp);
  return (
    <PublicLayout data={data}>
      <div className="container contact-page">
        <div className="contact-grid">
          <div className="contact-intro">
            <section className="page-heading">
              <p className="eyebrow">{c?.eyebrow}</p>
              <h1>{c?.title}</h1>
              <p className="lede">{c?.body}</p>
            </section>
            <div className="contact-methods">
              <div className="contact-method">
                <span className="icon-button">
                  <Icon name="whatsapp" />
                </span>
                <div>
                  <h2>Let’s chat on WhatsApp</h2>
                  {ready ? (
                    <a href={whatsappLink(s)}>
                      A little help with your next escape
                      <Icon name="arrow" size={16} />
                    </a>
                  ) : (
                    <p>WhatsApp enquiries will be opening soon.</p>
                  )}
                </div>
              </div>
              {s.phone && (
                <div className="contact-method">
                  <span className="icon-button">
                    <Icon name="phone" />
                  </span>
                  <div>
                    <h2>Give us a call</h2>
                    <a href={`tel:${s.phone}`}>{s.phone}</a>
                  </div>
                </div>
              )}
              {s.email && (
                <div className="contact-method">
                  <span className="icon-button">
                    <Icon name="mail" />
                  </span>
                  <div>
                    <h2>Drop us a line</h2>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </div>
                </div>
              )}
              {s.address && (
                <div className="contact-method">
                  <span className="icon-button">
                    <Icon name="pin" />
                  </span>
                  <div>
                    <h2>Find us here</h2>
                    <p>{s.address}</p>
                    {s.map_url && (
                      <a
                        href={s.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open map
                      </a>
                    )}
                  </div>
                </div>
              )}
              {s.business_hours && (
                <div className="contact-method">
                  <span className="icon-button">
                    <Icon name="clock" />
                  </span>
                  <div>
                    <h2>A good time to talk</h2>
                    <p>{s.business_hours}</p>
                  </div>
                </div>
              )}
              <div className="contact-method">
                <span className="icon-button">
                  <Icon name="leaf" />
                </span>
                <div>
                  <h2>A personal touch</h2>
                  <p>
                    From your first question to the finer details,
                    <br />
                    we’re here to help you find your kind of stay.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ContactForm
            locations={data.locations}
            number={digits(s.whatsapp)}
            greeting={s.greeting}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
