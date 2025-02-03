import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.routes';
import { productRoutes } from '../app/modules/Order/order.routes';
import { wholeSalerRoutes } from '../app/modules/wholesaler & Retailer/wholesaler.routes';
import { offerRoutes } from '../app/modules/offer/offer.routes';
import { packageRoutes } from '../app/modules/package/package.routes';
import { paymentRoutes } from '../app/modules/subscription/payment.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: "/product",
    route: productRoutes
  },
  {
    path: "/",
    route: wholeSalerRoutes
  },
  {
    path: "/send-offer",
    route: offerRoutes
  },
  {
    path: '/',
    route: packageRoutes
  },
  {
    path: "/subscription",
    route: paymentRoutes
  }

];

apiRoutes.forEach(route => router.use(route?.path, route.route));

export default router;
