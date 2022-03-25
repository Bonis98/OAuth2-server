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
      type: [String],
      required: true,
      enum: ['authorization_code', 'refresh_token']
    }, // Array of grants that the client can use (ie, `authorization_code`)
    redirectUris:{
      type: [String],
      required: true
    } , // Array of urls the client is allowed to redirect to
});

mongoose.model('client', clientSchema);