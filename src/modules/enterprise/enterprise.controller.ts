import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { CreateEnterpriseBody, DeleteEnterpriseParams, UpdateEnterpriseBody, UpdateEnterpriseParams } from "./enterprise.schemas";
import { enterpriseService } from "./enterprise.service";

export async function listMyEnterprises(req: Request, res: Response): Promise<void> {
  const userId = req.user?.sub as string;
  const enterprises = await enterpriseService.listMyEnterprises(userId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MY_ENTERPRISES_LISTED",
    data: {
      enterprises
    }
  });
}

export async function listVerifiedDirectory(req: Request, res: Response): Promise<void> {
  const enterprises = await enterpriseService.listVerifiedDirectory();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "ENTERPRISE_DIRECTORY_LISTED",
    data: {
      enterprises
    }
  });
}

export async function createEnterprise(req: Request, res: Response): Promise<void> {
  const userId = req.user?.sub as string;
  const enterprise = await enterpriseService.createEnterprise(userId, req.body as CreateEnterpriseBody);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "MY_ENTERPRISE_CREATED",
    data: {
      enterprise
    }
  });
}

export async function updateEnterprise(req: Request, res: Response): Promise<void> {
  const userId = req.user?.sub as string;
  const enterpriseId = (req.params as UpdateEnterpriseParams).enterpriseId;
  const enterprise = await enterpriseService.updateEnterprise(userId, enterpriseId, req.body as UpdateEnterpriseBody);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MY_ENTERPRISE_UPDATED",
    data: {
      enterprise
    }
  });
}

export async function deleteEnterprise(req: Request, res: Response): Promise<void> {
  const userId = req.user?.sub as string;
  const enterpriseId = (req.params as DeleteEnterpriseParams).enterpriseId;
  const result = await enterpriseService.deleteEnterprise(userId, enterpriseId);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "MY_ENTERPRISE_DELETED",
    data: result
  });
}
