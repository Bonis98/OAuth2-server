const mongoose = require('mongoose');
require('./utilities/DB/client');
const crypto = require('crypto');
const promise = require('promise');
const config = require('./config.json');

mongoose.connect(config.connectString);

module.exports = {
  /**
   * Register a new client in the DB
   * 
   * @param {array} grantType type of grants supported by the client
   * @param {array} redirect uris of the client
   */ 
  registerClient: async function(grantType, redirect){
    //Generate new client
    const newClient = new mongoose.model('client')({
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
   * @param {string} clientSecret Used to authenticate the client (can be null if no authentication is required)
   */
  getClient: async function(clientId, clientSecret){
    //Prepare the model
    const client = new mongoose.model('client');
    try{
      //Query the DB
      const clientRetrived = await client.findOne({clientId: clientId}).exec();
      //If client secret is invalid, return false
      if (clientSecret && clientRetrived.clientSecret != clientSecret) return false;
      //Return client details
      return {
        id: clientRetrived.clientId,
        redirectUris: client.redirectUris,
        grants: clientRetrived.grants 
      }
    }
    catch(ex){
      //Exception is printed because is not handled by the library
      console.error(ex);
    }
  },

  saveAuthorizationCode: function(code, client, user){
    return new promise('saveAuthorizationCode');
  },

  getAccessToken: function(accessToken){
    return new promise('getAccessToken');
  }
}