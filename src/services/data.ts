import {runtime} from '../lib/env';
import {initializeContent} from '../lib/seed';
import type {SiteData,Settings,Resort,Location,Amenity,Offer,Testimonial,PageContent,NavItem,GalleryImage,Attraction} from '../types';
const TABLES=['resorts','locations','amenities','offers','testimonials','page_content','navigation','nearby_attractions','site_settings','media'] as const;
export type Entity=typeof TABLES[number];
export const isEntity=(s:string):s is Entity=>(TABLES as readonly string[]).includes(s);
export const db=()=>runtime().DB;
export async function rows<T>(sql:string,...values:(string|number|null)[]){const result=await db().prepare(sql).bind(...values).all<T>();return result.results;}
export async function siteData(admin=false):Promise<SiteData>{
 await initializeContent(runtime());
 const settings=(await db().prepare('SELECT * FROM site_settings WHERE id=?').bind('global').first<Settings>())!;
 const demo=admin||settings.show_demo?'':' AND is_demo=0';
 const [resorts,locations,amenities,offers,testimonials,content,navigation,gallery,relations,features,attractions,offerRelations]=await Promise.all([
 rows<Resort>(`SELECT * FROM resorts WHERE 1=1 ${admin?'':'AND published=1 AND archived=0'}${demo} ORDER BY display_order,name`),
 rows<Location>(`SELECT * FROM locations WHERE 1=1 ${admin?'':'AND published=1'}${demo} ORDER BY display_order,name`),
 rows<Amenity>(`SELECT * FROM amenities ${admin?'':'WHERE active=1'} ORDER BY display_order,name`),
 rows<Offer>(`SELECT * FROM offers WHERE 1=1 ${admin?'':"AND active=1 AND (start_date='' OR start_date <= date('now')) AND (end_date='' OR end_date >= date('now'))"}${demo} ORDER BY display_order,title`),
 rows<Testimonial>(`SELECT * FROM testimonials WHERE 1=1 ${admin?'':'AND published=1'}${demo} ORDER BY display_order`),
 rows<PageContent>('SELECT * FROM page_content ORDER BY display_order'),rows<NavItem>('SELECT * FROM navigation ORDER BY display_order'),
 rows<GalleryImage>('SELECT * FROM resort_images ORDER BY display_order'),rows<{resort_id:string;amenity_id:string}>('SELECT * FROM resort_amenities'),rows<{resort_id:string;kind:string;text:string}>('SELECT * FROM resort_features ORDER BY display_order'),rows<Attraction>('SELECT * FROM nearby_attractions ORDER BY display_order'),rows<{resort_id:string;offer_id:string}>('SELECT * FROM offer_resorts')
 ]);
 const views=resorts.filter(r=>locations.some(l=>l.id===r.location_id)).map(r=>({...r,...(!admin&&!r.show_address?{address:'',map_url:''}:{}),location:locations.find(l=>l.id===r.location_id)!,amenities:amenities.filter(a=>relations.some(x=>x.resort_id===r.id&&x.amenity_id===a.id)),gallery:gallery.filter(g=>g.resort_id===r.id),highlights:features.filter(f=>f.resort_id===r.id&&f.kind==='highlight').map(f=>f.text),rules:features.filter(f=>f.resort_id===r.id&&f.kind==='rule').map(f=>f.text),attractions:attractions.filter(a=>a.resort_id===r.id),offers:offers.filter(o=>offerRelations.some(x=>x.offer_id===o.id&&x.resort_id===r.id))}));
 return {settings,resorts:views,locations,amenities,offers:offers.map(o=>({...o,resorts:views.filter(r=>offerRelations.some(x=>x.offer_id===o.id&&x.resort_id===r.id))})),testimonials,content,navigation};
}
