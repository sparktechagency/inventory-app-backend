import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.routes';
import { productRoutes } from '../app/modules/Order/order.routes';
import { wholeSalerRoutes } from '../app/modules/wholesaler & Retailer/wholesaler.routes';
import { offerRoutes } from '../app/modules/offer/offer.routes';
// import { packageRoutes } from '../app/modules/package/package.routes';
import { paymentRoutes } from '../app/modules/subscription/payment.routes';
import { PackageRoutes } from '../app/modules/PaymentPaystack/PaymentPaystack.routes';
import { TransactionRoutes } from '../app/modules/Transaction/ITransaction.routes';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { flutterWaveRouter } from '../app/modules/flutterwavePackage/flutterwavePackage.route';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { multiPaymentMethodRoutes } from '../app/modules/multiPaymentMethod/multiPaymentMethod.routes';
import { sendOfferRoutes } from '../app/modules/sendOrder/sendOffer.route';
import { productSendRoutes } from '../app/modules/productSend/productSend.routes';
import { replayFromWholesalerRoutes } from '../app/modules/replayFromWholesaler/replayFromWholesaler.routes';
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
    path: '/notification',
    route: NotificationRoutes
  },
  {
    path: "/subscription",
    route: paymentRoutes
  },
  {
    path: "/package",
    route: PackageRoutes
  },
  {
    path: "/transaction",
    route: TransactionRoutes
  },
  {
    path: "/flutter-wave-package",
    route: flutterWaveRouter
  },
  {
    path: "/admin",
    route: AdminRoutes
  },
  {
    path: "/",
    route: multiPaymentMethodRoutes
  },
  // new version
  // create order
  {
    path: "/new-order",
    route: sendOfferRoutes
  },
  {
    path: "/products",
    route: productSendRoutes
  },
  {
    path: "/replay",
    route: replayFromWholesalerRoutes
  }


];

apiRoutes.forEach(route => router.use(route?.path, route.route));

export default router;
