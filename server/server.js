const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const PORT = 9093

const app = express()
const server = require('http').Server(app)

const router = require('./router')

app.use(cookieParser())
app.use(bodyParser.json())
app.use('/match',router)  
server.listen(PORT,function(){
    console.log('node app start at port '+PORT)
})