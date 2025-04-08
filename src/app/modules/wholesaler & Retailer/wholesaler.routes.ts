import express from 'express';
import { wholesalerController } from './wholesaler.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router()

// get all wholesalers
router.route("/wholesalers").get(auth(USER_ROLES.Admin, USER_ROLES.Retailer, USER_ROLES.SUPER_ADMIN), wholesalerController.getAllWholeSalers);


// get all retailers
// router.route("/retailers").get(
//     auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
//     wholesalerController.getAllRetailers
// );
router.get("/retailers",
    auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
    wholesalerController.getAllRetailers);

router.get("/retailers/monthly",
    auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
    wholesalerController.getRetailersByMonth);

router.get("/wholesalers/monthly",
    auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN),
    wholesalerController.getWholesalerByMonth);

router.get("/dashboard-statistics",
    auth(USER_ROLES.SUPER_ADMIN),
    wholesalerController.getDashboardStatistics);


router.route("/retailers/:id").put(auth(USER_ROLES.Admin), wholesalerController.updateSingleRetailer);
router.route("/retailers/:id").delete(auth(USER_ROLES.Admin, USER_ROLES.SUPER_ADMIN), wholesalerController.deleteSingleRetailer);
router.route("/wholesalers/:id").get(wholesalerController.getWholeSalerById);
router.route("/wholesalers/:id").patch(auth(USER_ROLES.Admin), wholesalerController.updateSingleWholesaler);


// 
export const wholeSalerRoutes = router;