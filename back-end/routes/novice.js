
const express = require("express")
const novice = express.Router();
const DB = require('../db/dbConn.js')
const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
  })
  
let upload_dest = multer({ dest: 'uploads/' })


//Gets all the news in the DB 
novice.get('/', async (req, res, next) => {
    try {
        const queryResult = await DB.allNovice();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

//Gets one new based on the id 
novice.get('/:id', async (req, res, next) => {
    try {
        const queryResult = await DB.oneNovica(req.params.id)
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

//Inserts one new to the database
novice.post('/', upload_dest.single('file'), async (req, res, next) => {   
    if (!req.session.logged_in) {
        res.json({
            success: false,
            msg: "Can not add news. You need to log-in!"
        })
        return
    }
    try {
        const title = req.body.title
        const slug = req.body.slug
        const text = req.body.text
        let file = ""
        if(req.file != null)
            file = req.file.filename

        const isAcompleteNovica = title && slug && text
        if (isAcompleteNovica) {
            const queryResult = await DB.creteNovica(title, slug, text, file)
            if (queryResult.affectedRows) {
                console.log("New article added!!")
                res.statusCode = 200
                res.send(
{ 
    success: true, 
    msg: "News item added" 
})
            }
        } else {
            console.log("A field is empty!!")
            res.statusCode = 200
            res.send({ success: false, msg: "Input item missing" })
        }
        res.end()

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

module.exports = novice