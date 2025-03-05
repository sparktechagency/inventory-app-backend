export type IVerifyEmail = {
  email: string;
  oneTimeCode: number;
};

export type ILoginData = {
  email?: string;
  password: string;
  phone?: string;
  otp?: number
};

export type IAuthResetPassword = {
  newPassword: string;
  confirmPassword: string;
};

export type IChangePassword = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
