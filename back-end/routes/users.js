const express= require("express")
const users = express.Router();
const DB=require('../db/dbConn.js')

//Checks if user submited both fields, if user exist and if the combiation of user and password matches
// users.post('/login', async (req, res, next) => {
//    try{
//     const username = req.body.username;
// 	const password = req.body.password;
//     if (username && password) {
//         const queryResult=await DB.AuthUser(username)
//         if(queryResult.length>0){
//             if(password===queryResult[0].user_password){
//                 req.session.user=queryResult
//                 console.log(req.session.user)
//                 console.log(queryResult)
//                 console.log("SESSION VALID")
//             } else{
//                  console.log("INCORRECT PASSWORD")
//                 }
//             } else{
//                 console.log("USER NOT REGISTRED");   
//             }
//         } 
//         else {
//             console.log("Please enter Username and Password!")
//         }
//     res.end();
//    }catch(err){
//         console.log(err)
//         res.sendStatus(500)
//         next()
//    }
// });

users.post('/login', async (req, res, next) => {
    try{
        console.log(req.body);
     const username = req.body.username;
     const password = req.body.password;
     if (username && password){
         const queryResult=await DB.AuthUser(username)        
         if(queryResult.length>0){
             if(password===queryResult[0].user_password){
                 console.log(queryResult)
                 //req.session.user = queryResult
                 //req.session.logged_in = true
                 res.statusCode = 200;
                 res.send({user:queryResult[0], status:{success: true, msg: "Logged in"}})                 
             } else{
                res.statusCode = 200;
                res.send({user: null, status:{success: false, msg: "Username or password incorrect"}})                 
                console.log("INCORRECT PASSWORD")
             }
         } else{
            res.statusCode = 200;
            res.send({user: null, status:{success: false, msg: "Username not registsred"}})                             
         }
     } 
     else {
        res.statusCode = 200;
        res.send({logged:false, user: null, status:{success: false, msg: "Input element missing"}})                 
        console.log("Please enter Username and Password!")
     }
     res.end();
    }catch(err){
     console.log(err)
     res.sendStatus(500)
     next()
    }
  });
  

//Inserts a new user in our database id field are complete
users.post('/register', async (req, res, next) => {
    try{
        const username = req.body.username
        const password = req.body.password
        const email= req.body.email
        if (username && password && email){ 
            const queryResult=await DB.AddUser(username,email,password);
            if (queryResult.affectedRows) {
                res.statusCode = 200;
                res.send({status:{success: true, msg: "New user created"}})                 
                console.log("New user added!!")
            }    
        } 
        else {
            res.statusCode = 200;
            res.send({status:{success: false, msg: "Input element missing"}})                 
            console.log("A field is missing!")
        }
        res.end();
    }catch(err){
        console.log(err)
        res.statusCode = 500;
        res.send({status:{success: false, msg: err}})                 
        
        //res.sendStatus(500)
        next()
    }
    
});

module.exports=users
