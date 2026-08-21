import { Router } from "express";
import { asyncHandler } from "../../common/errors/async-handler";
import { requireAuth } from "../../common/middlewares/require-auth";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createEnterprise, deleteEnterprise, listMyEnterprises, listVerifiedDirectory, updateEnterprise } from "./enterprise.controller";
import { createEnterpriseSchema, deleteEnterpriseSchema, listMyEnterprisesSchema, updateEnterpriseSchema } from "./enterprise.schemas";

const enterpriseRouter = Router();

enterpriseRouter.get("/directory", asyncHandler(listVerifiedDirectory));

enterpriseRouter.get(
  "/my",
  requireAuth(),
  validateRequest(listMyEnterprisesSchema),
  asyncHandler(listMyEnterprises)
);

enterpriseRouter.post(
  "/",
  requireAuth(),
  validateRequest(createEnterpriseSchema),
  asyncHandler(createEnterprise)
);

enterpriseRouter.patch(
  "/:enterpriseId",
  requireAuth(),
  validateRequest(updateEnterpriseSchema),
  asyncHandler(updateEnterprise)
);

enterpriseRouter.delete(
  "/:enterpriseId",
  requireAuth(),
  validateRequest(deleteEnterpriseSchema),
  asyncHandler(deleteEnterprise)
);

export { enterpriseRouter };
