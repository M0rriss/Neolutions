import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { groupIds } from "./data/serviceGroups";

const servicios = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/servicios" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      headline: z.string(),
      tagline: z.string(),
      description: z.string(),
      group: z.enum(groupIds),
      icon: z.enum(["support", "network", "camera", "web", "mobile", "automation", "search"]),
      order: z.number(),
      available: z.boolean().default(true),
      published: z.boolean().default(true),
      audienceShort: z.string(),
      includesShort: z.string(),
      problem: z.string(),
      includes: z.array(z.string()).min(3),
      benefits: z
        .array(z.object({ title: z.string(), text: z.string() }))
        .min(3)
        .max(4),
      audience: z.array(z.string()),
      whatsappMessage: z.string(),
      image: image().optional(),
      seoTitle: z.string().max(60),
      seoDescription: z.string().max(160),
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    scope: z.string(),
    order: z.number(),
    published: z.boolean().default(true),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proyectos" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      service: z.string(),
      client: z.string(),
      clientConsent: z.literal(true),
      problem: z.string(),
      result: z.string(),
      cover: image(),
      published: z.boolean().default(false),
    }),
});

const testimonios = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/testimonios" }),
  schema: z.object({
    name: z.string(),
    business: z.string(),
    quote: z.string(),
    clientConsent: z.literal(true),
    published: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(false),
  }),
});

export const collections = { servicios, faq, proyectos, testimonios, blog };
