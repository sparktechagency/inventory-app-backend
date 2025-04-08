import { Router } from "express";
import { multiPaymentMethodController } from "./multiPaymentMethod.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const route = Router()

route.get("/successful-payments", auth(USER_ROLES.SUPER_ADMIN), multiPaymentMethodController.getAllSuccessfulPayment);

export const multiPaymentMethodRoutes = route;

