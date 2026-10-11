import ServicePage from "@/components/services/ServicePage";
import { servicePages } from "@/data/services";
import { pageMetadata } from "@/lib/seo";

const service = servicePages.store;
export const metadata = pageMetadata(service.title, service.description, service.path);

export default function Page() {
  return <ServicePage service={service} />;
}
