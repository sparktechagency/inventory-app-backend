"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("./order.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// Create product route
router.route('/create').post((0, auth_1.default)(user_1.USER_ROLES.Retailer), order_controller_1.productController.createProduct);
// Delete product route
router.route('/delete/:id').delete((0, auth_1.default)(user_1.USER_ROLES.Retailer), order_controller_1.productController.deleteSingleProduct);
// get all products route
router.route("/").get((0, auth_1.default)(user_1.USER_ROLES.Retailer), order_controller_1.productController.getAllProducts);
// update product route
router.route('/update/:id').patch((0, auth_1.default)(user_1.USER_ROLES.Retailer), order_controller_1.productController.updateSingleProduct);
// 
exports.productRoutes = router;
