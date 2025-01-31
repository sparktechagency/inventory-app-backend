import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const route = Router();
route.post("/create", auth(USER_ROLES.Wholesaler), PaymentController.createPaymentController);


// export the router
export const paymentRoutes = route;