import { env } from "../../config/env";
import { logger } from "../utils/logger";

type RegistrationNotificationInput = {
  userId: string;
  maskedEmail: string;
  isWhitelisted: boolean;
};

function buildTelegramApiUrl(token: string): string {
  return `https://api.telegram.org/bot${token}/sendMessage`;
}

function buildRegistrationText(input: RegistrationNotificationInput): string {
  const whitelistLabel = input.isWhitelisted ? "WHITELISTED" : "NOT_WHITELISTED";

  return [
    "New registration",
    `User ID: ${input.userId}`,
    `Email: ${input.maskedEmail}`,
    `Whitelist status: ${whitelistLabel}`
  ].join("\n");
}

export const telegramNotifier = {
  async notifyRegistration(input: RegistrationNotificationInput): Promise<void> {
    if (!env.TELEGRAM_REPORTING_ENABLED) {
      return;
    }

    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      logger.warn("telegram_registration_notification_skipped_missing_config", {
        userId: input.userId
      });
      return;
    }

    try {
      const response = await fetch(buildTelegramApiUrl(botToken), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildRegistrationText(input)
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        logger.warn("telegram_registration_notification_failed", {
          userId: input.userId,
          statusCode: response.status
        });
        return;
      }

      logger.info("telegram_registration_notification_sent", {
        userId: input.userId,
        isWhitelisted: input.isWhitelisted
      });
    } catch (error) {
      logger.error("telegram_registration_notification_error", {
        userId: input.userId,
        error
      });
    }
  }
};
