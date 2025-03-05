import express from 'express';
import { paymentPaystackController } from './PaymentPaystack.controller';

const router = express.Router();
router.post('/create', paymentPaystackController.createPackage);

export const PackageRoutes = router