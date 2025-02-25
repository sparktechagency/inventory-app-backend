import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    confirmPassword: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },

    isSubscribed: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true
    },
    storeInformation: {
      businessName: { type: String },
      businessCategory: { type: String, enum: Object.values(BUSINESS_CATEGORY) },
      location: { type: String },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    authentication: {
      isResetPassword: { type: Boolean, default: false },
      oneTimeCode: { type: Number, default: null },  // This will be null initially
      expireAt: { type: Date, default: null },  // This will also be null initially
    }

  },
  { timestamps: true }
);

// Check if a user exists by ID
userSchema.statics.isExistUserById = async function (id: string): Promise<IUser | null> {
  return await this.findById(id);
};

// Check if a user exists by email
userSchema.statics.isExistUserByEmail = async function (email: string): Promise<IUser | null> {
  return await this.findOne({ email });
};

// Check if the provided password matches the hashed password
userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

// Middleware for pre-save logic
userSchema.pre('save', async function (next) {
  // Cast `this.constructor` to the model type to access `findOne`
  const UserModel = this.constructor as unknown as UserModal;

  if (this.isModified('email')) {
    const isExist = await UserModel.findOne({ email: this.email });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists!');
    }
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }

  next();
});


// Export the model
export const User = model<IUser, UserModal>('User', userSchema);
