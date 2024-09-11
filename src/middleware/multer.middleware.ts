import multer from "multer";

const storage = multer.diskStorage({
    destination: function (_req, _file, cb){
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage: storage,
    limits: {
        fileSize:  5 * 1024 * 1024, // 5mb
    }
})