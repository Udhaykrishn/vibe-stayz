import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  server: {host:'0.0.0.0',port:4173},
  output: 'server', adapter: cloudflare({ imageService: 'compile' }),
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()], server: { host:'0.0.0.0', port:4173, strictPort:true, allowedHosts: ['terminal.local'], hmr: {host:'terminal.local',clientPort:4173,protocol:'ws'} } },
});
