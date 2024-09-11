import express, { Request, Response } from 'express'
import cors from 'cors'
import "dotenv/config"
import connectToDb from './db'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cors())

  
app.get("/health", async(req:Request, res: Response)=>{
    res.send({message: "health OK"})
})
// route import
import UserRoute from './routes/user.route'
import errorHandler from './middleware/errorHandler.middleware'

// route declaration
app.use("/api/v1/users", UserRoute)

app.use(errorHandler)

connectToDb()
.then(()=>{
    app.listen(3000, ()=>{
        console.log("listening on port 3000")
    })
}).catch(error => console.log(error))