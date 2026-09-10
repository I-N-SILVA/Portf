import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = join(root, "public/brand/aa-mark.png");
const paper = { r: 241, g: 239, b: 231, alpha: 1 };

async function icon(size, inset = 1) {
  const mark = await sharp(source)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(size - inset * 2, size - inset * 2, { fit: "contain", kernel: "lanczos3" })
    .sharpen({ sigma: size <= 32 ? 0.7 : 0.35 })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: paper } })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ palette: size <= 32, colours: 32 })
    .toBuffer();
}

function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size === 256 ? 0 : size, 6);
  header.writeUInt8(size === 256 ? 0 : size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

const favicon16 = await icon(16, 0);
const favicon32 = await icon(32, 1);
await writeFile(join(root, "public/favicon-16x16.png"), favicon16);
await writeFile(join(root, "public/favicon-32x32.png"), favicon32);
await writeFile(join(root, "public/favicon.ico"), ico(favicon32, 32));
await writeFile(join(root, "public/apple-touch-icon.png"), await icon(180, 12));
await writeFile(join(root, "public/icon-192.png"), await icon(192, 13));
await writeFile(join(root, "public/icon-512.png"), await icon(512, 34));

console.log("Generated AA favicon and app-icon set.");
