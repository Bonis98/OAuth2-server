const mongoose = require('mongoose');
require('./utilities/DB/client');
const crypto = require('crypto');
const promise = require('promise');
const config = require('./config.json');

mongoose.connect(config.connectString);

module.exports = {
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
        redirectUris: clientRetrived.redirectUris,
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