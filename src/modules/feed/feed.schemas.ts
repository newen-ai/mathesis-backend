import { z } from "zod";

const feedContentSchema = z.string().max(4000).optional();
const feedLimitSchema = z.coerce.number().int().min(1).max(50).optional();
const feedSortBySchema = z.enum(["NEWEST", "OLDEST", "RECENTLY_UPDATED", "HOT"]).optional();
const feedGravitySchema = z.coerce.number().min(0.5).max(5).optional();

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

export type CreateFeedPostBody = z.infer<typeof createFeedPostSchema>["body"];
export type ListFeedPostsQuery = z.infer<typeof listFeedPostsSchema>["query"];
export type DeleteFeedPostParams = z.infer<typeof deleteFeedPostSchema>["params"];
export type FeedSortBy = NonNullable<z.infer<typeof feedSortBySchema>>;