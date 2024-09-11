import mongoose from "mongoose";
import {dbName} from '../utils/constants'


const connectToDb = async ()=>{
    try {
        const connectionString = `${process.env.MONGODB_URI}/${dbName}`
        const connectionInstance = await mongoose.connect(connectionString)
        console.log("mongodb has connected successfully", {
            host: connectionInstance.connection.host,
            port: connectionInstance.connection.port,
            dbName: connectionInstance.connection.name
        })
    } catch (error) {
        console.log("mongodb connection has failed")
        process.exit(1)
    }
}

export default connectToDb