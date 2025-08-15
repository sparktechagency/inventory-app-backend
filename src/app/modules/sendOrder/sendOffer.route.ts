import { Router } from "express";
import { sendOfferController } from "./sendOffer.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()
router.post("/create", auth(USER_ROLES.Retailer), sendOfferController.createNewOrder)
router.get("/all", auth(USER_ROLES.Retailer), sendOfferController.getAllNewOrders)
router.patch("/:id", auth(USER_ROLES.Retailer), sendOfferController.updateSingleProduct)
router.delete("/:id", auth(USER_ROLES.Retailer), sendOfferController.deleteSingleOrMulifulOrder)

export const sendOfferRoutes = router