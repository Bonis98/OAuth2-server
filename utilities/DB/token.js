const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    accessToken:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the auth code
    accessTokenExpiresAt:{
      type: Date,
      required: true
    }, //Expiration of the token
    clientId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'client' }], //References client(id)
    userId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }] //References user(id)
});

mongoose.model('token', tokenSchema);