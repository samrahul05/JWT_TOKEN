//  package requiring 
const express= require('express')
const app =express()
const mongoose =require('mongoose')
const jwt =require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors =require('cors')
require('dotenv').config()


// MONGODB connection 
mongoose.connect(process.env.DBURL)
.then(()=>{
    console.log("DB is connected");
})
.catch(()=>{
    console.log("DB is not connected");
})


// Modules 
const schema = require('./modules/User')
const Messageschema =require('./modules/message')
const verifyToken = require('./middelware')
 

// middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cors())
app.use(cookieParser());


// server 
app.post('/signup', async(req,res)=>{
    const data = new schema({
        ...req.body,
    })
    const {emailOrphone} =req.body
    const existingUser =await schema.findOne({emailOrphone})
    if(existingUser)
    {
        res.json("Email is Already Existing")
    }
    else
    {
        await data.save()
        .then(()=>{
            // console.log(data);
            res.json('Signup successfully')
        })
        .catch(()=>{
            res.json("Something Worng");
        })
    }
})

app.post('/login', async(req,res)=>{
    const {emailOrphone,password} = req.body
    const User = await schema.findOne({emailOrphone})
    if(!User)
    {
       return   res.json("Invalid Email")
    }
    if(password !== User.password)
    {
        res.json("Invalid Password")
    }
        
    const token = jwt.sign({id: User._id, emailOrphone: User.emailOrphone}, process.env.SECRETKEY, // SECRETKEY is come from .env file 
       {
          expiresIn:'1h' // it tells when then code is expires
       
       });
       res.cookie('jwt', token, { httpOnly: true });
        
          res.json({ success: 'Login successful', token });
    
})

app.post('/postdata',verifyToken, async(req,res)=>{
    const{ message } = req.body;
    if(!message)
    {
        return res.status(400).json({ message: 'Message is required' });
    }
    const userId =req.User.id;
    const newMessage = new Messageschema({ userId, message });

    await newMessage.save();
    res.json({
        message:'Data Posted Successfully', data:newMessage
    })
})

app.get('/getdata', verifyToken, async(req,res)=>{
    const userId =req.User.id;
    const message = await Messageschema.find({userId})
    res.json({ message:'Data retrieved successfully', data: message });
})





// port server 
app.listen(process.env.PORT,()=>{
    console.log("SERVER PORT:",process.env.PORT);
})