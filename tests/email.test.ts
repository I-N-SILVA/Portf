import { afterEach, describe, expect, it } from "vitest";
import { emailConfigured, nudgeEmailHtml, sendEmail } from "@/lib/email/send";

const env = { ...process.env };
afterEach(() => {
  process.env = { ...env };
});

describe("nudgeEmailHtml", () => {
  it("escapes the rendered message", () => {
    // {{name}} is filled from a client record; a company called
    // "Smith & Sons <Ltd>" must not be able to close the surrounding markup.
    const html = nudgeEmailHtml('Hi <b>Smith & Sons</b> "Ltd"');
    expect(html).toContain("Hi &lt;b&gt;Smith &amp; Sons&lt;/b&gt;");
    expect(html).not.toContain("<b>Smith");
  });

  it("escapes the CTA url and omits the button when there isn't one", () => {
    expect(nudgeEmailHtml("hello")).not.toContain("<a href");
    expect(nudgeEmailHtml("hello", 'https://x.test/?a="b"')).toContain(
      "https://x.test/?a=&quot;b&quot;",
    );
  });
});

describe("sendEmail", () => {
  it("reports unconfigured rather than throwing", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    expect(emailConfigured()).toBe(false);
    await expect(
      sendEmail({ to: "a@b.test", subject: "s", html: "<p>h</p>" }),
    ).resolves.toBe(false);
  });

  it("refuses an empty recipient without a round trip", async () => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.EMAIL_FROM = "Test <t@b.test>";
    expect(emailConfigured()).toBe(true);
    await expect(
      sendEmail({ to: "  ", subject: "s", html: "<p>h</p>" }),
    ).resolves.toBe(false);
  });
});
