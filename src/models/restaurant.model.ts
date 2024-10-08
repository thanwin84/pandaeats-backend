import mongoose, { InferSchemaType, ObjectId } from "mongoose";
import { cuisineList } from "../constants/cuisineList";

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        default: ()=> new mongoose.Types.ObjectId()
    }
})

export type MenuItemType = InferSchemaType<typeof menuItemSchema>

const restaurantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurantName: {
        type: String,
        required: true,
        lowercase: true
    },
    city: {
        type: String,
        required: true,
        lowercase:true
    },
    country: {
        type: String,
        required: true,
        lowercase: true
    },
    deliveryPrice: {
        type: Number,
        required: true,
        min: 0
    },
    estimatedDeliveryTime: {
        type: Number,
        required: true,
        min: 0
    },
    cuisines: [{type:String, required: true, lowercase: true, enum: cuisineList}],
    menuItem: [menuItemSchema],
    imageUrl: {
        url: {
            type: String,
            required: true
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

export type RestaurantType = InferSchemaType<typeof restaurantSchema> &{_id: ObjectId}

export  const Restaurant = mongoose.model("Restaurant", restaurantSchema)