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
      type: [String],
      required: true,
      enum: ['authorization_code']
    }, // Array of grants that the client can use (ie, `authorization_code`)
    redirectUris:{
      type: [String],
      required: true
    } , // Array of urls the client is allowed to redirect to
});

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
    }, // Password of the user;
    name:{
      type: String,
      required: true
    }, // Name of the user
});

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
    }, //Expiration of the token
    redirectUri:{
      type: String,
      required: true
    }, //Uri where to redirect after authorization
    clientId:[{ type: Schema.Types.ObjectId, ref: 'client' }], //References client(id)
    userId:[{ type: Schema.Types.ObjectId, ref: 'user' }] //References user(id)
});

module.exports = {
  /**
   * Register a new client in the DB
   * 
   * @param {array} grantType type of grants supported by the client
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

  /**
   * Retrive a client in the DB
   * 
   * @param {string} clientId Id of the client 
   * @param {string} clientSecret Used to authenticate the client
   */
  getClient: async function(clientId, clientSecret){
    //Prepare the model
    const client = mongoose.model('client', clientSchema);
    try{
      //Query the DB
      const clientRetrived = await client.findOne({clientId: clientId}).exec();
      //If client secret is invalid, return false, otherwise return client details
      return clientRetrived.clientSecret != clientSecret ? false :{
        id: clientRetrived.clientId,
        redirectUris: client.redirectUris,
        grants: clientRetrived.grants 
      }
    }
    catch(ex){
      //Exception is printed because is not handled by the library
      console.err(ex);
    }
  },

  saveAuthorizationCode: function(code, client, user){
    return new promise('saveAuthorizationCode');
  },

  getAccessToken: function(accessToken){
    return new promise('getAccessToken');
  }
}