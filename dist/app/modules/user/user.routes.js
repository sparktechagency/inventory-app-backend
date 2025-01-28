"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router
    .route('/profile')
    .get(
// auth(USER_ROLES.ADMIN, USER_ROLES.USER),
user_controller_1.UserController.getUserProfile)
    .patch(
// auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.Retailer, USER_ROLES.USER),
(0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = user_validation_1.UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
    }
    return user_controller_1.UserController.updateProfile(req, res, next);
});
router
    .route('/')
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser);
exports.UserRoutes = router;
