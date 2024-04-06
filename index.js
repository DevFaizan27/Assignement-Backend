import express from "express";
import 'dotenv/config';
import { connectToMongo } from "./db/db.js";
import cors from 'cors'
import cloudinary from 'cloudinary';
import userRoute from './router/userRoute.js'

const app=express();

app.use(express.json())

//middleware to handle cors policy
app.use(cors());


//cloudinary configuration
cloudinary.v2.config(
    {
    cloud_name:process.env.cloudName,
    api_key:process.env.apiKey,
    api_secret:process.env.apiSecret,
    }
)


//connecting database 
connectToMongo()


// Available routes
app.get('/',(req,res)=>{
    return res.status(200).send("Hello World!");
});

//user routes
app.use('/api/user',userRoute)


app.listen(process.env.PORT,()=>{
    console.log(`App is running on Port ${process.env.PORT}`);
})