const mongoose = require('mongoose');
const config = require('../config.json');
require('./DB/client');
require('./DB/user');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10; //Recommended by npmjs.com

mongoose.connect(config.connectString);

module.exports = {
  /**
   * Register a new client in the DB
   * 
   * @param {array} grantType   type of grants supported by the client
   * @param {array} redirect    uris of the client
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
   * Register a user in the DB
   * 
   * @param {string} username
   * @param {string} password
   * @param {string} name
   * 
   * If user already exists return a Mongo exception with code 11000
   */
  registerUser: function(username, password, name, callback){
    //Hash the password
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      if (err){
        console.error(err);
        return callback("Error while hashing the password");
      }
      //Prepare the model
      const user = new mongoose.model('user')({
        userName: username,
        passwordHash: hash,
        name: name
      });
      try{
        await user.save();
        return callback("User registered")
      }
      catch(ex){
        if (ex.code == 11000) return callback("Username is already in use")
        throw ex;
      }
    });
  },

  /**
   * Authenticate a user via username and password
   * 
   * @param {string} username
   * @param {string} password
   */
  authenticateUser: async function(username, password, callback){
    //Prepare the model
    const user = new mongoose.model('user');
    try{
      const userRetrived = await user.findOne({userName: username}).exec();
      //User not present in DB
      if (!userRetrived) return callback('User is not registered', null);
      //Check the password
      bcrypt.compare(password, userRetrived.passwordHash, function(err, result){
        if (err) return callback(err, null);
        else return callback(null, result);
      })
    }
    catch(ex){
      throw ex;
    }
  }
}