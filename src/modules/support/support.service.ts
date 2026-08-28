import { ContactMessageCategory } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../common/errors/app-error";
import { prisma } from "../../common/prisma";
import type { CreateBugReportBody } from "./support.schemas";

const MAX_BUG_REPORT_ATTACHMENTS = 3;
const MAX_BUG_REPORT_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

type UploadedBugReportFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

function sanitizeText(value: string): string {
  return value.trim();
}

function assertBugReportFiles(files: UploadedBugReportFile[]): void {
  if (files.length > MAX_BUG_REPORT_ATTACHMENTS) {
    throw new AppError(
      `Only up to ${MAX_BUG_REPORT_ATTACHMENTS} screenshot files are allowed`,
      StatusCodes.BAD_REQUEST
    );
  }

  for (const file of files) {
    if (!file.mimetype.startsWith("image/")) {
      throw new AppError("Only image attachments are allowed for bug reports", StatusCodes.BAD_REQUEST);
    }

    if (file.size > MAX_BUG_REPORT_ATTACHMENT_SIZE_BYTES) {
      throw new AppError("Bug report image is too large", StatusCodes.BAD_REQUEST);
    }
  }
}

function normalizeContactCategory(category: string): ContactMessageCategory {
  switch (category) {
    case ContactMessageCategory.TECHNICAL_ISSUE:
      return ContactMessageCategory.TECHNICAL_ISSUE;
    case ContactMessageCategory.SUGGESTION:
      return ContactMessageCategory.SUGGESTION;
    case ContactMessageCategory.BUG_REPORT:
      return ContactMessageCategory.BUG_REPORT;
    case ContactMessageCategory.OTHER:
      return ContactMessageCategory.OTHER;
    case ContactMessageCategory.GENERAL_INQUIRY:
    default:
      return ContactMessageCategory.GENERAL_INQUIRY;
  }
}

export const supportService = {
  async createContactMessage(userId: string, category: string, details: string) {
    const message = await prisma.contactMessage.create({
      data: {
        userId,
        category: normalizeContactCategory(category),
        details
      }
    });

    return message;
  },

  async createBugReport(
    userId: string,
    body: CreateBugReportBody,
    files: UploadedBugReportFile[]
  ) {
    assertBugReportFiles(files);

    const message = await prisma.bugReport.create({
      data: {
        userId,
        title: sanitizeText(body.title),
        details: sanitizeText(body.description),
        pageUrl: sanitizeText(body.pageUrl),
        attachments: {
          create: files.map((file) => ({
            fileName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            fileData: file.buffer
          }))
        }
      },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    return message;
  }
};
