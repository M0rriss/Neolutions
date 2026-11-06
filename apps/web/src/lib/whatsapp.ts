import { site } from "@/data/site";

type Options = { message?: string; service?: { title: string; whatsappMessage: string } };

export function whatsappLink({ message, service }: Options = {}): string {
  const text = message ?? service?.whatsappMessage ?? site.whatsapp.defaultMessage;
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(text)}`;
}
