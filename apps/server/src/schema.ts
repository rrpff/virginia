import z from "zod";

// TODO: REVISE THESE
export type Site = z.infer<typeof SiteSchema>;
export const SiteSchema = z.object({
  name: z.string().nullish(),
  iconUrl: z.string().url().nullish(),
});

export type FeedItem = z.infer<typeof FeedItemSchema>;
export const FeedItemSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  timestamp: z.number(), // TODO: z.date
});

export type Feed = z.infer<typeof FeedSchema>;
export const FeedSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  categoryIds: z.array(z.string()),
});

export type Category = z.infer<typeof CategorySchema>;
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "can't be empty!"),
  icon: z.string().regex(/\p{Extended_Pictographic}{1}/u, "just emoji ok!"),
});

export type ServerEvent =
  | { type: "refresh-started" }
  | { type: "refresh-ended" }
  | { type: "feed-updated"; feedId: string };

export const SourceCreateSchema = z.object({
  feedId: z.string().uuid(),
  url: z.string(),
  name: z.string().nullable(),
  iconUrl: z.string().nullable(),
});

export const SourceDeleteSchema = z.object({
  sourceId: z.string().uuid(),
});

export const FeedCreateSchema = z.object({
  sources: z.array(SourceCreateSchema.omit({ feedId: true })),
  categoryIds: z.array(z.string()),
  iconUrl: z.string().optional(),
  name: z.string().optional(),
});

export const FeedUpdateSchema = FeedCreateSchema.partial()
  .omit({ sources: true })
  .extend({
    id: z.string().uuid(),
  });

export const FeedDeleteSchema = z.object({
  feedId: z.string().uuid(),
});

export const CategoryDeleteSchema = z.object({
  categoryId: z.string().uuid(),
});
