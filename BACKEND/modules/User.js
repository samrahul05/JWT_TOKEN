
// for validation 

const mongoose = require('mongoose')

const user = new mongoose.Schema({
    name:String,
    emailOrphone:String,
    password:String,
})


module.exports=mongoose.model('User_data',user)