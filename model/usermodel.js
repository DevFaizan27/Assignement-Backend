import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    avatar: 
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
    domain: { type: String, required: true },
    available: { type: Boolean, default: false }
})

export const UserModel=mongoose.model('user',userSchema)