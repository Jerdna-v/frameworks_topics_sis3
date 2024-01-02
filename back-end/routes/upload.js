const multer = require('multer');
const express = require("express")
const upload = express.Router();
const DB = require('../db/dbConn.js')


const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
  })
  
let upload_dest = multer({ dest: 'uploads/' })

upload.post('/', upload_dest.single('file'), async (req, res, next) => {
    const file = req.file;
    console.log(file.filename);
    if (!file) {
      res.send({ status: { success: false, msg: "Could not uplpad" }});
    }else{
      res.send({ status: { success: true, msg: "File upladed" }});
    }   
})

module.exports = upload

