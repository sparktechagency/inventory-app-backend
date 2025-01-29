import express from 'express';
import { wholesalerController } from './wholesaler.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router()

// get all wholesalers
router.route("/wholesalers").get(auth(USER_ROLES.Admin, USER_ROLES.Retailer), wholesalerController.getAllWholeSalers);
router.route("/wholesalers/:id").get(wholesalerController.getWholeSalerById);

// get all retailers
router.route("/retailers").get(auth(USER_ROLES.Admin), wholesalerController.getAllRetailers);
router.route("/retailers/:id").put(wholesalerController.updateSingleRetailer);


// 
export const wholeSalerRoutes = router;