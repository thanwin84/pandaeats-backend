import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { BadRequestError } from './customErrors'


const uploadOnCloudinary = async (localFilePath:string) => {
    
    
  try {
    if (!localFilePath) return null
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto"
      }
    )
    // file has been uploaded successfully
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    // remove the locally saved temporary file as the upload operation has failed
    fs.unlinkSync(localFilePath)
    throw new BadRequestError("Image upload has failed")
  }
}
const deleteAsset = async(publicId:string)=>{
  try {
    const response = await cloudinary.uploader.destroy(publicId)
    return response
  } catch (error) {
    
    return null
  }
}


export {
  uploadOnCloudinary,
  deleteAsset
}