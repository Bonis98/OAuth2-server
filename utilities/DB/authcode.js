const mongoose = require('mongoose');

const authCodeSchema = new mongoose.Schema({
    authorizationCode:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the auth code
    expiresAt:{
      type: Date,
      required: true
    }, //Expiration of the code
    redirectUri:{
      type: String,
      required: true
    }, //Uri where to redirect after authorization
    used: {
      type: Boolean,
      required: true,
      default: false
    },
    clientId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'client' }], //References client(id)
    userId:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }] //References user(id)
});

mongoose.model('authcode', authCodeSchema);