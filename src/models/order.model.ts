import mongoose from "mongoose";
import { orderStatus } from "../utils/constants";

const orderSchema = new mongoose.Schema({
     restaurant: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deliveryDetails: {
        email:{type: String, required: true},
        name: {type: String, required: true},
        addressLine1: {type: String, required: true},
        city: {type: String, required: true}
    },
    cartItems: [
        {
            menuItemId: {type: String, required: true},
            quantity: {type: Number, required: true},
            name: {type: String, required: true}
        }
    ],
    totalAmount: Number,
    status: {
        type: String,
        enum: orderStatus
    }
},{timestamps: true})

export const Order = mongoose.model("Order", orderSchema)

