const express = require('express')
const app = express()
const Router = require('express').Router;
const port = 3000
const cors = require('cors')
const mongoose = require('mongoose')
const verifyUser = require('./routes/auth')
// Route Middleware
const authRoute = require('./routes/auth')
//Middelware
app.use(cors())

//
app.options('*', cors())
app.use(express.json())
// Control
app.use('/api/users', authRoute);

//DB Connecy
mongoose.connect('',{ useNewUrlParser: true }, () => {
  console.log('connected to mongo-db!')
})


app.listen(port, () => console.log('Server up and running.'))
