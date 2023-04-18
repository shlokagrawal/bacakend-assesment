require('dotenv').config()
const mongoose = require('mongoose');

// Database Initialization
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.DATABASE);
    console.log("Database Connected Successfully!");
}

// User Schema
const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    phoneno: Number,
    image: String
});

module.exports = mongoose.model("User", userSchema);