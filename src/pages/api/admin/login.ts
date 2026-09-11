import type {APIRoute} from 'astro';import {runtime} from '../../../lib/env';import {checkPassword,randomToken,sha256} from '../../../lib/auth';import {initializeContent} from '../../../lib/seed';
export const POST:APIRoute=async({request,cookies,url})=>{
 const env=runtime();if(!env.ADMIN_PASSWORD_HASH)return Response.json({error:'Admin access has not been configured. Set the server admin credentials first.'},{status:503});
 try{
 if(Number(request.headers.get('content-length'))>4096)return Response.json({error:'Invalid sign-in request.'},{status:413});
 const {username,password}=await request.json() as {username:string;password:string};if(typeof password!=='string'||password.length>256||typeof username!=='string')return Response.json({error:'Please enter your username and password.'},{status:400});
 await initializeContent(env);const now=Date.now();const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';const key=await sha256(ip);const reset=now+15*60*1000;
 const attempt=await env.DB.prepare('INSERT INTO login_attempts (key,attempts,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END, reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING attempts').bind(key,reset,now,now,reset).first<{attempts:number}>();
 if((attempt?.attempts||0)>8)return Response.json({error:'Too many sign-in attempts. Please try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
 const valid=await checkPassword(password,env.ADMIN_PASSWORD_HASH);
 if(!valid||username!==(env.ADMIN_USERNAME||'admin'))return Response.json({error:'The username or password is incorrect.'},{status:401});
 const token=randomToken();await env.DB.batch([env.DB.prepare('INSERT INTO admin_sessions (token_hash,created_at,expires_at) VALUES (?,?,?)').bind(await sha256(token),now,now+8*3600*1000),env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now),env.DB.prepare('DELETE FROM login_attempts WHERE key=? OR reset_at<?').bind(key,now)]);
 cookies.set('vibe_admin',token,{httpOnly:true,secure:url.protocol==='https:',sameSite:'strict',path:'/',maxAge:8*3600});return Response.json({ok:true});
 }catch(error){console.error('Admin login failed',error);return Response.json({error:'We couldn’t sign you in. Please try again.'},{status:503});}
};
