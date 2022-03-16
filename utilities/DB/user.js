const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the user
    passwordHash:{
      type: String,
      required: true
    }, // Hash password of the user;
    name:{
      type: String,
      required: true
    }, // Name of the user
});

mongoose.model('user', userSchema);