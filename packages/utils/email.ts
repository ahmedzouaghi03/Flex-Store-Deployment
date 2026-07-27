import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/resetPassword?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset Your Password - Flex</title>
</head>
<body style="margin:0;padding:0;background:#f4f7ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4f7ee;">
    <tr><td style="padding:40px 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;box-shadow:0 4px 16px rgba(26,52,6,0.08);overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a3406,#4a7018 50%,#7ab820);padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Reset Your Password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px 0;font-size:16px;color:#1a2410;">We received a request to reset your <strong>Flex</strong> account password.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="text-align:center;padding:10px 0 30px 0;">
                  <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4a7018,#5c8c1e);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:12px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px 0;font-size:14px;color:#6a7860;">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f7ee;padding:20px 40px;text-align:center;font-size:12px;color:#6a7860;border-top:1px solid #d6e8b8;">
            <strong style="color:#1a3406;">👟 Flex</strong> · Léger. Flexible. Confortable.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  return resend.emails.send({
    from: "Flex <onboarding@resend.dev>",
    to: email,
    subject: "Reset Your Password - Flex",
    html,
  });
}

export async function sendContactFormEmail({
  recipient,
  name,
  email,
  phone,
  subject,
  message,
}: {
  recipient: string | string[];
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const displaySubject = subject?.trim() || "General Inquiry";

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7ee;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7ee;padding:32px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:32px;background:linear-gradient(135deg,#1a3406,#4a7018 50%,#7ab820);color:#fff;">
            <div style="font-size:22px;font-weight:700;">New Contact — ${displaySubject}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            <p><strong>Subject:</strong> ${displaySubject}</p>
            <div style="padding:20px;border:1px solid #d6e8b8;border-radius:12px;background:#f4f7ee;white-space:pre-line;">${message}</div>
            <div style="margin-top:20px;">
              <a href="mailto:${email}?subject=Re: ${displaySubject}" style="display:inline-block;background:linear-gradient(135deg,#4a7018,#5c8c1e);color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;">
                Reply to ${name.split(" ")[0]}
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  return resend.emails.send({
    from: "Flex <onboarding@resend.dev>",
    to: recipient,
    replyTo: email,
    subject: `[Flex] ${displaySubject} — from ${name}`,
    html,
  });
}
