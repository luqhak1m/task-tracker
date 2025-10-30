// import mongoose from "mongoose";

// mongoose.connect('mongodb://127.0.0.1:27017/mern-test')
//   .then(() => {
//     console.log("Connected to MongoDB!");
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error("Connection failed:", err);
//     process.exit(1);
//   });

import bcrypt from 'bcryptjs';

const hash = '$2b$10$fOWtqmGHA/D9nmzw8azooOLkdSHQTArWopAeMoEudANbuUc1qpA5C';
const plaintext = 'owner1';

bcrypt.compare(plaintext, hash).then(console.log);

