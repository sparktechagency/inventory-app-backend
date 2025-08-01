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






/*
Pending
*/
router.patch("/:id", auth(USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), sendOfferController.updateOffer)
// send response from retailer to wholesaler
router.patch("/retailer/:id", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.confirmOrderFromRetailer)
// get all pending product from retailer
router.get('/pending-retailer', auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.getPendingOffersFromRetailer)
// get single pending offers from retailer
router.get("/pending/:id", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.getSinglePendingOfferFromRetailer);
//  delete single pending offers from retailer
router.delete("/pending/:id", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.deleteSinglePendingOfferFromRetailer);


/**
Received 
*/
// send response from wholesaler to retailer
router.get("/received", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.getAllReceiveOffers)

// delete single Receive 

router.delete("/received/:id", auth(USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), sendOfferController.deleteSingleReceiveOfferFromRetailer);

// get single one
router.get("/received/:id", auth(USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), sendOfferController.getSingleReceiveOfferFromRetailerIntoDB)




/*
Confirm
*/

router.get("/confirm", auth(USER_ROLES.Retailer, USER_ROLES.Wholesaler, USER_ROLES.SUPER_ADMIN), sendOfferController.getAllConfirmOffers)

// get single one
router.get("/confirm/:id", auth(USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), sendOfferController.getSingleConfirmOffer)

//  delete single confirm offers from retailer


// recent update code for retailer update code
router.patch("/update-product/:id", auth(USER_ROLES.Retailer,  USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), sendOfferController.updateOfferFromRetailer);




router.delete("/confirm/:id", auth(USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), sendOfferController.deleteSingleConfirmOffer);

export const offerRoutes = router;