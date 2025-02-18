import express from 'express';
import { sendOfferController } from './offer.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router()
// Create product route


router.post("/create", auth(USER_ROLES.Retailer), sendOfferController.createOfferController);

// !confirm get single one
// ! also delete one 



// !after come from wholesaler get offer
// ! single one get




// ! delete single pending offers from retailer

//! get single pending offers from retailer

//! get all pending product from retailer

// send response from wholesaler to retailer



router.patch("/:id", auth(USER_ROLES.Wholesaler), sendOfferController.updateOffer)
// send response from retailer to wholesaler
router.patch("/retailer/:id", auth(USER_ROLES.Retailer), sendOfferController.confirmOrderFromRetailer)

export const offerRoutes = router;