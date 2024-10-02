import { Router } from "express";
import { createCheckoutSession, getMyOrders, stripeEventHandler, updateOrderStatus } from "../controllers/order.controller";
import { jwtCheck, jwtParse } from "../middleware/jwtCheck.middleware";
import { getMyRestaurantOrders } from "../controllers/restaurant.controller";

const router = Router()

router.route('/checkout/create-checkout-session').post(
    jwtCheck,
    jwtParse,
    createCheckoutSession
)
router.route('/my-orders').get(jwtCheck, jwtParse, getMyRestaurantOrders)
router.route('/checkout/webhook').post(stripeEventHandler)
router.route('/').get(jwtCheck, jwtParse, getMyOrders)
router.route("/:orderId/update-status").patch(jwtCheck, jwtParse, updateOrderStatus)

export default router 