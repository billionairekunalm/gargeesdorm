import { SITE } from "@/lib/data";
export default function sitemap() {
  return [{ url: SITE.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
