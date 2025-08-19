import { ICreateAccount, IResetPassword } from "../types/emailTamplate";

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: "Verify your account",
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 20px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="20" style="background: #ffffff; border-radius: 8px; border: 1px solid #eaeaea; box-shadow: 0px 2px 6px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="padding: 20px;">
                  <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1751974354/pjx2nhdsv5j1alcbajvc.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px;" />
                  <h2 style="color: #3FC7EE; font-size: 22px; margin-bottom: 20px;">Hey ${values.name}, your Express List account credentials</h2>
                  <p style="color: #555; font-size: 16px; margin-bottom: 20px;">Your single-use code is:</p>
                  <div style="background-color: #3FC7EE; width: 100px; padding: 12px; text-align: center; border-radius: 8px; color: #ffffff; font-size: 22px; letter-spacing: 2px; margin: 20px auto;">
                    ${values.otp}
                  </div>
                  <p style="color: #555; font-size: 16px; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                  <p style="font-size: 14px; color: #d9534f; font-weight: bold;">For security reasons, do not share this code with anyone.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #f9f9f9; border-top: 1px solid #eaeaea; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                  <p>Thanks,<br/>The Express List Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    `,
  };
  return data;
};


const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email!,
    subject: "Password Reset Request - Express List",
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; margin: 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="20" style="background: #ffffff; border-radius: 8px; border: 1px solid #eaeaea;">
              <tr>
                <td align="center" style="background-color: #3FC7EE; border-radius: 8px 8px 0 0; padding: 20px;">
                  <h2 style="margin: 0; color: #ffffff;">Express List</h2>
                </td>
              </tr>
              <tr>
                <td style="font-size: 15px; color: #333; line-height: 1.6;">
                  <p>Hi ${values.name || "User"},</p>
                  <p>We received a request to reset the password for your Express List account.</p>
                  <p>Please use the One-Time Password (OTP) below to proceed:</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <span style="display: inline-block; padding: 12px 24px; background: #3FC7EE; color: #ffffff; font-size: 20px; letter-spacing: 2px; border-radius: 6px;">
                      ${values.otp}
                    </span>
                  </div>
                  <p>This OTP is valid for the next 3 minutes.</p>
                  <p>If you didn’t request a password reset, please ignore this email.</p>
                  <p style="color: #d9534f; font-weight: bold;">For security reasons, do not share this OTP with anyone.</p>
                  <p>If you need further assistance, please visit our help center.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="background-color: #f9f9f9; border-top: 1px solid #eaeaea; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                  <p>Thanks,<br/>The Express List Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
