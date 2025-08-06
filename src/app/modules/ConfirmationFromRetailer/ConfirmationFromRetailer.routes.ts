import { Router } from "express";
import { confirmationFromRetailerController } from "./ConfirmationFromRetailer.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();
router.get("/all", auth(USER_ROLES.Retailer), confirmationFromRetailerController.testController);
router.patch("/", auth(USER_ROLES.Retailer), confirmationFromRetailerController.updatePendingProductAsRetailer);
router.get("/", auth(USER_ROLES.Wholesaler, USER_ROLES.Retailer, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), confirmationFromRetailerController.getAllConfrimRequestFromRetailer);
export const confirmationFromRetailerRoutes = router