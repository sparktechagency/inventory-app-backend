import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(
    auth(USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN),
    UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.Admin, USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.SUPER_ADMIN),
    fileUploadHandler() as any,
    UserController.updateProfile
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );
router.route("/verify-otp").post(UserController.verifyOtp);

// update store information
router.patch('/update-store/:userId', UserController.updateStoreInformation);

export const UserRoutes = router;
