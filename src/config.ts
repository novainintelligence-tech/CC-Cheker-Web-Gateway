import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  databaseUrl: process.env.DATABASE_URL || '',
  flwPublicKey: process.env.FLW_PUBLIC_KEY || '',
  flwSecretKey: process.env.FLW_SECRET_KEY || '',
  flwSandbox: (process.env.FLW_SANDBOX || 'true') === 'true',
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
};
