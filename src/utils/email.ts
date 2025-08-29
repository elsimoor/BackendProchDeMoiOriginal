import nodemailer from 'nodemailer';

/**
 * Generic email helper using nodemailer.  This helper constructs a
 * transport using SMTP credentials provided via environment
 * variables and sends an HTML email.  When SMTP configuration is
 * incomplete the function logs a warning and exits without
 * throwing an error.  This allows development environments to run
 * without sending real emails.
 *
 * Required environment variables:
 * - SMTP_HOST: SMTP server host name
 * - SMTP_PORT: SMTP server port
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * - The sender address defaults to SMTP_USER if not explicitly set
 */
export async function sendEmail(to: string | undefined, subject: string, html: string): Promise<void> {
  if (!to) {
    console.warn('sendEmail called without recipient, skipping');
    return;
  }
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn('SMTP configuration is missing; skipping email send');
    return;
  }
  const port = parseInt(portStr || '587', 10);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  try {
    await transporter.sendMail({
      from: user,
      to,
      subject,
      html,
    });
    console.info(`Email sent to ${to}`);
  } catch (err) {
    console.error('Failed to send email', err);
  }
}