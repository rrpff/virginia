import z from "zod";

export type Site = z.infer<typeof SiteSchema>;
export const SiteSchema = z.object({
  name: z.string().nullish(),
  icon_url: z.string().url().nullish(),
});

export type FeedItem = z.infer<typeof FeedItemSchema>;
export const FeedItemSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  timestamp: z.number(), // TODO: z.date
});

export type Feed = z.infer<typeof FeedSchema>;
export const FeedSchema = z.array(FeedItemSchema);
