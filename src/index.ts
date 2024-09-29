import express, { Request, Response } from 'express'
import cors from 'cors'
import "dotenv/config"
import connectToDb from './db'
import { v2 as cloudinary } from 'cloudinary'
import errorHandler from './middleware/errorHandler.middleware'

const app = express()
app.use("/api/v1/orders/checkout/webhook", express.raw({type: 'application/json'}))
app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cors())  

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  
app.get("/health", async(req:Request, res: Response)=>{
    res.send({message: "health OK"})
})
// route import
import UserRoute from './routes/user.route'
import restaurantRouter from './routes/restaurant.route'
import orderRouter from './routes/order.route'

// route declaration
app.use("/api/v1/users", UserRoute)
app.use("/api/v1/restaurants", restaurantRouter)
app.use('/api/v1/orders', orderRouter)

// error handling
app.use(errorHandler)

connectToDb()
.then(()=>{
    app.listen(3000, ()=>{
        console.log("listening on port 3000")
    })
}).catch(error => console.log(error))