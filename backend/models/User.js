import mongoose from "mongoose";

const user_schema=new mongoose.Schema({
    name: String,
    email: String
}, { timestamps: true })

export default mongoose.model('User', user_schema);