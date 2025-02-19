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



// send response from wholesaler to retailer
router.get("/received", auth(USER_ROLES.Retailer), sendOfferController.getAllReceiveOffers)


router.patch("/:id", auth(USER_ROLES.Wholesaler), sendOfferController.updateOffer)
// send response from retailer to wholesaler
router.patch("/retailer/:id", auth(USER_ROLES.Retailer), sendOfferController.confirmOrderFromRetailer)
// get all pending product from retailer
router.get('/pending-retailer', auth(USER_ROLES.Retailer), sendOfferController.getPendingOffersFromRetailer)
// get single pending offers from retailer
router.get("/pending/:id", auth(USER_ROLES.Retailer), sendOfferController.getSinglePendingOfferFromRetailer);
//  delete single pending offers from retailer
router.delete("/pending/:id", auth(USER_ROLES.Retailer), sendOfferController.deleteSinglePendingOfferFromRetailer);

export const offerRoutes = router;