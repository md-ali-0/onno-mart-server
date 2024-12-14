import express from "express";
import { PaymentController } from "./payment.controller";
const router = express.Router();

router.post("/create-payment", PaymentController.create);
router.post("/payment-success", PaymentController.paymentSuccess);
router.post("/payment-fail", PaymentController.paymentFail);
router.post("/payment-cancel", PaymentController.paymentCancel);

export const PaymentRoutes = router;
