import { Request, Response } from "express";
import asynHandler from "../utils/asynHandler";
import { Restaurant } from "../models/restaurant.model";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors";
import { deleteAsset, uploadOnCloudinary } from "../utils/clounidary";
import { restaurant, statusCodes } from "../utils/constants";
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
    
    const localFilePath = req?.file?.path
    if (localFilePath){
        await deleteAsset(publicId)
    }
    
    const uploadResponse = localFilePath ? await uploadOnCloudinary(localFilePath):null
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

const searchRestaurant = asynHandler(async (req: Request, res:Response)=>{
    const city = req.params.city
    const cuisines = req.query.selectedCuisines
    const searchQuery = req.query.searchQuery as string || ""
    const selectedCuisines = Array.isArray(cuisines) ? cuisines: cuisines ? [cuisines as string]: []
    const limit = Number(req.query.limit) || 10
    const page = Number(req.query.page) || 1
    const sortOption = req.query.sortOption as string || "updatedAt"
    const sortKey = {[sortOption]: 1} as const

    const skips = (Number(page) - 1) * Number(limit)
    const queryObject:any = {}
    queryObject['city'] = {$regex: city, $options: "i"}
    

    const cityExists = await Restaurant.countDocuments(queryObject)
    if (cityExists === 0){
        res.status(statusCodes.OK)
        .json(new ApiResponse(
            statusCodes.OK,
            {
                data: [],
                pagination: {
                    total: 0,
                    page: 0,
                    pages: 0
                }
            }
        ))
        return
    }
    if (selectedCuisines.length !== 0){
        queryObject.cuisines = {$all: selectedCuisines}
    }
    if (searchQuery){
        queryObject.$or = [
            {restaurantName: {$regex: searchQuery, $options: 'i'}},
            {cuisines: {$in: [searchQuery]}}
        ]
    }
    const aggregationPipeline = [
        {
            $match: queryObject
        },
        {
            $sort: sortKey
        },
        {
            $skip: skips
        },
        {
            $limit: limit
        }
    ]
    
    const matchedRestaurants = await Restaurant.aggregate(aggregationPipeline)
    const totalMatchedRestaurantsCount = await Restaurant.countDocuments(queryObject)
    const pages = Math.ceil(totalMatchedRestaurantsCount / limit)
    res.status(statusCodes.OK)
        .json(new ApiResponse(
            statusCodes.OK,
            {
                data: matchedRestaurants,
                pagination: {
                    total: totalMatchedRestaurantsCount,
                    page,
                    pages
                }
            }
        ))

})
export {
    createRestaurant,
    getMyRestaurant,
    updateRestaurant,
    searchRestaurant
}