import { Router } from "express";
import { productSendControllerFromRetailer } from "./productSend.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router()

router.post("/send", auth(USER_ROLES.Retailer), productSendControllerFromRetailer.sendProductToWholesaler)

router.get("/all/:type", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler), productSendControllerFromRetailer.getAllProductToWholesaler)

// retailer received 
router.get("/all/received", auth(USER_ROLES.Retailer), productSendControllerFromRetailer.getAllReceivedProductFromWholesaler)

// retailer confirm
router.get("/all/confirmed", auth(USER_ROLES.Retailer), productSendControllerFromRetailer.getAllConfirmProductFromRetailer)

// retailer received
router.get("/all-product/received", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.getAllReceivedProductFromRetailer)

// wholesaler confirm
router.get("/all-product/confirm", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.getAllConfirmProductFromWholesaler)

router.patch("/update/:id", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.updateProductSendDetail)
router.patch("/update-all/:id", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.updateAllProductSendDetail)

router.patch("/update-received/:id", auth(USER_ROLES.Retailer), productSendControllerFromRetailer.updateProductReceivedToConfirmRequestFromRetailerToWholesaler)

router.patch("/update-delivered/:id", auth(USER_ROLES.Wholesaler), productSendControllerFromRetailer.updateDelivaryStatusAsaWholesaler)

router.delete("/:id", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler), productSendControllerFromRetailer.deleteProduct)

export const productSendRoutes = router
