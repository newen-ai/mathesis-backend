import { z } from "zod";

const feedContentSchema = z.string().max(4000).optional();
const feedLimitSchema = z.coerce.number().int().min(1).max(50).optional();
const feedSortBySchema = z.enum(["NEWEST", "OLDEST", "RECENTLY_UPDATED", "HOT"]).optional();
const feedGravitySchema = z.coerce.number().min(0.5).max(5).optional();
const feedReactionValueSchema = z.enum(["value"]);

export const createFeedPostSchema = z.object({
  body: z.object({
    content: feedContentSchema
  })
});

export const listFeedPostsSchema = z.object({
  query: z.object({
    limit: feedLimitSchema,
    sortBy: feedSortBySchema,
    gravity: feedGravitySchema
  })
});

export const deleteFeedPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1)
  })
});

export const toggleFeedPostReactionSchema = z.object({
  params: z.object({
    postId: z.string().min(1)
  }),
  body: z.object({
    reactionValue: feedReactionValueSchema.default("value")
  }).default({
    reactionValue: "value"
  })
});

export const downloadFeedAttachmentSchema = z.object({
  params: z.object({
    postId: z.string().min(1),
    attachmentId: z.string().min(1)
  })
});

export type CreateFeedPostBody = z.infer<typeof createFeedPostSchema>["body"];
export type ListFeedPostsQuery = z.infer<typeof listFeedPostsSchema>["query"];
export type DeleteFeedPostParams = z.infer<typeof deleteFeedPostSchema>["params"];
export type ToggleFeedPostReactionBody = z.infer<typeof toggleFeedPostReactionSchema>["body"];
export type ToggleFeedPostReactionParams = z.infer<typeof toggleFeedPostReactionSchema>["params"];
export type DownloadFeedAttachmentParams = z.infer<typeof downloadFeedAttachmentSchema>["params"];
export type FeedSortBy = NonNullable<z.infer<typeof feedSortBySchema>>;
export type FeedPostReactionValue = z.infer<typeof feedReactionValueSchema>;