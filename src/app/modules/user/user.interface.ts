import { Model } from 'mongoose';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  email?: string & { unique: true, sparse: true, lowercase: true };
  phone?: string & { unique: true, sparse: true };
  password: string;
  confirmPassword: string;
  role: USER_ROLES;
  isSubscribed: boolean;
  image?: string;
  status: 'active' | 'delete';
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  storeInformation?: {
    businessName: string;
    businessCategory: BUSINESS_CATEGORY;
    location: string;
  };
};

// export type UserModal = {
//   isExistUserById(id: string): any;
//   isExistUserByEmail(email: string): any;
//   isMatchPassword(password: string, hashPassword: string): boolean;
// } & Model<IUser>;
export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmailOrPhone(identifier: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
