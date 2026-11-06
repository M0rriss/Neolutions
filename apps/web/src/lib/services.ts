import { getCollection } from "astro:content";
import { serviceGroups, type GroupId } from "@/data/serviceGroups";

/** Servicios publicados, en el orden definido en cada .md */
export async function getServices() {
  const items = await getCollection("servicios", ({ data }) => data.published);
  return items.sort((a, b) => a.data.order - b.data.order);
}

export function groupTitle(id: GroupId): string {
  return serviceGroups.find((group) => group.id === id)?.title ?? id;
}
