import { Router } from "express";
import { createRestaurant, getMyRestaurant, updateRestaurant } from "../controllers/restaurant.controller";
import { upload } from "../middleware/multer.middleware";
import { validateRestaurantCreate } from "../middleware/validation.middleware";
import { jwtCheck, jwtParse } from "../middleware/jwtCheck.middleware";

const router = Router()

router.post(
    "/", 
    jwtCheck, 
    jwtParse,
    upload.single('imageFile'),
    validateRestaurantCreate,
    createRestaurant
)
router.put(
    "/", 
    jwtCheck,
    jwtParse,
    upload.single('imageFile'),
    validateRestaurantCreate,
    updateRestaurant
)
router.get('/', 
    jwtCheck,
    jwtParse,
    getMyRestaurant
)

export default router  