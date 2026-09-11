import fs from 'node:fs/promises';
// Sites accepts standard Workers modules, assets, and versioned D1 migrations.
await fs.copyFile('dist/server/entry.mjs','dist/server/index.js');
// The Astro adapter may copy local development variables beside the Worker.
// Hosted runtime values are configured by Sites and must never enter archives.
await fs.rm('dist/server/.dev.vars',{force:true});
await fs.mkdir('dist/.openai',{recursive:true});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Astro Worker, assets and schema migrations staged.');
