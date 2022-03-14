const mongoose = require('mongoose');
const crypto = require('crypto');
const promise = require('promise');
const config = require('./config.json');

mongoose.connect(config.connectString);

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
      enum: ['authcode']
    }, // Array of grants that the client can use (ie, `authorization_code`)
    redirectUris:{
      type: [String],
      required: true
    } , // Array of urls the client is allowed to redirect to
});

module.exports = {
  /**
   * Register a new client in the DB
   * 
   * @param {string} grantType type of grant supported by the client
   * @param {array} redirect uris of the client
   */ 
  registerClient: async function(grantType, redirect){
    const client = mongoose.model('client', clientSchema);
    //Generate new client
    const newClient = new client({
      clientId: crypto.randomBytes(5).toString('hex'),
      clientSecret: crypto.randomBytes(20).toString('hex'),
      grants: grantType,
      redirectUris: redirect
    });
    let unique;
    do{
      unique = true;
      try{
        let status = await newClient.save();
        return status;
      }
      catch(ex){
        //If client ID is not unique generate a new id
        if (ex.code == 11000) {
          unique = false;
          newClient.clientId=crypto.randomBytes(5).toString('hex');
        }
        //Any other error
        else throw ex;
      }
    }
    while(!unique);
  },

  getClient: function(clientId, clientSecret){
    return new promise('getClient');
  },

  saveAuthorizationCode: function(code, client, user){
    return new promise('saveAuthorizationCode');
  },

    getAccessToken: function(accessToken){
    return new promise('getAccessToken');
  }
}