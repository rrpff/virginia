import z from "zod";

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
