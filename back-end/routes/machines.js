
const express = require("express")
const machines = express.Router();
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
machines.get('/', async (req, res, next) => {
    try {
        const queryResult = await DB.getAllMachines();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

//Gets one new based on the id 
machines.get('/:id', async (req, res, next) => {
    try {
        const queryResult = await DB.oneMachine(req.params.id);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})

machines.post('/', upload_dest.single('file'), async (req, res, next) => {   
    if (!req.session.logged_in) {
        res.json({
            success: false,
            msg: "Can not add news. You need to log-in!"
        })
        return
    }
    try {
        const { mid, name, type, location, startDate } = req.body;
        let file = ""
        if(req.file != null)
            file = req.file.filename

        const isCompleteMachine = name && type && (location || req.body.store);
        if (isAcompleteNovica) {
            const queryResult = await DB.addMachine(mid, name, type, location || "Store", startDate);
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
machines.put("/:id", async (req, res, next) => {
    if (!req.session.logged_in) {
      res.json({
        success: false,
        msg: "Cannot update machine. You need to log-in!",
      });
      return;
    }
    try {
      const { mid, name, type, location, startDate } = req.body;
      const isCompleteUpdate = (mid || req.params.id) && name && type && (location || req.body.store);
      if (isCompleteUpdate) {
        const machineId = mid || req.params.id; 
        const queryResult = await DB.updateMachine(machineId, name, type, location || "Store", startDate);
        if (queryResult.affectedRows) {
          console.log("Machine updated successfully!");
          res.statusCode = 200;
          res.send({
            success: true,
            msg: "Machine updated successfully",
          });
        }
      } else {
        console.log("A field is empty!");
        res.statusCode = 200;
        res.send({ success: false, msg: "Input item missing" });
      }
      res.end();
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
      next();
    }
  });
  
  machines.delete("/:id", async (req, res, next) => {
    if (!req.session.logged_in) {
      res.json({
        success: false,
        msg: "Cannot delete machine. You need to log-in!",
      });
      return;
    }
    try {
      const queryResult = await DB.deleteMachine(req.params.id);
      if (queryResult.affectedRows) {
        console.log("Machine deleted successfully!");
        res.statusCode = 200;
        res.send({
          success: true,
          msg: "Machine deleted successfully",
        });
      } else {
        res.statusCode = 404;
        res.send({ success: false, msg: "Machine not found" });
      }
      res.end();
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
      next();
    }
  });
module.exports = machines