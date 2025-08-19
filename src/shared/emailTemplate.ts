import { ICreateAccount, IResetPassword } from "../types/emailTamplate";

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: "Verify your account",
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1751974354/pjx2nhdsv5j1alcbajvc.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #3FC7EE; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Inventory Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #3FC7EE; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email!,
    subject: "Your password reset link",
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: left; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1751974354/pjx2nhdsv5j1alcbajvc.png" alt="Logo" style="display: block; width: 40px; margin: 0 auto;" />
        </div>
        <div style="text-align: left;">
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${values.name!}</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">We received a request to reset your password.</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Enter the code below to reset your password:</p>
            <div style="background-color: #3FC7EE; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 0 auto;">${
              values.otp
            }</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
