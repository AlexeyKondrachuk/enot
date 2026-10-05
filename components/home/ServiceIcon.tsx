import Image from "next/image";

const icons = [
  "/icons/corporate-sites.svg",
  "/icons/e-commerce.svg",
  "/icons/web-apps.svg",
] as const;

export default function ServiceIcon({ index }: { index: number }) {
  const src = icons[index] ?? icons[0];

  return <Image src={src} width={32} height={32} alt="" aria-hidden="true"/>;
}
