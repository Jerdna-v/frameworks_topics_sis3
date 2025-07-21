const express = require("express")
const users = express.Router();
const DB = require('../db/dbConn.js')

users.post('/login', async (req, res, next) => {
    try {
        console.log(req.body);
        const username = req.body.username;
        const password = req.body.password;
        if (username && password) {
            const queryResult = await DB.AuthUser(username)
            console.log(queryResult[0])
            if (queryResult.length > 0) {
                if (password === queryResult[0].password) {
                    req.session.user = queryResult
                    req.session.logged_in = true
                    res.statusCode = 200;
                    res.json({ user: queryResult[0], status: { success: true, msg: "Logged in" } })
                } else {
                    res.statusCode = 200;
                    res.json({ user: null, status: { success: false, msg: "Username or password incorrect" } })
                    console.log("INCORRECT PASSWORD")
                }
            } else {
                res.statusCode = 200;
                res.send({ user: null, status: { success: false, msg: "Username not registsred" } })
            }
        }
        else {
            res.statusCode = 200;
            res.send({ logged: false, user: null, status: { success: false, msg: "Input element missing" } })
            console.log("Please enter Username and Password!")
        }
        res.end();
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
});

users.get('/session', async (req, res, next) => {
    try {
        res.json(req.session)
    } catch (error) {
        res.sendStatus(500)
    }
})

users.post('/register', async (req, res, next) => {
    try {
        const { username, password, name, phone } = req.body;
        console.log(username)
        console.log(password)
        console.log(name)
        console.log(phone)
          const existingUser = await DB.AuthUser(username);
          if (existingUser.length > 0) {
            res.statusCode = 409;
              res.send({ status: { success: false, msg: "Username already exists!" } });
              return;
          }   
          const existingNumber = await DB.AuthNumber(phone);
          if (existingNumber.length > 0) {
            res.statusCode = 409;
            res.send({ status: { success: false, msg: "Phone number already exists!" } });
              return;
          } 
            const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const queryResult = await DB.addUser(username, password, name, phone, currentDateTime);
            
            if (queryResult.affectedRows) {
                res.statusCode = 200;
                res.send({ status: { success: true, msg: "New user created" } });
                console.log("New user added!!");
            } else {
                res.statusCode = 500;
                res.send({ status: { success: false, msg: "Failed to add user" } });
            }

        res.end();
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.send({ status: { success: false, msg: err.message } });
        next();
    }
});
module.exports = users
