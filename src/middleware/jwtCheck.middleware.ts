import { NextFunction, Request, Response } from 'express'
import {auth, JWTPayload} from 'express-oauth2-jwt-bearer'
import { NotFoundError, UnauthencatedError } from '../utils/customErrors'
import jwt from 'jsonwebtoken'
import User from '../models/user.model'

declare global {
    namespace Express {
        interface Request{
            userId: string,
            auth0Id: string
            
        }
    }
}

export const jwtCheck = auth({
    audience: process.env.AUDIENCE,
    issuerBaseURL: process.env.issuerBaseURL,
    tokenSigningAlg: 'RS256'
})

export const jwtParse = async(req:Request, res: Response, next: NextFunction)=>{
    const {authorization} = req.headers
    if (!authorization || !authorization.startsWith('Bearer')){
        throw new UnauthencatedError("user is not allowed")
    }
    const token = authorization.split(' ')[1]
    try {
        const decoded = jwt.decode(token) as JWTPayload
        const auth0Id = decoded.sub as string
        const user = await User.findOne({auth0Id})
        if (!user){
            throw new NotFoundError(`User with id ${auth0Id} is not found`)
        }
        req.auth0Id = auth0Id
        req.userId = user._id.toString()
        next()
    } catch (error) {
        throw new UnauthencatedError("Not authorized")
    } 

}