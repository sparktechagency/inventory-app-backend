import { Router } from "express";
import { confirmationFromRetailerController } from "./ConfirmationFromRetailer.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();
router.get("/all", auth(USER_ROLES.Retailer), confirmationFromRetailerController.testController);
router.get("/", auth(USER_ROLES.Wholesaler), confirmationFromRetailerController.getAllConfrimRequestFromRetailer);
router.get("/retailer", auth(USER_ROLES.Retailer), confirmationFromRetailerController.getAllConfirmRequestFromRetailerForRetailer);
router.patch("/", auth(USER_ROLES.Retailer), confirmationFromRetailerController.updatePendingProductAsRetailer);
export const confirmationFromRetailerRoutes = router