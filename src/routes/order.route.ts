import { Router } from "express";
import { createCheckoutSession, stripeEventHandler } from "../controllers/order.controller";
import { jwtCheck, jwtParse } from "../middleware/jwtCheck.middleware";

const router = Router()

router.route('/checkout/create-checkout-session').post(
    createCheckoutSession
)

router.route('/checkout/webhook').post(stripeEventHandler)

export default router 