import fs from "node:fs";
import webpush from "web-push";

const envPath = ".env.local";
const keys = webpush.generateVAPIDKeys();
const current = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

function setVariable(source, name, value) {
  const line = `${name}="${value}"`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (pattern.test(source)) return source.replace(pattern, line);
  return `${source.trimEnd()}${source.trim() ? "\n" : ""}${line}\n`;
}

let next = setVariable(current, "NEXT_PUBLIC_VAPID_PUBLIC_KEY", keys.publicKey);
next = setVariable(next, "VAPID_PRIVATE_KEY", keys.privateKey);
next = setVariable(next, "VAPID_SUBJECT", "mailto:hello@enot.dev");
fs.writeFileSync(envPath, next, "utf8");

console.log("VAPID keys were generated and saved to .env.local.");
console.log("Restart both Next.js and the chat server.");
