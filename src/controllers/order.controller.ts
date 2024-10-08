import { Request, Response } from "express";
import asynHandler from "../utils/asynHandler";
import { MenuItemType, Restaurant, RestaurantType } from "../models/restaurant.model";
import { ForbiddenError, NotFoundError } from "../utils/customErrors";
import Stripe from "stripe";
import { statusCodes } from "../utils/constants";
import { ApiResponse } from "../utils/ApiResponse";
import { Order } from "../models/order.model";
import mongoose from "mongoose";

const STRIPE=process.env.STRIPE_API_KEY as string
const FRONTEND_URL = process.env.FRONTEND_URL as string
const stripe = new Stripe(STRIPE)
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string
type CheckoutSessionRequest = {
    cartItems: {
        menuItemId: string,
        name: string,
        quantity: number
    }[]
    deliveryDetails: {
        email: string,
        name: string,
        addressLine1: string,
        city: string
    },
    restaurantId: string
}

const createCheckoutSession = asynHandler(async(req:Request, res:Response)=>{
    const checkoutSessionRequest:CheckoutSessionRequest = req.body
    
    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId) as RestaurantType
    if (!restaurant){
        throw new NotFoundError(`Restaurant with id ${checkoutSessionRequest.restaurantId} not found`)
    }
    const order = new Order({
        restaurant: restaurant._id,
        user: req.userId,
        deliveryDetails: checkoutSessionRequest.deliveryDetails,
        cartItems: checkoutSessionRequest.cartItems,
        status: "placed" 
    })
    const session = await createSession(checkoutSessionRequest, restaurant, order._id.toString())
    if (!session.url){
        throw new Error("Error creating stripe session")
    }
    await order.save()
    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,
        {url: session.url},
        "session is created"
    ))
}) 

const createLineItems = (
    checkoutSessionRequestion: CheckoutSessionRequest,
    menuItems: MenuItemType[]
):Stripe.Checkout.SessionCreateParams.LineItem[] =>{
    const lineItems = checkoutSessionRequestion.cartItems.map(cartItem =>{
         const menuItem = menuItems.find(item=> item.name=== cartItem.name)
         if (!menuItem){
            throw new Error("Menu item not found")
         }
         const lineItem = {
            price_data: {
              currency: 'usd',
              unit_amount: menuItem.price * 100, // Amount in cents
              product_data: {
                name: menuItem.name,
              },
            },
            quantity: cartItem.quantity,
          }
         return lineItem
    })
    return lineItems
}

const createSession = async(
    checkoutSessionRequest:CheckoutSessionRequest,
    restaurant: RestaurantType,
    orderId: string
)=>{
    const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItem)
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ['card'],
        mode: 'payment',
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Normal Delivery",
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: restaurant.deliveryPrice * 100,
                        currency: 'usd'
                    }

                }
            }
        ],
        metadata: {
            orderId,
            restaurantId: restaurant._id.toString()
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/restaurants/${restaurant._id}?cancelled=true`
    })
    return session
}

const stripeEventHandler = asynHandler(async(req: Request, res:Response)=>{
    const sig = req.headers['stripe-signature']

    let event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        STRIPE_WEBHOOK_SECRET
    )
    if (event.type === 'checkout.session.completed'){
        const order = await Order.findById(event.data.object.metadata?.orderId)
        if (!order){
            throw new NotFoundError(`Order with id ${event.data.object.metadata?.orderId} is not found`)
        }
        order.totalAmount = event.data.object.amount_total
        order.status = "paid"
        await order.save()
    }
    res.status(statusCodes.OK).
    json(new ApiResponse(
        statusCodes.OK,
        {},
        "an event is captured"
    ))
})

type MatchObject = {
    user: mongoose.Types.ObjectId,
    status?: string
    createdAt?: {$gte?: Date, $lte?: Date}
}
const getTodayRange = ()=>{
    const startDay = new Date()
    startDay.setHours(0, 0, 0, 0)
    const endDay = new Date()
    endDay.setHours(23, 59, 59,999)
    return {startDay, endDay}
}
const getMyOrders = asynHandler(async(req, res)=>{
    const {category} = req.query
    const {startDay, endDay} = getTodayRange()
    const matchObject:MatchObject = {
        user: new mongoose.Types.ObjectId(req.userId)
    }
    if (category === 'present'){
        
        matchObject.createdAt = {$gte: startDay, $lte: endDay}
    }
    if (category === 'past'){
        
        matchObject.createdAt = {$lte: startDay}
    }
    
    const orders = await Order.aggregate(
        [
            {
              $match: matchObject
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
              }
            },
            {
              $lookup: {
                from: "restaurants",
                localField: "restaurant",
                foreignField: '_id',
                as: "restaurantDetails"
              }
            },
            {
              $unwind: {
                path: "$userInfo"
              }
            },
            {
              $unwind: {
                path: "$restaurantDetails"
              }
            },
            {$sort: {createdAt: 1}}
          ]
    )
    
    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,
        orders,
        "Orders are fetched successfully"
    ))
})

const updateOrderStatus = asynHandler(async(req:Request, res:Response)=>{
    const {orderId} = req.params
    const {status} = req.body
    
    const restaurant = await Restaurant.findOne({user: req.userId})
    if (!restaurant){
        throw new ForbiddenError("User is not allowed to change order status")
    }
    const order = await Order.findByIdAndUpdate(
        orderId,
        {$set:{status: status}}
    )
    if (!order){
        throw new NotFoundError(`Order with id ${orderId} is not found`)
    }
    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,  
        order,
        "order status is cha nged successfully"
    ))

})
 
export {
    createCheckoutSession,
    stripeEventHandler,
    getMyOrders,
    updateOrderStatus
}