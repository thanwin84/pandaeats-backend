import { Request, Response } from "express";
import asynHandler from "../utils/asynHandler";
import { Restaurant } from "../models/restaurant.model";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors";
import { deleteAsset, uploadOnCloudinary } from "../utils/clounidary";
import { statusCodes } from "../utils/constants";
import { ApiResponse } from "../utils/ApiResponse";

const getMyRestaurant = asynHandler(async (req, res)=>{
    const restaurant = await Restaurant.findOne({user: req.userId})
    if (!restaurant){
        throw new NotFoundError("Restaurant does not exists")
    }
    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,
        restaurant,
        "restaurant data is fetched successfully"
    ))
})

const createRestaurant = asynHandler(async(req:Request, res:Response)=>{
    // user can only create one restaurant
    const restaurantExists = await Restaurant.findOne({user: req.userId})
    if (restaurantExists){
        throw new ConflictError(`Restaurant already exist`)
    }
    
    const localFilePath = req?.file?.path
    if (!localFilePath){
        throw new BadRequestError("Image file is missing")
    }
    const uploadResponse = await uploadOnCloudinary(localFilePath)
    const restaurant = await Restaurant.create(
        {
            ...req.body, 
            imageUrl: {
                url: uploadResponse?.url,
                publicId:uploadResponse?.public_id
            },
            user: req.userId,
            
        })
    res.status(statusCodes.CREATED)
    .json(new ApiResponse(
        statusCodes.CREATED,
        restaurant,
        `Restaurant is created successfully`
    ))
})

const updateRestaurant = asynHandler(async (req:Request, res:Response)=>{
    
    const restaurant = await Restaurant.findOne({user: req.userId})
    if (!restaurant){
        throw new NotFoundError("Restaurant does not exists")
    }
    const publicId = restaurant.imageUrl?.publicId as string
    if (publicId){
        await deleteAsset(publicId)
        
    }
    const localFilePath = req?.file?.path
    
    const uploadResponse = localFilePath ? await uploadOnCloudinary(localFilePath): null
    const imageUrl = {
       url: "",
       publicId: ""
    }
    if (uploadResponse){
        imageUrl.url = uploadResponse.url
        imageUrl.publicId = uploadResponse.public_id

    }
    await Restaurant.updateOne(
        {user: req.userId},
        {$set: {...req.body, imageUrl: imageUrl}}
    )

    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,
        {},
        "Restaurant is updated successfully"
    ))

})


export {
    createRestaurant,
    getMyRestaurant,
    updateRestaurant
}