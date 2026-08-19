import { z } from "zod";

const ateneoTabSchema = z.enum(["mine", "discover", "admin"]).optional();
const ateneoLimitSchema = z.coerce.number().int().min(1).max(50).optional();
const ateneoTopicToneSchema = z.enum(["LIBRE", "SERIO", "RECOMENDADO"]);
const ateneoReactionValueSchema = z.enum(["value"]);
const ateneoPermissionModeSchema = z.enum(["free", "admins"]);

export const listAteneoGroupsSchema = z.object({
  query: z.object({
    tab: ateneoTabSchema,
    limit: ateneoLimitSchema
  })
});

export const listAteneoFeedSchema = z.object({
  query: z.object({
    limit: ateneoLimitSchema
  })
});

export const getAteneoGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  })
});

export const listAteneoGroupMembersSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  })
});

export const joinAteneoGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  })
});

export const updateAteneoGroupSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  }),
  body: z.object({
    name: z.string().trim().min(3).max(120),
    description: z.string().trim().max(1000).optional(),
    icon: z.string().trim().min(1).max(40).default("community"),
    isOfficial: z.boolean().optional(),
    rules: z.array(z.string().trim().min(1).max(280)).max(12).optional(),
    createTopicsMode: ateneoPermissionModeSchema.default("free"),
    commentsMode: ateneoPermissionModeSchema.default("free")
  })
});

export const createAteneoGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(120),
    description: z.string().trim().max(1000).optional(),
    icon: z.string().trim().min(1).max(40).default("community"),
    isOfficial: z.boolean().optional(),
    rules: z.array(z.string().trim().min(1).max(280)).max(12).optional(),
    createTopicsMode: ateneoPermissionModeSchema.default("free"),
    commentsMode: ateneoPermissionModeSchema.default("free")
  })
});

export const listAteneoTopicsSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  }),
  query: z.object({
    limit: ateneoLimitSchema
  })
});

export const createAteneoTopicSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  }),
  body: z.object({
    title: z.string().trim().min(3).max(140),
    description: z.string().trim().min(3).max(4000),
    tone: ateneoTopicToneSchema.default("LIBRE")
  })
});

export const getAteneoTopicSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  })
});

export const listAteneoTopicCommentsSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  })
});

export const createAteneoTopicCommentSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  }),
  body: z.object({
    content: z.string().trim().min(1).max(2000),
    parentCommentId: z.string().min(1).optional(),
    mentionUserId: z.string().min(1).optional()
  })
});

export const toggleAteneoTopicReactionSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  }),
  body: z.object({
    reactionValue: ateneoReactionValueSchema.default("value")
  }).default({
    reactionValue: "value"
  })
});

export const toggleAteneoTopicCommentReactionSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1),
    commentId: z.string().min(1)
  }),
  body: z.object({
    reactionValue: ateneoReactionValueSchema.default("value")
  }).default({
    reactionValue: "value"
  })
});

export type AteneoTab = NonNullable<z.infer<typeof ateneoTabSchema>>;
export type ListAteneoGroupsQuery = z.infer<typeof listAteneoGroupsSchema>["query"];
export type ListAteneoFeedQuery = z.infer<typeof listAteneoFeedSchema>["query"];
export type AteneoGroupParams = z.infer<typeof getAteneoGroupSchema>["params"];
export type ListAteneoGroupMembersParams = z.infer<typeof listAteneoGroupMembersSchema>["params"];
export type CreateAteneoGroupBody = z.infer<typeof createAteneoGroupSchema>["body"];
export type UpdateAteneoGroupBody = z.infer<typeof updateAteneoGroupSchema>["body"];
export type AteneoPermissionMode = z.infer<typeof ateneoPermissionModeSchema>;
export type ListAteneoTopicsQuery = z.infer<typeof listAteneoTopicsSchema>["query"];
export type CreateAteneoTopicBody = z.infer<typeof createAteneoTopicSchema>["body"];
export type AteneoTopicParams = z.infer<typeof getAteneoTopicSchema>["params"];
export type CreateAteneoTopicCommentBody = z.infer<typeof createAteneoTopicCommentSchema>["body"];
export type ToggleAteneoTopicReactionBody = z.infer<typeof toggleAteneoTopicReactionSchema>["body"];
export type ToggleAteneoTopicCommentReactionBody = z.infer<typeof toggleAteneoTopicCommentReactionSchema>["body"];
export type AteneoCommentParams = z.infer<typeof toggleAteneoTopicCommentReactionSchema>["params"];
