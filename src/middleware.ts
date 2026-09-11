import {defineMiddleware} from 'astro:middleware';
import {randomToken,sessionValid} from './lib/auth';
export const onRequest=defineMiddleware(async (ctx,next)=>{
 const path=ctx.url.pathname;
 ctx.locals.admin=false;
 if(path.startsWith('/admin')||path.startsWith('/api/admin')){
   try{ctx.locals.admin=await sessionValid(ctx.cookies.get('vibe_admin')?.value);}catch{ctx.locals.admin=false;}
   const token=ctx.cookies.get('vibe_csrf')?.value||randomToken();ctx.locals.csrf=token;
   if(!ctx.cookies.has('vibe_csrf'))ctx.cookies.set('vibe_csrf',token,{httpOnly:true,sameSite:'strict',secure:ctx.url.protocol==='https:',path:'/',maxAge:28800});
   if(ctx.request.method!=='GET'&&ctx.request.method!=='HEAD'){
     if(ctx.request.headers.get('origin')!==ctx.url.origin)return new Response('Invalid request origin',{status:403});
     if(ctx.request.headers.get('x-csrf-token')!==token)return Response.json({error:'Your session has changed. Reload the page and try again.'},{status:403});
   }
   const open=['/admin/login','/api/admin/login'];
   if(!ctx.locals.admin&&!open.includes(path))return path.startsWith('/api/')?Response.json({error:'Please sign in again.'},{status:401}):ctx.redirect('/admin/login');
 }
 let response:Response;
 try{response=await next();}catch(error){console.error('Page unavailable',error);response=new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>We’ll be right back | Vibe Stayz</title><body style="font:18px system-ui;background:#f6f6ef;color:#102c21;padding:10vw"><h1>We’ll be right back.</h1><p>We couldn’t load this page. Please try again in a moment.</p><a href="/">Back to Vibe Stayz</a></body></html>',{status:503,headers:{'content-type':'text/html;charset=utf-8'}});}
 response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(path.startsWith('/admin')||path.startsWith('/api/admin')){response.headers.set('Cache-Control','no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');}
 return response;
});
