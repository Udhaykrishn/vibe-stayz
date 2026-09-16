// Local integration test: node --env-file=.env.local tests/hero-banners.integration.mjs
// Uses a short-lived test session; never changes configured admin credentials.
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const local = url => ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname);
assert.ok(local(base) && local(process.env.SUPABASE_URL), 'Requires loopback app and database');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const token = randomBytes(32).toString('hex');
const hash = createHash('sha256').update(token).digest('hex');
const csrf = randomBytes(32).toString('hex');
const prefix = 'qa-banner-' + Date.now();
const ids = [];
let media;
const cookies = `vibe_admin=${token}; vibe_csrf=${csrf}`;
async function request(path, method = 'GET', body, authenticated = true) {
  return fetch(base + path, { method, redirect: 'manual', headers: {
    cookie: authenticated ? cookies : `vibe_csrf=${csrf}`, origin: base, 'x-csrf-token': csrf,
    ...(body instanceof FormData ? {} : {'content-type': 'application/json'}),
  }, body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body) });
}
async function api(entity, method, body, expected = 200, authenticated = true) {
  const res = await request('/api/admin/' + entity, method, body, authenticated);
  const text = await res.text();
  assert.equal(res.status, expected, text);
  return JSON.parse(text);
}
async function hero() {
  const res = await fetch(base); assert.equal(res.status, 200);
  const html = await res.text();
  return html.match(/<section class="promotion-hero[\s\S]*?<\/section>/)?.[0] || '';
}
try {
  const session = await db.from('admin_sessions').insert({ token_hash: hash, created_at: Date.now(), expires_at: Date.now() + 300000 });
  assert.ifError(session.error);
  await api('hero_banners', 'POST', {fields:{}}, 401, false);
  await api('hero_banners', 'POST', {fields:{title:'Missing fields'}}, 422);
  const form = new FormData();
  form.set('file', new Blob([readFileSync(new URL('../public/images/hero-1080.webp', import.meta.url))], {type:'image/webp'}), prefix + '.webp');
  media = await api('media', 'POST', form);
  assert.equal((await fetch(base + media.url)).status, 200);
  for (const [suffix, order] of [['later',9999],['earlier',9998]]) {
    const banner = await api('hero_banners', 'POST', {fields:{title:prefix + suffix, subtitle:'Independent banner', label:'A quiet escape', image:media.url, cta_label:'Explore', cta_url:'/resorts', display_order:order, active:1}});
    ids.push(banner.id);
  }
  let html = await hero();
  assert.ok(html.indexOf(prefix+'earlier') < html.indexOf(prefix+'later'));
  assert.ok(html.includes(media.url));
  const editor = await request('/admin/hero_banners/' + ids[0]);
  assert.equal(editor.status, 200);
  const editorHTML = await editor.text();
  for (const name of ['title','subtitle','label','image','cta_label','cta_url','display_order','active']) assert.ok(editorHTML.includes(`name="${name}"`), name);
  assert.ok(editorHTML.includes('data-delete-record'));
  await api('hero_banners', 'POST', {id:ids[0],fields:{cta_url:'javascript:alert(1)'}}, 422);
  await api('hero_banners', 'POST', {id:ids[0],fields:{title:''}}, 422);
  await api('hero_banners', 'POST', {id:ids[0],fields:{title:prefix+'edited',active:0}});
  assert.ok(!(await hero()).includes(prefix+'edited'));
  const preview = await request('/api/admin/preview?path=/');
  const previewCookie = preview.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
  const previewPage = await fetch(base, {headers:{cookie:cookies+'; '+previewCookie}});
  assert.ok((await previewPage.text()).includes(prefix+'edited'));
  await api('media', 'DELETE', {id:media.id}, 409);
  await api('hero_banners', 'DELETE', {id:ids[1]});
  assert.ok(!(await hero()).includes(prefix+'earlier'));
  const navHTML = await (await fetch(base)).text();
  const nav = navHTML.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]), ['/','/resorts','/about','/contact']);
  console.log('PASS: auth, required fields, image upload/delivery, banner create/edit/delete, active filtering, ordering, inactive preview, safe CTA validation, media usage protection, four-link navbar');
} finally {
  if(ids.length) assert.ifError((await db.from('hero_banners').delete().in('id',ids)).error);
  if(media) await api('media','DELETE',{id:media.id});
  assert.ifError((await db.from('admin_sessions').delete().eq('token_hash',hash)).error);
}
