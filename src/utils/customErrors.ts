import { statusCodes } from "./constants";

export class NotFoundError extends Error{
    name: string
    statusCode: number
    constructor(message:string){
        super(message)
        this.name = "Not found error"
        this.statusCode = statusCodes.NOT_FOUND
    }
}
export class BadRequestError extends Error{
    name: string
    statusCode: number
    constructor(message:string){
        super(message)
        this.name = "BadRequestError"
        this.statusCode = statusCodes.BAD_REQUEST
    }
}
export class UnauthencatedError extends Error{
    name: string
    statusCode: number
    constructor(message:string){
        super(message)
        this.name = "UnauthenticatedError"
        this.statusCode = statusCodes.UNAUTHORIZED
    }
}
export class ForbiddenError extends Error{
    name: string
    statusCode: number
    constructor(message:string){
        super(message)
        this.name = "forbiddenError"
        this.statusCode = statusCodes.FORBIDDEN
    }
}