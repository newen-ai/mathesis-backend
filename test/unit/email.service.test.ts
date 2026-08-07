import { afterEach, describe, expect, it } from "vitest";
import { env } from "../../src/config/env";
import { sendVerificationEmail } from "../../src/common/services/email.service";

describe("sendVerificationEmail", () => {
  afterEach(() => {
    // no-op
  });

  it("sends two real emails through Resend", async () => {
    expect(env.RESEND_API_KEY).toBeTruthy();
    expect(env.EMAIL_FROM).toBe("no-reply@mail.mathesis.social");

    const recipientEmails = (process.env.RESEND_TEST_RECIPIENTS ?? "kenrouit@gmail.com,kenrouit+01@gmail.com")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    expect(recipientEmails).toHaveLength(2);

    const firstResult = await sendVerificationEmail({
      email: recipientEmails[0],
      verificationUrl: "http://localhost:3000/confirm?token=test-token-1"
    });

    const secondResult = await sendVerificationEmail({
      email: recipientEmails[1],
      verificationUrl: "http://localhost:3000/confirm?token=test-token-2"
    });

    expect(firstResult.sent).toBe(true);
    expect(secondResult.sent).toBe(true);
    expect(firstResult.id).toBeTruthy();
    expect(secondResult.id).toBeTruthy();
  });
});
