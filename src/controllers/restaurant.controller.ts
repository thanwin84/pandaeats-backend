import { Request, Response } from "express";
import asynHandler from "../utils/asynHandler";
import { Restaurant } from "../models/restaurant.model";
import { BadRequestError, ConflictError } from "../utils/customErrors";
import { uploadOnCloudinary } from "../utils/clounidary";
import { statusCodes } from "../utils/constants";
import { ApiResponse } from "../utils/ApiResponse";

const createRestaurant = asynHandler(async(req:Request, res:Response)=>{
    // user can only create one restaurant
    const restaurantExists = await Restaurant.findOne({user: req.userId})
    if (restaurantExists){
        throw new ConflictError(`This restaurant already exist`)
    }
    
    const localFilePath = req?.file?.path
    if (!localFilePath){
        throw new BadRequestError("Image file is missing")
    }
    const uploadResponse = await uploadOnCloudinary(localFilePath)
    const restaurant = await Restaurant.create(
        {
            ...req.body, 
            imageUrl: uploadResponse?.url as string,
            user: req.userId
        })
    res.status(statusCodes.CREATED)
    .json(new ApiResponse(
        statusCodes.CREATED,
        restaurant,
        `Restaurant is created successfully`
    ))
})


export {
    createRestaurant
}