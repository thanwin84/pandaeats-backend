import { Router } from "express";
import { createUser, getUserInformation, updateUser } from "../controllers/user.controller";
import { validateUserCreateInput, validateUserProfileUpdateInput } from "../middleware/validation.middleware";
import { jwtCheck, jwtParse } from "../middleware/jwtCheck.middleware";

const router = Router()

router.route("/")
.get(jwtCheck, jwtParse, getUserInformation)
.post(jwtCheck,validateUserCreateInput,createUser)

router.route('/profile').put(validateUserProfileUpdateInput,jwtCheck, jwtParse,updateUser)


export default router 