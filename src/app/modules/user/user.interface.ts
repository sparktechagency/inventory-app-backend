import { Model } from 'mongoose';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  role: USER_ROLES;
  businessCategory: BUSINESS_CATEGORY;
  location: string;
  isSubscribed: boolean;
  image?: string;
  status: 'active' | 'delete';
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
