import { z } from "zod";

export const connectionByUserIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1)
  })
});

export type ConnectionByUserIdParams = z.infer<typeof connectionByUserIdSchema>["params"];
