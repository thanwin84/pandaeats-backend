import { NextFunction, Request, RequestHandler, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { BadRequestError } from "../utils/customErrors";

type ValidationMiddleware = ValidationChain | ValidationChain[]

const withValidationError = (validateValues: ValidationMiddleware)=>{
    return [
        validateValues,
        (req: Request, res: Response, next: NextFunction)=>{
            const errors = validationResult(req)
            if (!errors.isEmpty()){
                const message = errors.array().map(error=>error.msg).join(",")
                throw new BadRequestError(message)
            }
            next()
        }
    ] as RequestHandler[]
}

export const validateUserCreateInput = withValidationError(
    [
        body('auth0Id').notEmpty().withMessage("auth0Id is missing"),
        body('email').notEmpty().withMessage("email is missing").isEmail().withMessage("Email must be valid")
    ]
)

export const validateUserProfileUpdateInput = withValidationError(
    [
        body('name').notEmpty().withMessage("Name is required"),
        body('addressLine1').notEmpty().withMessage("AddressLine1 is required"),
        body('city').notEmpty().withMessage("city is required"),
        body('country').notEmpty().withMessage("country is missing"),
    ]
)