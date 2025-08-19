import { Router } from "express";
import { inviteLinkController } from "./inviteLink.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();
router.post(
  "/create",
  auth(USER_ROLES.SUPER_ADMIN),
  inviteLinkController.createInviteLink
);
router.get(
  "/",
  auth(USER_ROLES.Wholesaler, USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN),
  inviteLinkController.getSingleInviteLink
);
router.patch(
  "/update/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  inviteLinkController.updateInviteLink
);
router.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  inviteLinkController.deleteInviteLink
);
export const inviteLinkRoutes = router;
