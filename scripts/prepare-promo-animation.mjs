import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const folder = "output/promo-animation";
await mkdir(folder, { recursive: true });
const sheet = process.argv[2];
if (!sheet) throw new Error("Pass the transparent object sheet path.");
for (const [name, left, width, target] of [
  ["card", 0, 630, 135],
  ["laptop", 630, 1070, 320],
  ["phone", 1700, 472, 104],
]) {
  const crop = await sharp(sheet).extract({ left, top: 0, width, height: 724 }).png().toBuffer();
  await sharp(crop).trim().resize({ width: target }).png().toFile(`${folder}/${name}.png`);
}
const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480">
<defs><radialGradient id="glow"><stop stop-color="#657500"/><stop offset="1" stop-color="#07131d"/></radialGradient></defs>
<rect width="480" height="480" fill="#07131d"/>
<ellipse cx="250" cy="390" rx="290" ry="150" fill="url(#glow)"/>
<path d="M-20 380 Q230 120 500 350" fill="none" stroke="#DFFF00" stroke-width="2" opacity=".5"/>
<path d="M-20 405 Q220 470 500 290" fill="none" stroke="#DFFF00" stroke-width="1" opacity=".3"/>
</svg>`);
const header = await sharp("public/enot-yandex-direct-business-hero.jpg")
  .extract({ left: 0, top: 0, width: 1200, height: 420 }).resize(480, 168).png().toBuffer();
await sharp(background).composite([{ input: header, left: 0, top: 0 }]).png().toFile(`${folder}/background.png`);
console.log("Prepared independent transparent animation layers.");
