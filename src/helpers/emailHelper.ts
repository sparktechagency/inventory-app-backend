// import nodemailer from "nodemailer";
// import config from "../config";
// import { errorLogger, logger } from "../shared/logger";
// import { ISendEmail } from "../types/email";

// const transporter = nodemailer.createTransport({
//   host: config.email.host,
//   port: Number(config.email.port),
//   secure: false,
//   auth: {
//     user: config.email.user,
//     pass: config.email.pass,
//   },
// });

// const sendEmail = async (values: ISendEmail) => {
//   try {


//     const info = await transporter.sendMail({
//       from: `"Express List" ${config.email.from}`,
//       to: values.to,
//       subject: values.subject,
//       html: values.html,
//     });

//     logger.info("Mail send successfully", info.accepted);
//   } catch (error) {
//     errorLogger.error("Email", error);
//   }
// };

// export const emailHelper = {
//   sendEmail,
// };
import nodemailer from "nodemailer";
import config from "../config";
import { errorLogger, logger } from "../shared/logger";
import { ISendEmail } from "../types/email";

const transporter = nodemailer.createTransport({
  host: config.email.host, // smtp.zoho.com
  port: Number(config.email.port), // usually 465 for SSL
  secure: Number(config.email.port) === 465, // Zoho uses SSL on 465
  auth: {
    user: config.email.user, // noreply@yourdomain.com
    pass: config.email.pass, // your Zoho password
  },
  tls: {
    rejectUnauthorized: false, // avoid SSL errors if certificate mismatch
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: config.email.from, // e.g., "Express List <noreply@yourdomain.com>"
      to: values.to,
      subject: values.subject,
      html: values.html,
    });

    logger.info("✅ Mail sent successfully", info.accepted);
  } catch (error) {
    errorLogger.error("❌ Email sending failed:", error);
    throw error; // rethrow to handle upstream
  }
};

export const emailHelper = {
  sendEmail,
};
