import { ContactMessageCategory } from "@prisma/client";
import { prisma } from "../../common/prisma";

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
  }
};
