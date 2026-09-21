import type { MetadataRoute } from "next";
import { calculators } from "@/calculators/registry";
import { siteConfig } from "@/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  for (const calculator of calculators) {
    entries.push({
      url: `${siteConfig.url}/${calculator.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  return entries;
}