import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

interface SendMailWithAttachmentInput {
  to: string;
  subject: string;
  html: string;
  attachmentPath: string;
  attachmentName: string;
}

export async function sendMailWithAttachment(
  input: SendMailWithAttachmentInput
): Promise<void> {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.SMTP_FROM_EMAIL
  ) {
    throw new AppError('La configuración SMTP no está completa.', 500);
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS.replace(/\s/g, '')
    }
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: [
      {
        filename: input.attachmentName,
        path: input.attachmentPath
      }
    ]
  });
}