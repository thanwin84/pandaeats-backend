import { statusCodes } from "../utils/constants"
import { Request, Response, NextFunction } from "express"
interface CustomError extends Error {
    
    statusCode?: number
}
const errorHandler = (err:CustomError, req:Request, res:Response, next:NextFunction)=>{
    res
    .status(err.statusCode || statusCodes.INTERNAL_SERVER_ERROR)
    .json({
        success: false,
        message: err.message || "Internal server error"
    })
}

export default errorHandler