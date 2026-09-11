/// <reference types="astro/client" />
declare namespace App { interface Locals { admin:boolean; csrf:string; data?:import('./types').SiteData; } }

declare module "cloudflare:workers" { export const env: unknown; }
