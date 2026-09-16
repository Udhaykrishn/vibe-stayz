import type { ResortView } from "@/types";
import { resortMap } from "@/lib/maps";
import Icon from "./Icon";
export default function ResortMap({ resort: r }: { resort: ResortView }) {
 const map = resortMap(r);
 return <section id="location" className="property-section map-section"><p className="eyebrow">YOUR SURROUNDINGS</p><h2>Where you’ll be.</h2><div className="map-heading"><div><h3>{r.name}</h3><p><Icon name="pin" size={18}/>{r.address || `${r.location.name}, Kerala`}</p></div><a href={map.href} target="_blank" rel="noopener noreferrer" className="text-link">Open in Google Maps<Icon name="external" size={17}/></a></div><iframe className="property-map" title={`${map.exact ? "Property location" : "Destination area"}: ${r.name}`} src={map.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><p className="map-note">{map.exact ? "Confirm directions with our team before travelling." : `Showing the ${r.location.name} area. Contact our team for the property’s exact location.`}</p><p className="map-description">{r.location.description}</p>{r.attractions.length>0 && <div className="nearby-grid">{r.attractions.map(a=><article key={a.id}><h3>{a.name}</h3><p>{[a.distance,a.travel_time].filter(Boolean).join(" · ")}</p><p>{a.description}</p></article>)}</div>}</section>;
}
