const express = require('express')
const session = require('express-session')
const cors=require("cors")
const cookieParser = require("cookie-parser");


require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cookieParser());

// Configuration if we had cross origin enabled.
// let sess = {
//     secret: 'our litle secret',
//     resave: false,
//     proxy: true,
//     saveUninitialized: true,
//     cookie: {
//         secure: true,
//         sameSite: 'none'
//     }
// }

let sess = {
    secret: 'our litle secrett',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}
// let sess = {
//     secret: 'our litle secret',
//     saveUninitialized: true,
//     resave: false,
//     proxy: true,
//     name:"app",
//     cookie: {
//         httpOnly: true,
//     }
// }

app.use(session(sess))

//Some configurations
app.use(express.urlencoded({extended : true}));
app.use(cors({
 methods:["GET", "POST"],
  credentials: true, 
  origin: ['http://localhost:3000','http://localhost:3001']
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const novice = require('./routes/novice')
const users = require('./routes/users')

app.use('/novice', novice)
app.use('/users', users)

const path = require('path')
app.use(express.static(path.join(__dirname, "build")))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html")) 
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
