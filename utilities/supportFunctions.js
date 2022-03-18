const mongoose = require('mongoose');
require('./DB/client');
const crypto = require('crypto');

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
}