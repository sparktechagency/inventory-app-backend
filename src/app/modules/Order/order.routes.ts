import express from "express";
import { productController } from "./order.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
const router = express.Router();
// Create product route
router
  .route("/create")
  .post(
    auth(
      USER_ROLES.Retailer,
      USER_ROLES.Wholesaler,
      USER_ROLES.Admin,
      USER_ROLES.SUPER_ADMIN
    ),
    productController.createProduct
  );

// get all products route
router
  .route("/")
  .get(
    auth(
      USER_ROLES.Retailer,
      USER_ROLES.Wholesaler,
      USER_ROLES.Admin,
      USER_ROLES.SUPER_ADMIN
    ),
    productController.getAllProducts
  );

// update product route
router
  .route("/update/:id")
  .patch(
    auth(
      USER_ROLES.Retailer,
      USER_ROLES.Wholesaler,
      USER_ROLES.Admin,
      USER_ROLES.SUPER_ADMIN
    ),
    productController.updateSingleProduct
  );

// Delete product route
router
  .route("/delete/:id")
  .delete(
    auth(
      USER_ROLES.Retailer,
      USER_ROLES.Wholesaler,
      USER_ROLES.Admin,
      USER_ROLES.SUPER_ADMIN
    ),
    productController.deleteSingleProduct
  );

//
export const productRoutes = router;
