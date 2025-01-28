"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wholeSalerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const wholesaler_controller_1 = require("./wholesaler.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
// get all wholesalers
router.route("/").get((0, auth_1.default)(user_1.USER_ROLES.Retailer), wholesaler_controller_1.wholesalerController.getAllWholeSalers);
router.route("/:id").get(wholesaler_controller_1.wholesalerController.getWholeSalerById);
// 
exports.wholeSalerRoutes = router;
