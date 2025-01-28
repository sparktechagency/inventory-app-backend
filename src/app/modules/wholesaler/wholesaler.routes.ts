import express from 'express';
import { wholesalerController } from './wholesaler.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router()

// get all wholesalers
router.route("/").get(auth(USER_ROLES.Retailer), wholesalerController.getAllWholeSalers);
router.route("/:id").get(wholesalerController.getWholeSalerById);


// 
export const wholeSalerRoutes = router;