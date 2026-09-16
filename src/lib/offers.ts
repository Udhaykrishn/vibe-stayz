import type { Offer, OfferLink, Promotion, Resort } from "@/types";

// Date-only campaigns use the business's calendar day in India, including the end date.
export function businessDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function offerStatus(offer: Pick<Offer, "active" | "start_date" | "end_date">, today = businessDate()) {
  if (!offer.active) return "Disabled";
  if (offer.start_date && offer.start_date > today) return "Scheduled";
  if (offer.end_date && offer.end_date < today) return "Expired";
  return "Active";
}
export function effectivePromotion(resort: Resort, offers: Offer[], links: OfferLink[], today = businessDate()): Promotion | undefined {
  if (resort.starting_price === null || resort.starting_price <= 0) return;
  const candidates = offers.filter(o => offerStatus(o, today) === "Active" && (!o.location_id || o.location_id === resort.location_id))
    .sort((a, b) => Number(!!a.location_id) - Number(!!b.location_id) || a.display_order - b.display_order || a.id.localeCompare(b.id));
  for (const offer of candidates) {
    const price = links.find(l => l.offer_id === offer.id && l.resort_id === resort.id)?.offer_price;
    if (price == null || price <= 0 || price >= resort.starting_price) continue;
    return { id: offer.id, title: offer.title, badge: offer.badge, price, base: resort.starting_price, discount: Math.round((1 - price / resort.starting_price) * 100), end_date: offer.end_date };
  }
}
