import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

async function load(path) {
  const code=ts.transpileModule(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
const {businessDate,offerStatus,effectivePromotion}=await load('../src/lib/offers.ts');
const {resortMap,validMapEmbed}=await load('../src/lib/maps.ts');
const {whatsappLink}=await load('../src/utils/format.ts');
const stay={id:'villa',location_id:'munnar',starting_price:20000,name:'Test Villa',location:{name:'Munnar'},show_address:1,address:'Example Road, Munnar',latitude:null,longitude:null,map_url:'',map_embed_url:''};
const campaign=(extra={})=>({id:'summer',title:'Summer Special',badge:'Summer',active:1,start_date:'2026-09-20',end_date:'2026-09-27',display_order:0,...extra});
const link=(id='summer',price=12000)=>({offer_id:id,resort_id:'villa',offer_price:price});

test('India calendar rolls over at 18:30 UTC',()=>{assert.equal(businessDate(new Date('2026-09-19T18:29:59Z')),'2026-09-19');assert.equal(businessDate(new Date('2026-09-19T18:30:00Z')),'2026-09-20');});
test('scheduled, inclusive start/end, expired and disabled',()=>{const o=campaign();assert.equal(offerStatus(o,'2026-09-19'),'Scheduled');assert.equal(offerStatus(o,'2026-09-20'),'Active');assert.equal(offerStatus(o,'2026-09-27'),'Active');assert.equal(offerStatus(o,'2026-09-28'),'Expired');assert.equal(offerStatus({...o,active:0},'2026-09-21'),'Disabled');assert.equal(offerStatus(campaign({start_date:'2026-09-20',end_date:'2026-09-20'}),'2026-09-20'),'Active');});
test('offer calculates discount without mutating base price',()=>{const p=effectivePromotion(stay,[campaign()],[link()],'2026-09-21');assert.equal(p.price,12000);assert.equal(p.base,20000);assert.equal(p.discount,40);assert.equal(stay.starting_price,20000);});
test('expired and future offers restore base pricing',()=>{assert.equal(effectivePromotion(stay,[campaign()],[link()],'2026-09-28'),undefined);assert.equal(effectivePromotion(stay,[campaign()],[link()],'2026-09-19'),undefined);});
test('specificity precedes priority; priority and ID settle ties',()=>{const o=[campaign({id:'location',location_id:'munnar',display_order:0}),campaign({id:'b',display_order:10}),campaign({id:'a',display_order:10})];assert.equal(effectivePromotion(stay,o,[link('location',5000),link('b',10000),link('a',12000)],'2026-09-21').id,'a');assert.equal(effectivePromotion(stay,[...o,campaign({id:'priority',display_order:1})],[link('a'),link('priority',15000)],'2026-09-21').id,'priority');});
test('invalid prices, unselected stays, mismatched destinations are ignored',()=>{for(const price of [null,0,-10,20000,30000])assert.equal(effectivePromotion(stay,[campaign()],[link('summer',price)],'2026-09-21'),undefined);assert.equal(effectivePromotion({...stay,starting_price:null},[campaign()],[link()],'2026-09-21'),undefined);assert.equal(effectivePromotion(stay,[campaign({location_id:'kochi'})],[link()],'2026-09-21'),undefined);assert.equal(effectivePromotion(stay,[campaign()],[],'2026-09-21'),undefined);});
test('maps use own address or coordinates and keep private data out',()=>{assert.match(decodeURIComponent(resortMap(stay).embed),/Example Road, Munnar/);assert.match(resortMap({...stay,latitude:10,longitude:76}).embed,/10%2C76/);const privateMap=resortMap({...stay,show_address:0});assert.equal(privateMap.exact,false);assert.doesNotMatch(decodeURIComponent(privateMap.embed),/Example Road/);assert.equal(resortMap({...stay,address:''}).exact,false);});
test('only safe Google embed URLs accepted',()=>{assert.equal(validMapEmbed('https://www.google.com/maps/embed?pb=test'),true);for(const v of ['javascript:alert(1)','https://evil.example/maps/embed','https://www.google.com.evil.example/maps/embed','http://maps.google.com/maps?output=embed'])assert.equal(validMapEmbed(v),false);});
test('WhatsApp uses the effective promotion and URL-encodes context',()=>{const p=effectivePromotion(stay,[campaign()],[link()],'2026-09-21');const u=new URL(whatsappLink({whatsapp:'919000000000',greeting:'Hello'}, {...stay,promotion:p},'https://example.com/resorts/test'));assert.equal(u.hostname,'wa.me');assert.match(u.searchParams.get('text'),/Summer Special for Test Villa in Munnar/);assert.match(u.searchParams.get('text'),/₹12,000/);assert.match(u.searchParams.get('text'),/https:\/\/example.com\/resorts\/test/);});
