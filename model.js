const mongoose = require('mongoose');
require('./utilities/DB/client');
require('./utilities/DB/authcode');
require('./utilities/DB/user');
const crypto = require('crypto');
const promise = require('promise');
const config = require('./config.json');

mongoose.connect(config.connectString);

module.exports = {
  /**
   * Retrive a client in the DB
   * 
   * More can be found here:
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getclient-clientid-clientsecret-callback
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

  /**
   * Save a new authorization code in the DB
   * 
   * More ca be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#saveauthorizationcode-code-client-user-callback
   * 
   * @param {object} Code to be saved
   * @param {object} Client associated with the auth code
   * @param {object} User associated with the auth code
   */
  saveAuthorizationCode: async function(code, client, user){
    //Retrive information of user and client from DB
    let newUser = new mongoose.model('user')
    let newClient = mongoose.model('client')
    try{
      //Client query is already present in the model (due to getClient())
      newClient = await newClient.findOne()
      newUser = await newUser.findOne({userName: user}).exec()
    }
    catch(ex){
      throw ex
    }
    //Prepare new document
    const newCode = new mongoose.model('authcode')({
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      clientId: newClient._id,
      userId: newUser._id
    });
    try{
      //Save document
      await newCode.save()
      //Return informations
      return {
        authorizationCode: code.authorizationCode,
        expiresAt: code.expiresAt,
        redirectUri: code.redirectUri,
        client: this.client,
        clientId: client.id,
        userId: {user:this.user}
      }
    }
    catch(ex){
      throw ex
    }
  },

  getAccessToken: function(accessToken){
    return new promise('getAccessToken');
  }
}