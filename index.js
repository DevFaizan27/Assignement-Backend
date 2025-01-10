import express from "express";
import 'dotenv/config';
import { connectToMongo } from "./db/db.js";
import cors from 'cors'

import orderRoute from './router/orderRoute.js'

const app=express();

app.use(express.json())


//middleware to handle cors policy
app.use(cors());


//connecting database 
connectToMongo()


// Available routes
app.get('/',(req,res)=>{
    return res.status(200).send("Hello World!");
});

app.use('/api',orderRoute)


app.listen(process.env.PORT,()=>{
    console.log(`App is running on Port ${process.env.PORT}`);
})