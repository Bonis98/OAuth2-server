const mongoose = require('mongoose');


const clientSchema = new mongoose.Schema({
    clientId:{
      type: String,
      unique: true,
      required: true,
      lowercase: true
    }, // Unique string representing the client
    clientSecret: String, // Secret of the client; Can be null
    grants:{
      type: String,
      required: true,
      enum: ['auth_code', 'password']
    }, // Array of grants that the client can use (ie, `authorization_code`)
    redirectUris:{
      type: [String],
      required: true
    } , // Array of urls the client is allowed to redirect to
});