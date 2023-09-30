import nodemailer from 'nodemailer';
import logger from '../logger';

const fromName: string = process.env.FROM_NAME || 'Teach Hub';
const mailUser: string = process.env.GMAIL_USER || 'fake-mail@mail.com';
const mailPass: string = process.env.GMAIL_PASSWORD || 'fake-password';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailUser,
    pass: mailPass,
  },
});

export const sendEmail = async ({
  recipients,
  body,
  subject,
}: {
  recipients: string[];
  body: string;
  subject: string;
}) => {
  const info = await transporter.sendMail({
    from: `"${fromName}" <${mailUser}>`, // sender address
    to: recipients, // list of receivers
    subject,
    text: body,
  });
  /* Accepted has mails that accepted the request */
  const success = info.accepted.length;

  logger.info(
    `Email ${info.messageId} sent to ${recipients.join(', ')}. Successfull: ${success}`
  );
  /* Return if any recipients accepted the request */
  return !!success;
};
