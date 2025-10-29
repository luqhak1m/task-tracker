import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/mern-test')
  .then(() => {
    console.log("Connected to MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
