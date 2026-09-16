import type { ResortView } from "@/types";
import { money } from "@/utils/format";
export default function StayPrice({ resort, detailed = false }: { resort: ResortView; detailed?: boolean }) {
 const p = resort.promotion;
 return <div className="stay-price">{p && <><span className="promotion-label">{p.badge || "Special offer"}</span><del>{money(p.base)}</del></>}<strong>{money(p?.price ?? resort.starting_price)}</strong>{resort.starting_price!==null && <span>{resort.price_label || "/ night onwards"}</span>}{p && detailed && <p className="promotion-saving">Save {money(p.base-p.price)} · {p.discount}% off{p.end_date && <><br/>Valid through {new Date(`${p.end_date}T12:00:00+05:30`).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Kolkata"})}</>}</p>}</div>;
}
