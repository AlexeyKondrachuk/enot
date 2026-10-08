import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Run from the repository root: node scripts/generate-brand-assets.mjs
const logo = await readFile("public/enot-color.svg", "utf8");
const paths = [...logo.matchAll(/<path\b[^>]*\/>/g)].map(([path]) => path);
const symbol = paths.slice(1, 5).join("\n");
const background = "#091525";
const svg = (size, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 120 120">${content}</svg>\n`;
const icon = svg(120, `<rect width="120" height="120" rx="27" fill="${background}"/><g transform="scale(0.3076923077) translate(-240 -110)">${symbol}</g>`);
const appIcon = svg(512, `<rect width="120" height="120" fill="${background}"/><g transform="translate(60 60) scale(0.22) translate(-435 -305)">${symbol}</g>`);
await writeFile("public/favicon.svg", icon);
await writeFile("public/pwa-icon.svg", appIcon);
for (const [file, size, source] of [
  ["icon-32.png", 32, icon],
  ["apple-touch-icon.png", 180, appIcon],
  ["pwa-icon-192.png", 192, appIcon],
  ["pwa-icon-512.png", 512, appIcon],
  ["pwa-icon-maskable-512.png", 512, appIcon],
]) {
  await sharp(Buffer.from(source)).resize(size, size).png().toFile(`public/${file}`);
}
await sharp(Buffer.from(icon)).webp({ lossless: true }).toFile("public/favicon.webp");

// ICO directory containing PNG frames for browser and desktop fallbacks.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((size) => sharp(Buffer.from(icon)).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile("app/favicon.ico", Buffer.concat([directory, ...frames]));

console.log("Generated favicon, Apple and PWA assets. Open Graph cover is maintained separately.");
