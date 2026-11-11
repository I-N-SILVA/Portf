import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { SERVICES } from "@/lib/services";

const service = SERVICES.mvp;

export const metadata: Metadata = {
  title: service.title,
  description: service.description,
  alternates: { canonical: service.slug },
  openGraph: { title: service.title, description: service.description, url: service.slug, type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image", title: service.title, description: service.description },
};

export default function Page() {
  return <ServicePage service={service} />;
}
