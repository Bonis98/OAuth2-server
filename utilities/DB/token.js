const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    accessToken:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the token
    accessTokenExpiresAt:{
      type: Date,
      required: true
    }, //Expiration of the token
    refreshToken:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the refresh token
    refreshTokenExpiresAt:{
      type: Date,
      required: true
    }, //Expiration of the token
    refreshTokenRevoked:{
      type: Boolean,
      default: false
    },
    clientId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'client' }], //References client(id)
    userId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }] //References user(id)
});

mongoose.model('token', tokenSchema);