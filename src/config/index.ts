import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  // for stripe
  stripe: {
    stripeSecretKey: process.env.STRIPE_API_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
    paymentSuccess: process.env.STRIPE_PAYMENT_SUCCESS_LINK,
  },
  // twilo
  twilio: {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  },
  // paystack
  paystack: {
    secretKey: process.env.PAYSTACK_PAYMET_SECRECT_KEY,
    paymentSuccess: process.env.paymentSuccess,
    PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL,
  },
  // flutter wave
  FLUTTER_WAVE: {
    SECRETKEY: process.env.SECRET_KEY,
    PUBLISHKEY: process.env.PUBLICK_KEY,
    payment_url: process.env.payment_url,
  },
  // super admin
  SUPER_ADMIN: {
    EMAIL: process.env.SUPER_ADMIN_EMAIL,
    PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    CONFIRM_PASSWORD: process.env.CONFIRM_PASSWORD,
  },
};
