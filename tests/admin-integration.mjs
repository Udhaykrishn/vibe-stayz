// Real HTTP/database/storage QA, deliberately restricted to loopback test services.
// Run with .env.local loaded, QA_BASE_URL and QA_ADMIN_PASSWORD set.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const base=process.env.QA_BASE_URL;
const local=u=>['localhost','127.0.0.1','[::1]'].includes(new URL(u).hostname);
assert.ok(base && local(base) && local(process.env.SUPABASE_URL),'Local test services required');
assert.ok(process.env.QA_ADMIN_PASSWORD,'Set QA_ADMIN_PASSWORD');
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const bucket=process.env.SUPABASE_STORAGE_BUCKET||'media';
const prefix='qa-http-'+Date.now();
const cookies=new Map(); let csrf; let count=0;
function remember(res){for(const cookie of res.headers.getSetCookie()){const pair=cookie.split(';')[0];const at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1));}}
async function req(path,method='GET',body){const headers={cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')};if(method!=='GET'){headers.origin=base;headers['x-csrf-token']=csrf;if(!(body instanceof FormData))headers['content-type']='application/json';}const res=await fetch(base+path,{method,headers,body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body),redirect:'manual'});remember(res);return res;}
async function api(entity,body,method='POST',status=200){const res=await req('/api/admin/'+entity,method,body);const text=await res.text();assert.equal(res.status,status,`${method} ${entity}: ${text}`);return JSON.parse(text);}
async function row(table,id){const r=await db.from(table).select('*').eq('id',id).single();assert.ifError(r.error);return r.data;}
async function page(path,needle,present=true){const res=await req(path);assert.equal(res.status,200,path);const html=await res.text();assert.equal(html.includes(needle),present,`${path}: ${needle}`);}
function pass(s){count++;console.log('PASS '+s);}
const ids={};const media=[];let settingsBackup,contentBackup;
try{
 const loginPage=await req('/admin/login');await loginPage.text();csrf=cookies.get('vibe_csrf');assert.ok(csrf);
 await api('login',{username:process.env.ADMIN_USERNAME,password:process.env.QA_ADMIN_PASSWORD});pass('real admin login with CSRF');
 ids.locations=(await api('locations',{fields:{name:prefix+' Destination',slug:prefix+'-destination',published:true,icon:'mountain'}})).id;
 await api('locations',{id:ids.locations,fields:{subtitle:'HTTP updated destination'}});await page('/locations/'+prefix+'-destination','HTTP updated destination');pass('location create/edit/public update');
 ids.amenities=(await api('amenities',{fields:{name:prefix+' Amenity',active:true}})).id;
 await api('amenities',{id:ids.amenities,fields:{name:prefix+' Updated amenity'}});pass('amenity create/edit');
 ids.resorts=(await api('resorts',{fields:{name:prefix+' Villa',slug:prefix+'-villa',location_id:ids.locations,property_type:'Private villa',max_guests:6,starting_price:20000,published:true,highlights:'Original highlight',rules:'Original rule'},gallery:[{url:'/images/cabin-640.webp',alt:'Original QA image'}],amenity_ids:[ids.amenities]})).id;
 await page('/resorts/'+prefix+'-villa',prefix+' Updated amenity');pass('resort create with gallery, amenities and public visibility');
 const before=await row('resorts',ids.resorts);
 await api('resorts',{id:ids.resorts,fields:{name:'Invalid partial update'},gallery:[{url:'javascript:bad',alt:''}]},'POST',422);
 assert.equal((await row('resorts',ids.resorts)).name,before.name);pass('invalid gallery rejects entire save');
 await api('resorts',{id:ids.resorts,fields:{name:'Invalid partial update'},gallery:[],amenity_ids:['missing-qa-amenity']},'POST',409);
 assert.equal((await row('resorts',ids.resorts)).name,before.name);
 const g=await db.from('resort_images').select('*').eq('resort_id',ids.resorts);assert.equal(g.data.length,1);pass('database failure rolls back resort and gallery');
 for(const name of ['cabin','heritage']){const form=new FormData();form.set('file',new Blob([fs.readFileSync(new URL('../public/images/'+name+'-640.webp',import.meta.url))],{type:'image/webp'}),prefix+'-'+name+'.webp');const uploaded=await api('media',form);media.push(uploaded.id);assert.equal(uploaded.url,'/media/'+uploaded.id);const photo=await fetch(base+uploaded.url);assert.equal(photo.status,200);assert.ok(photo.headers.get('content-type').startsWith('image/'));}
 pass('two real storage uploads and public image delivery');
 const invalidFile=new FormData();invalidFile.set('file',new Blob(['not an image'],{type:'image/webp'}),'invalid.webp');await api('media',invalidFile,'POST',415);pass('invalid image rejected');
 for(const [i,id] of media.entries()){await api('resorts',{id:ids.resorts,fields:{cover_image:'/media/'+id,starting_price:21000,whatsapp_override:'919000000000',description:'Updated HTTP description'},gallery:media.slice(0,i+1).map((m,j)=>({url:'/media/'+m,alt:'QA image '+j}))});await page('/resorts/'+prefix+'-villa','/media/'+id);}
 await page('/resorts/'+prefix+'-villa','Updated HTTP description');await page('/resorts/'+prefix+'-villa','wa.me/919000000000');pass('image replacement, gallery, price, content and WhatsApp override');
 // The library manages its own photographs: replace the picture behind an address, rename it, remove it.
 const carried=media[0];const original=await row('media',carried);
 const swap=new FormData();swap.set('id',carried);swap.set('file',new Blob([fs.readFileSync(new URL('../public/images/vagamon-640.webp',import.meta.url))],{type:'image/webp'}),prefix+'-swapped.webp');
 const swapped=await api('media',swap,'PUT');assert.equal(swapped.url,'/media/'+carried);
 const current=await row('media',carried);assert.notEqual(current.object_key,original.object_key);assert.equal(current.filename,prefix+'-swapped.webp');
 assert.ok((await db.storage.from(bucket).download(original.object_key)).error,'previous file removed from storage');
 assert.equal((await fetch(base+'/media/'+carried)).status,200);await page('/resorts/'+prefix+'-villa','/media/'+carried);
 pass('replacing an image keeps its address and updates every page using it');
 await api('media',{id:carried,filename:prefix+'-renamed.webp',alt:'QA described photograph'},'PATCH');
 const renamed=await row('media',carried);assert.equal(renamed.filename,prefix+'-renamed.webp');assert.equal(renamed.alt,'QA described photograph');
 await api('media',{id:carried,filename:'   '},'PATCH',422);assert.equal((await row('media',carried)).filename,prefix+'-renamed.webp');
 pass('image rename and description with empty-name rejection');
 await api('media',{id:carried},'DELETE',409);assert.ok(await row('media',carried));
 pass('an image still shown on the website is not deleted by accident');
 const spare=new FormData();spare.set('file',new Blob([fs.readFileSync(new URL('../public/images/munnar-640.webp',import.meta.url))],{type:'image/webp'}),prefix+'-spare.webp');
 const extra=await api('media',spare);media.push(extra.id);const spareRow=await row('media',extra.id);
 await api('media',{id:extra.id},'DELETE');
 assert.equal((await db.from('media').select('id').eq('id',extra.id)).data.length,0);
 assert.ok((await db.storage.from(bucket).download(spareRow.object_key)).error,'deleted file removed from storage');
 pass('an unused image is deleted from the library and from storage');
 ids.offers=(await api('offers',{fields:{title:prefix+' Offer',location_id:ids.locations,active:true,featured_home:true,image:'/media/'+media[1],cta_type:'resort'},offer_links:[{resort_id:ids.resorts,offer_price:12000}]})).id;
 await page('/resorts/'+prefix+'-villa',prefix+' Offer');assert.equal((await row('resorts',ids.resorts)).starting_price,21000);pass('offer visible without mutating base price');
 await api('offers',{id:ids.offers,fields:{title:'Bad offer'},offer_links:[{resort_id:ids.resorts,offer_price:22000}]},'POST',422);assert.equal((await row('offers',ids.offers)).title,prefix+' Offer');
 await api('offers',{id:ids.offers,fields:{active:false}});await page('/resorts/'+prefix+'-villa',prefix+' Offer',false);pass('invalid offer rejection and disable restores base pricing');
 const entities={faqs:{question:prefix+' Question',answer:'QA answer',published:true},nearby_attractions:{name:prefix+' Attraction',resort_id:ids.resorts,description:'QA attraction'},navigation:{label:prefix+' Link',url:'/offers',in_header:true,in_footer:true}};
 for(const [entity,fields] of Object.entries(entities)){ids[entity]=(await api(entity,{fields})).id;const key=entity==='faqs'?'answer':entity==='navigation'?'label':'description';const value=prefix+' Updated '+entity;await api(entity,{id:ids[entity],fields:{[key]:value}});assert.equal((await row(entity,ids[entity]))[key],value);await page(entity==='nearby_attractions'?'/resorts/'+prefix+'-villa':'/',value);pass(entity+' create/edit/public propagation');}
 settingsBackup=await row('site_settings','global');await api('site_settings',{fields:{whatsapp:'919000000000',footer_description:prefix+' Footer'}});await page('/','wa.me/919000000000');await page('/',prefix+' Footer');pass('global WhatsApp and settings update');
 contentBackup=await row('page_content','home-featured');await api('page_content',{id:contentBackup.id,fields:{title:prefix+' Heading'}});await page('/',prefix+' Heading');pass('page content update');
 await api('resorts',{id:ids.resorts,fields:{cover_image:''},gallery:[],amenity_ids:[]});const gallery=await db.from('resort_images').select('*').eq('resort_id',ids.resorts);assert.equal(gallery.data.length,0);assert.equal((await row('resorts',ids.resorts)).cover_image,'');pass('cover and gallery removal persists');
 for(const entity of ['offers','faqs','nearby_attractions','navigation','amenities']){await api(entity,{id:ids[entity]},'DELETE');const r=await db.from(entity).select('id').eq('id',ids[entity]);assert.equal(r.data.length,0);pass(entity+' delete');}
 await api('resorts',{id:ids.resorts},'DELETE');assert.equal((await row('resorts',ids.resorts)).archived,1);assert.equal((await req('/resorts/'+prefix+'-villa')).status,404);pass('resort archive hides public page');
 await api('locations',{id:ids.locations},'DELETE');assert.equal((await row('locations',ids.locations)).published,0);assert.equal((await req('/locations/'+prefix+'-destination')).status,404);pass('location removal hides public page');
 await api('logout',{});await api('resorts',{fields:{}},'POST',401);pass('logout prevents further admin writes');
}finally{
 if(settingsBackup){const r=await db.from('site_settings').upsert(settingsBackup);assert.ifError(r.error);}
 if(contentBackup){const r=await db.from('page_content').upsert(contentBackup);assert.ifError(r.error);}
 for(const entity of ['offers','faqs','nearby_attractions','navigation','resorts','amenities','locations'])if(ids[entity]){const r=await db.from(entity).delete().eq('id',ids[entity]);assert.ifError(r.error);}
 for(const id of media){const m=await db.from('media').select('*').eq('id',id).maybeSingle();if(!m.data)continue;const r=await db.storage.from(bucket).remove([m.data.object_key]);assert.ifError(r.error);const removed=await db.from('media').delete().eq('id',id);assert.ifError(removed.error);}
 console.log('Cleanup complete; '+count+' checks passed.');
}
