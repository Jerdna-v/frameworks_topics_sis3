const express = require('express')
const session = require('express-session')
const cors=require("cors")


require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//Some configurations
app.use(express.urlencoded({extended : true}));
app.use(cors({
 methods:["GET", "POST"],
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const novice = require('./routes/novice')
const users = require('./routes/users')

app.use('/novice', novice)
app.use('/users', users)

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
