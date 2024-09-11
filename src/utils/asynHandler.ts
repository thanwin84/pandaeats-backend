import { Request, Response,NextFunction } from "express"

type Controller = (req: Request, res: Response)=> Promise<void>

export default function asynHandler(controller: Controller){
    return async(req:Request, res:Response, next:NextFunction)=>{
        try {
            await controller(req,res)
        }catch(error){
            next(error)
        }
    }
}