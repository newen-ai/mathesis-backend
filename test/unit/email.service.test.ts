import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../src/common/services/email.service";

describe("email.service", () => {
  const originalApiKey = env.RESEND_API_KEY;

  afterEach(() => {
    env.RESEND_API_KEY = originalApiKey;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns sent false without calling Resend when API key is missing", async () => {
    env.RESEND_API_KEY = undefined;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendVerificationEmail({
      email: "alice@example.com",
      verificationUrl: "http://localhost:3000/confirm?token=test-token"
    });

    expect(result).toEqual({ sent: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns sent true with resend id on successful verification email", async () => {
    env.RESEND_API_KEY = "test-resend-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: "email_123" })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendVerificationEmail({
      email: "alice@example.com",
      verificationUrl: "http://localhost:3000/confirm?token=test-token"
    });

    expect(result).toEqual({ sent: true, id: "email_123" });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, { method?: string; body?: unknown }];
    expect(url).toBe("https://api.resend.com/emails");
    expect(requestInit.method).toBe("POST");

    const body = JSON.parse(String(requestInit.body)) as {
      subject: string;
      to: string[];
      from: string;
      html: string;
    };

    expect(body.subject).toBe("Confirma tu correo en Mathesis");
    expect(body.to).toEqual(["alice@example.com"]);
    expect(body.from).toBe(env.EMAIL_FROM);
    expect(body.html).toContain("Confirmar correo");
  });

  it("returns sent false when resend response is not ok", async () => {
    env.RESEND_API_KEY = "test-resend-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn()
      })
    );

    const result = await sendVerificationEmail({
      email: "alice@example.com",
      verificationUrl: "http://localhost:3000/confirm?token=test-token"
    });

    expect(result).toEqual({ sent: false });
  });

  it("returns sent false when resend response has no id", async () => {
    env.RESEND_API_KEY = "test-resend-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      })
    );

    const result = await sendPasswordResetEmail({
      email: "alice@example.com",
      resetUrl: "http://localhost:3000/reset-password?token=test-token",
      expiresInMinutes: 15
    });

    expect(result).toEqual({ sent: false });
  });
});
