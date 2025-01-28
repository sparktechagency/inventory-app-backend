import express from 'express';
import { productController } from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router()
// Create product route
router.route('/create',).post(auth(USER_ROLES.Retailer), productController.createProduct);

// Delete product route
router.route('/delete/:id').delete(auth(USER_ROLES.Retailer), productController.deleteSingleProduct);

// get all products route
router.route("/").get(auth(USER_ROLES.Retailer), productController.getAllProducts);
// update product route
router.route('/update/:id').patch(auth(USER_ROLES.Retailer), productController.updateSingleProduct);


// 
export const productRoutes = router;