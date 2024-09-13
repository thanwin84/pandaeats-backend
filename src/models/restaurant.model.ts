import mongoose from "mongoose";
import User from "./user.model";

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const restaurantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    deliveryPrice: {
        type: Number,
        required: true
    },
    estimatedDeliveryTime: {
        type: Number,
        required: true
    },
    cuisines: [{type:String, required: true}],
    menuItem: [menuItemSchema],
    imageUrl: {
        url: {
            type: String,
            requried: true
        },
        // we need public id to delete resource from cloudinary
        publicId: {
            type: String,
            required: true
        }
    }
}, 
{
    timestamps: true
}
)


export  const Restaurant = mongoose.model("Restaurant", restaurantSchema)