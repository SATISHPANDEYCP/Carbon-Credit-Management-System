import { google } from 'googleapis';

const toBase64Url = (input) => {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sendOtpEmail = async ({ toEmail, otpCode }) => {
  const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL, EMAIL_FROM } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL) {
    throw new Error('Missing Gmail OAuth environment variables. Required: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL');
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const from = EMAIL_FROM || EMAIL;

  const subject = 'Your Carbon Credit OTP';
  const body = [
    'Hi,',
    '',
    `Your login OTP is: ${otpCode}`,
    '',
    'This code is valid for 10 minutes.',
    'If you did not request this code, please ignore this email.',
    '',
    'Carbon Credit Management System'
  ].join('\n');

  const messageParts = [
    `From: ${from}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body
  ];

  const raw = toBase64Url(messageParts.join('\n'));

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw
    }
  });
};
