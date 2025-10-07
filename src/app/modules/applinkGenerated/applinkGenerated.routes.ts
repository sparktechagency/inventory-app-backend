import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { applinkGeneratedController } from "./applinkGenerated.controller";

const rotute = Router();

rotute.post(
  "/create",
  auth(USER_ROLES.SUPER_ADMIN),
  applinkGeneratedController.createApplinkGenerated
);
rotute.get(
  "/:type",
  auth(USER_ROLES.SUPER_ADMIN),
  applinkGeneratedController.getApplinkGenerated
);

export const applinkGeneratedRoutes = rotute;

