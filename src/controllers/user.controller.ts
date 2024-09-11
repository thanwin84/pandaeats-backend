import asynHandler from "../utils/asynHandler";
import User from "../models/user.model";
import { Request, Response } from "express";
import {statusCodes} from "../utils/constants"
import { ApiResponse } from "../utils/ApiResponse";
import { NotFoundError } from "../utils/customErrors";

const createUser = asynHandler(async(req: Request, res: Response)=>{
    
    const {email, auth0Id} = req.body
    const userExists = await User.findOne({$or: [{email:email}, {auth0Id:auth0Id}]})
    if (userExists){
        res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, {}, "user already exists"))
        return
    }
    const newUser = await User.create(req.body)
    res
    .status(statusCodes.CREATED)
    .json(new ApiResponse(
        statusCodes.CREATED,
        newUser.toObject(),
        "user is created successfully"
    ))
})

const updateUser = asynHandler(async (req:Request, res: Response)=>{
     const {name, addressLine1, country, city} = req.body
     const user = await User.findById(req.userId)
     if (!user){
        throw new NotFoundError("User does not exist")
     }
     user.name = name
     user.addressLine1 = addressLine1
     user.city = city
     user.country = country
     await user.save()
     res.status(statusCodes.OK)
     .json(new ApiResponse(
        statusCodes.OK,  
        {},
        "User has been updated"
     ))
})

const getUserInformation = asynHandler(async (req:Request, res:Response)=>{
    const userId = req.userId
    const user = await User.findById(userId)
    if (!user){
        throw new NotFoundError('User is not found!')
    }
    res.status(statusCodes.OK)
    .json(new ApiResponse(
        statusCodes.OK,
        user,
        "User information is fetched successfully"
    ))
})
export {
    createUser,
    updateUser,
    getUserInformation
}