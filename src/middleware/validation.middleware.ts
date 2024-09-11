import { NextFunction, Request, RequestHandler, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { BadRequestError } from "../utils/customErrors";
import { restaurant } from "../utils/constants";

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

export const validateRestaurantCreate = withValidationError(
    [
        body(restaurant.RESTAURANT_NAME).notEmpty().withMessage(`${restaurant.RESTAURANT_NAME} can not be empty`),
        body(restaurant.COUNTRY).notEmpty().withMessage(`${restaurant.COUNTRY} can not be empty`),
        body(restaurant.CITY).notEmpty().withMessage(`${restaurant.CITY} can not be empty`),
        body(restaurant.DELIVERY_PRICE)
            .isFloat({min: 0})
            .withMessage(`${restaurant.DELIVERY_PRICE} must be a positve`),
        body(restaurant.ESTIMATED_DELIVERY_TIME)
            .isInt({min:0})
            .withMessage(`${restaurant.ESTIMATED_DELIVERY_TIME} must be a positive number`),
        body(restaurant.CUISINES)
            .notEmpty()
            .withMessage(`${restaurant.CUISINES} is required`)
            .isArray()
            .withMessage(`${restaurant.CUISINES} must be an array`)
            .not()
            .isEmpty()
            .withMessage(`${restaurant.CUISINES} can not be empty aaray`),
        body(restaurant.MENU_ITEM).isArray().withMessage(`${restaurant.MENU_ITEM} must be an array`),
        body(`${restaurant.MENU_ITEM}.*.name`).notEmpty().withMessage('Menu  is required'),
        body(`${restaurant.MENU_ITEM}.*.price`)
            .isFloat({min: 0})
            .withMessage('menu item price  is required and must be a positive number')
    ]
)