import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
    domain:{
        type: String,
        required: true,
    },
    available:{
        type: Boolean,
        required: true,
    },
  users: [ ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export const TeamModel=mongoose.model('team',teamSchema)
