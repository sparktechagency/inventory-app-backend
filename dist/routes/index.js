"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_routes_1 = require("../app/modules/user/user.routes");
const order_routes_1 = require("../app/modules/Order/order.routes");
const wholesaler_routes_1 = require("../app/modules/wholesaler & Retailer/wholesaler.routes");
const offer_routes_1 = require("../app/modules/offer/offer.routes");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/product",
        route: order_routes_1.productRoutes
    },
    {
        path: "/",
        route: wholesaler_routes_1.wholeSalerRoutes
    },
    {
        path: "/send-offer",
        route: offer_routes_1.offerRoutes
    },
];
apiRoutes.forEach(route => router.use(route === null || route === void 0 ? void 0 : route.path, route.route));
exports.default = router;
