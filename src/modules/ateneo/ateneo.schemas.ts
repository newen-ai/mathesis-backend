import { z } from "zod";

const ateneoTabSchema = z.enum(["mine", "discover", "admin"]).optional();
const ateneoLimitSchema = z.coerce.number().int().min(1).max(50).optional();
const ateneoTopicToneSchema = z.enum(["LIBRE", "SERIO", "RECOMENDADO"]);
const ateneoReactionValueSchema = z.enum(["value"]);
const ateneoPermissionModeSchema = z.enum(["free", "admins"]);
const ateneoKickSourceContextSchema = z.enum(["MEMBERS_LIST", "TOPIC", "COMMENT"]);
const ateneoModerationReasonSchema = z.string().trim().max(500).optional();

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

export const listAteneoGroupExpulsionsSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  })
});

export const listAteneoRemovedContentSchema = z.object({
  params: z.object({
    groupId: z.string().min(1)
  })
});

export const kickAteneoGroupMemberSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    targetUserId: z.string().min(1)
  }),
  body: z.object({
    reason: z.string().trim().max(500).optional(),
    sourceContext: ateneoKickSourceContextSchema,
    sourceTopicId: z.string().min(1).optional(),
    sourceCommentId: z.string().min(1).optional()
  }).superRefine((value, ctx) => {
    if (value.sourceContext === "TOPIC" && !value.sourceTopicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sourceTopicId is required for TOPIC sourceContext",
        path: ["sourceTopicId"]
      });
    }

    if (value.sourceContext === "COMMENT") {
      if (!value.sourceTopicId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceTopicId is required for COMMENT sourceContext",
          path: ["sourceTopicId"]
        });
      }

      if (!value.sourceCommentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "sourceCommentId is required for COMMENT sourceContext",
          path: ["sourceCommentId"]
        });
      }
    }
  })
});

export const restoreAteneoGroupMemberSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    targetUserId: z.string().min(1)
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
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(3).max(1000),
    tone: ateneoTopicToneSchema.default("LIBRE")
  })
});

export const getAteneoTopicSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  })
});

export const deleteAteneoTopicSchema = getAteneoTopicSchema;

export const moderateRemoveAteneoTopicSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  }),
  body: z.object({
    reason: ateneoModerationReasonSchema
  }).default({})
});

export const moderateRestoreAteneoTopicSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  }),
  body: z.object({
    reason: ateneoModerationReasonSchema
  }).default({})
});

export const getRemovedAteneoTopicPreviewSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1)
  })
});

export const downloadAteneoTopicAttachmentSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1),
    attachmentId: z.string().min(1)
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

export const moderateRemoveAteneoTopicCommentSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1),
    commentId: z.string().min(1)
  }),
  body: z.object({
    reason: ateneoModerationReasonSchema
  }).default({})
});

export const moderateRestoreAteneoTopicCommentSchema = z.object({
  params: z.object({
    groupId: z.string().min(1),
    topicId: z.string().min(1),
    commentId: z.string().min(1)
  }),
  body: z.object({
    reason: ateneoModerationReasonSchema
  }).default({})
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
export type ListAteneoGroupExpulsionsParams = z.infer<typeof listAteneoGroupExpulsionsSchema>["params"];
export type ListAteneoRemovedContentParams = z.infer<typeof listAteneoRemovedContentSchema>["params"];
export type CreateAteneoGroupBody = z.infer<typeof createAteneoGroupSchema>["body"];
export type UpdateAteneoGroupBody = z.infer<typeof updateAteneoGroupSchema>["body"];
export type AteneoPermissionMode = z.infer<typeof ateneoPermissionModeSchema>;
export type KickAteneoGroupMemberParams = z.infer<typeof kickAteneoGroupMemberSchema>["params"];
export type KickAteneoGroupMemberBody = z.infer<typeof kickAteneoGroupMemberSchema>["body"];
export type RestoreAteneoGroupMemberParams = z.infer<typeof restoreAteneoGroupMemberSchema>["params"];
export type ListAteneoTopicsQuery = z.infer<typeof listAteneoTopicsSchema>["query"];
export type CreateAteneoTopicBody = z.infer<typeof createAteneoTopicSchema>["body"];
export type AteneoTopicParams = z.infer<typeof getAteneoTopicSchema>["params"];
export type ModerateRemoveAteneoTopicBody = z.infer<typeof moderateRemoveAteneoTopicSchema>["body"];
export type ModerateRestoreAteneoTopicBody = z.infer<typeof moderateRestoreAteneoTopicSchema>["body"];
export type RemovedAteneoTopicPreviewParams = z.infer<typeof getRemovedAteneoTopicPreviewSchema>["params"];
export type AteneoTopicAttachmentParams = z.infer<typeof downloadAteneoTopicAttachmentSchema>["params"];
export type CreateAteneoTopicCommentBody = z.infer<typeof createAteneoTopicCommentSchema>["body"];
export type ModerateRemoveAteneoCommentParams = z.infer<typeof moderateRemoveAteneoTopicCommentSchema>["params"];
export type ModerateRemoveAteneoCommentBody = z.infer<typeof moderateRemoveAteneoTopicCommentSchema>["body"];
export type ModerateRestoreAteneoCommentParams = z.infer<typeof moderateRestoreAteneoTopicCommentSchema>["params"];
export type ModerateRestoreAteneoCommentBody = z.infer<typeof moderateRestoreAteneoTopicCommentSchema>["body"];
export type ToggleAteneoTopicReactionBody = z.infer<typeof toggleAteneoTopicReactionSchema>["body"];
export type ToggleAteneoTopicCommentReactionBody = z.infer<typeof toggleAteneoTopicCommentReactionSchema>["body"];
export type AteneoCommentParams = z.infer<typeof toggleAteneoTopicCommentReactionSchema>["params"];
