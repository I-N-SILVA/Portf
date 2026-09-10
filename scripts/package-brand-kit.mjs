import { copyFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = process.cwd();
const brand = join(root, 'public/brand');
await mkdir(join(brand, 'icons'), { recursive: true });
await mkdir(join(brand, 'licenses'), { recursive: true });
for (const [name, source] of [['Syne', '@fontsource-variable/syne'], ['Inter', '@fontsource-variable/inter'], ['Space-Mono', '@fontsource/space-mono']]) {
  await copyFile(join(root, 'node_modules', source, 'LICENSE'), join(brand, 'licenses', `${name}.txt`));
}
for (const name of ['favicon-16x16.png', 'favicon-32x32.png', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  await copyFile(join(root, 'public', name), join(brand, 'icons', name));
}
await sharp(join(root,'public/icon-512.png')).resize(48,48).png().toFile(join(brand,'icons/favicon-48x48.png'));
await copyFile(join(root,'docs/brand-system.md'),join(brand,'brand-system.md'));
const palette = { ink:'#0A0B0A',olive:'#6F9554',paper:'#F1EFE7',cobalt:'#3047E8',oliveText:'#3F5B2B',muted:'#5E6259' };
await writeFile(join(brand,'palette.json'),JSON.stringify(palette,null,2)+'\n');
await copyFile(join(root,'components/brand/tokens.css'),join(brand,'tokens.css'));
await writeFile(join(brand,'README.txt'),'IAN SILVA — BRAND KIT 01\n\nApproved identity: AA / AB / AC.\nTransparent PNG originals and optimized WebP assets.\nicons/: favicon and home-screen exports.\nsocial/: four post designs and identity board; PNG + editable standalone HTML.\nbrand-system.md: complete usage rules and next improvements.\npalette.json / tokens.css: exact digital palette.\n\nArtwork is raster, not a vector master. Social posts are prepared, not published.\nRegenerate templates: node scripts/export-brand-materials.mjs\nRepackage: node scripts/package-brand-kit.mjs\n');
const entries = (await readdir(brand)).filter(name => !name.endsWith('.zip'));
// Archive only public brand deliverables, never environment files or repository state.
execFileSync('zip',['-q','-r','-FS','ian-silva-brand-kit.zip',...entries],{cwd:brand});
console.log('Brand kit packaged.');
