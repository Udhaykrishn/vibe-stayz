import {runtime} from './env';
const encoder=new TextEncoder();
export async function sha256(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function checkPassword(password:string,stored:string){
 const [salt,hex]=stored.split(':');if(!salt||!hex)return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const result=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));
 const expected=Uint8Array.from(hex.match(/.{2}/g)||[],x=>parseInt(x,16));let diff=result.length^expected.length;for(let i=0;i<result.length;i++)diff|=result[i]^(expected[i]||0);return diff===0;
}
export async function sessionValid(token:string|undefined){if(!token||token.length!==64)return false;const record=await runtime().DB.prepare('SELECT expires_at FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await sha256(token),Date.now()).first();return !!record;}
export const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');
