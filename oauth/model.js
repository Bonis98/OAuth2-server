const mongoose = require('mongoose');
require('../utilities/DB/client');
require('../utilities/DB/authcode');
require('../utilities/DB/user');
require('../utilities/DB/token');
const crypto = require('crypto');
const promise = require('promise');
const config = require('../config.json');

mongoose.connect(config.connectString);

module.exports = {
  /**
   * Retrive a client in the DB
   * 
   * More can be found here:
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getclient-clientid-clientsecret-callback
   * 
   * @param {string} clientId       Id of the client 
   * @param {string} clientSecret   Used to authenticate the client (can be null if no authentication is required)
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
   * More can be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#saveauthorizationcode-code-client-user-callback
   * 
   * @param {object} code     Code to be saved
   * @param {object} client   Client associated with the auth code
   * @param {object} user     User associated with the auth code
   */
  saveAuthorizationCode: async function(code, client, user){
    //Retrive information of user and client from DB
    let newUser = new mongoose.model('user')
    let newClient = mongoose.model('client')
    try{
      newClient = await newClient.findOne({clientId: client.id}).exec()
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

  /**
   * Retrive an authorization code from DB
   * 
   * More can be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getauthorizationcode-authorizationcode-callback
   * 
   * @param {String} authorizationCode    Code to be saved
   */
  getAuthorizationCode: async function(authorizationCode){
    let authCode = new mongoose.model('authcode')
    try{
      authCode = await authCode.findOne({authorizationCode: authorizationCode}).populate('clientId', 'clientId').populate('userId', 'userName')
      return {
        code: authCode.authorizationCode,
        expiresAt: authCode.expiresAt,
        redirectUri: authCode.redirectUri,
        client: {
          id: authCode.clientId[0].clientId,
        },
        user: authCode.userId[0].userName
      }
    }
    catch(ex){
      throw ex
    }
  },

  /**
   * Revoke an authorization code in the DB
   * 
   * More can be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#revokeauthorizationcode-code-callback
   * 
   * @param {Object} code    Code to be revoked
   */
  revokeAuthorizationCode: async function(code){
    let authCode = new mongoose.model('authcode')
    try{
      authCode = await authCode.deleteOne({authorizationCode: code.code})
      if (authCode.deletedCount == 1) return true
      else return false
    }
    catch(ex){
      throw ex
    }
  },

  /**
   * Save a new token in the DB
   * 
   * More can be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#savetoken-token-client-user-callback
   * 
   * @param {Object} token    Token to be saved
   * @param {Object} client   Client associated with the token
   * @param {Object} user     User associated with the token
   */
  saveToken: async function(token, client, user){
    //Retrive information of user and client from DB
    let newUser = new mongoose.model('user')
    let newClient = mongoose.model('client')
    try{
      newClient = await newClient.findOne({clientId: client.id}).exec()
      newUser = await newUser.findOne({userName: user}).exec()
    }
    catch(ex){
      throw ex
    }
    //Prepare new document
    let newToken = new mongoose.model('token')({
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      clientId: newClient._id,
      userId: newUser._id
    })
    try{
      //Save document
      await newToken.save()
      //Return informations
      return {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: {
          id: newClient.clientId
        },
        user: newUser.userName
      }
    }
    catch(ex){
      throw ex
    }
  },

  /**
   * Retrive a token in the DB
   * 
   * More can be found here: 
   * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getaccesstoken-accesstoken-callback
   * 
   * @param {String} accessToken   Token to be retrived
   */
  getAccessToken: async function(accessToken){
    //Prepare the model
    let newToken = new mongoose.model('token')
    try{
      newToken = await newToken.findOne({accessToken: accessToken}).populate('clientId', 'clientId').populate('userId', 'userName')
      return {
        accessToken: newToken.accessToken,
        accessTokenExpiresAt: newToken.accessTokenExpiresAt,
        client: {
          id: newToken.clientId[0].clientId,
        },
        user: newToken.userId[0].userName
      }
    }
    catch(ex){
      throw ex
    }
  }
}