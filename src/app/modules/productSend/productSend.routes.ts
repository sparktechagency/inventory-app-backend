import { Router } from "express";
import { productSendControllerFromRetailer } from "./productSend.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()

router.post("/send", auth(USER_ROLES.Retailer), productSendControllerFromRetailer.sendProductToWholesaler)
router.get("/all/:type", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler), productSendControllerFromRetailer.getAllProductToWholesaler)
router.patch("/update/:id", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.updateProductSendDetail)

export const productSendRoutes = router
