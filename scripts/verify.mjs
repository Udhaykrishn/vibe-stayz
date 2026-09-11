import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import fs from 'node:fs/promises';import crypto from 'node:crypto';import assert from 'node:assert/strict';
// Runs against an isolated, disposable Workers database and bucket.
const password=crypto.randomBytes(20).toString('hex');const salt=crypto.randomBytes(16).toString('hex');
const mf=new Miniflare(convertV4MiniflareOptions({workers:[{modules:true,scriptPath:'dist/server/index.js',compatibilityDate:'2026-09-01',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['MEDIA'],kvNamespaces:['SESSION'],bindings:{DEMO_MODE:'true',ADMIN_USERNAME:'admin',ADMIN_PASSWORD_HASH:`${salt}:${crypto.pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')}`,SITE_ORIGIN:'https://test.example'}}]}));
let csrf='',cookie='';const origin='https://test.example';let checks=0;
async function request(path,init={}){return mf.dispatchFetch(origin+path,init);}
async function ok(path){const response=await request(path,{headers:{cookie}});assert.equal(response.status,200,`${path} renders`);const text=await response.text();assert.ok(!text.includes('We’ll be right back.'),`${path} has no server error`);checks++;return text;}
async function save(entity,fields,extra={}){const r=await request(`/api/admin/${entity}`,{method:'POST',headers:{cookie,Origin:origin,'x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({fields,...extra})});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));checks++;return data;}
try{
 const db=await mf.getD1Database('DB');for(const name of(await fs.readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){const sql=await fs.readFile(`drizzle/${name}`,'utf8');for(const statement of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();}
 for(const path of ['/','/resorts','/resorts/mountain-mist','/resorts/fern-and-fog','/locations','/locations/vagamon','/offers','/about','/contact','/image-credits','/robots.txt','/sitemap.xml'])await ok(path);
 assert.equal((await request('/resorts/missing-stay')).status,404);checks++;
 assert.equal((await request('/api/admin/media')).status,401);checks++;
 const filtered=await ok('/resorts?location=munnar&guests=4');assert.ok(filtered.includes('Fern &amp; Fog Cabin')||filtered.includes('Fern &#38; Fog Cabin')||filtered.includes('Fern & Fog Cabin'));assert.ok(!filtered.includes('stay-card"><a href="/resorts/mountain-mist'));checks++;
 assert.ok((await ok('/resorts?q=no-such-property')).includes('A different path'));checks++;
 const loginPage=await request('/admin/login');const html=await loginPage.text();csrf=html.match(/name="csrf-token" content="([^"]+)"/)[1];cookie=`vibe_csrf=${csrf}`;
 const denied=await request('/api/admin/login',{method:'POST',headers:{Origin:origin,cookie,'content-type':'application/json'},body:JSON.stringify({username:'admin',password})});assert.equal(denied.status,403);checks++;
 const login=await request('/api/admin/login',{method:'POST',headers:{Origin:origin,cookie,'content-type':'application/json','x-csrf-token':csrf},body:JSON.stringify({username:'admin',password})});assert.equal(login.status,200,await login.text());const setCookie=login.headers.get('set-cookie');const token=setCookie.match(/vibe_admin=([^;]+)/)[1];cookie+=`; vibe_admin=${token}`;checks++;
 for(const path of ['/admin','/admin/resorts','/admin/resorts/new','/admin/resorts/mountain-mist','/admin/locations','/admin/locations/new','/admin/amenities','/admin/amenities/new','/admin/offers','/admin/offers/new','/admin/testimonials','/admin/testimonials/new','/admin/nearby_attractions','/admin/nearby_attractions/new','/admin/page_content','/admin/page_content/home-hero','/admin/site_settings/global','/admin/navigation','/admin/navigation/new','/admin/media'])await ok(path);
 const loc=await save('locations',{name:'QA Destination',slug:'qa-destination',published:1});
 const amenity=await save('amenities',{name:'QA Amenity',icon:'leaf',active:1});
 const stay=await save('resorts',{name:'QA Test Villa',slug:'qa-test-villa',location_id:loc.id,max_guests:4,property_type:'Private villa',published:1,address:'PRIVATE-ADDRESS-NEVER-PUBLIC',show_address:0,cover_image:'/images/hero-640.webp',highlights:'A quiet setting\nPrivate terrace',rules:'No smoking indoors'},{amenity_ids:[amenity.id],gallery:[{url:'/images/hero-640.webp',alt:'QA Exterior'},{url:'/images/hero-interior-640.webp',alt:'QA Interior'}]});
 let page=await ok('/resorts/qa-test-villa');assert.ok(page.includes('QA Amenity'));assert.ok(page.includes('View all 2 photos'));assert.ok(!page.includes('PRIVATE-ADDRESS-NEVER-PUBLIC'));checks+=3;
 await save('resorts',{name:'QA Updated Villa',published:0},{id:stay.id});assert.equal((await request('/resorts/qa-test-villa')).status,404);checks++;
 await save('resorts',{published:1},{id:stay.id});
 const offer=await save('offers',{title:'QA future offer',active:1,start_date:'2099-01-01'},{resort_ids:[stay.id]});assert.ok(!(await ok('/offers')).includes('QA future offer'));checks++;
 await save('offers',{start_date:'',title:'QA active offer'},{id:offer.id});assert.ok((await ok('/offers')).includes('QA active offer'));checks++;
 await save('testimonials',{name:'QA Guest',quote:'A wonderful test stay.',rating:5,published:1,resort_id:stay.id});
 await save('nearby_attractions',{name:'QA trail',resort_id:stay.id,distance:'2 km'});assert.ok((await ok('/resorts/qa-test-villa')).includes('QA trail'));checks++;
 await save('page_content',{title:'QA heading'},{id:'home-hero'});assert.ok((await ok('/')).includes('QA heading'));checks++;
 await save('site_settings',{whatsapp:'919999999999',show_demo:0});page=await ok('/resorts/qa-test-villa');assert.ok(page.includes('wa.me/919999999999?text='));assert.ok(!page.includes('Preview collection'));assert.ok((await ok('/sitemap.xml')).includes('/resorts/qa-test-villa'));checks+=3;
 const file=await fs.readFile('public/images/hero-640.webp');const form=new FormData();form.set('file',new File([file],'qa-image.webp',{type:'image/webp'}));const upload=await request('/api/admin/media',{method:'POST',headers:{cookie,Origin:origin,'x-csrf-token':csrf},body:form});const uploaded=await upload.json();assert.equal(upload.status,200,JSON.stringify(uploaded));const image=await request(uploaded.url);assert.equal(image.headers.get('content-type'),'image/webp');assert.equal((await image.arrayBuffer()).byteLength,file.length);checks+=3;
 const bad=await request('/api/admin/navigation',{method:'POST',headers:{cookie,Origin:origin,'x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({fields:{label:'Unsafe',url:'javascript:alert(1)'}})});assert.equal(bad.status,422);checks++;
 const archive=await request('/api/admin/resorts',{method:'DELETE',headers:{cookie,Origin:origin,'x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({id:stay.id})});assert.equal(archive.status,200);assert.equal((await request('/resorts/qa-test-villa')).status,404);checks+=2;
 const logout=await request('/api/admin/logout',{method:'POST',headers:{cookie,Origin:origin,'x-csrf-token':csrf,'content-type':'application/json'},body:'{}'});assert.equal(logout.status,200);assert.equal((await request('/api/admin/media',{headers:{cookie}})).status,401);checks+=2;
 console.log(`PASS: ${checks} server checks covering public/admin routes, filters, authentication, CSRF, CMS writes, publication, privacy, offers, WhatsApp URLs, upload/readback and session revocation.`);
}finally{await mf.dispose();}
