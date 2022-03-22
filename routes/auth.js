const path = require('path') // has path and __dirname
const express = require('express')
const functions = require('../utilities/supportFunctions')
const oauthServer = require('oauth2-server')
const model = require('../model')

const DebugControl = require('../utilities/debug.js')


const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

const oauth = new oauthServer({
  model:model,
  accessTokenLifetime: 60 * 60 * 24,
  grants: ['authorization_code']
});

router.get('/', (req,res) => {  // send back a simple form for the oauth
  res.sendFile(filePath)
})

router.post('/authorize', (req,res,next) => {
  functions.authenticateUser(req.body.username, req.body.password, function(err, result){
    if (!result || err) {
      const params = [ // Send params back down
      'client_id',
      'redirectUri',
      'response_type',
      'grant_type',
      'state',
      'username',
      ]
      .map(a => `${a}=${req.body[a]}`)
      .join('&')
      if (err === 'User is not registered') res.redirect(`/oauth?user=false&${params}`)
      else if (!result) res.redirect(`/oauth?success=false&${params}`)
      else res.redirect(`/oauth?error=true&${params}`)
    }
    else next()
  })
}, (req, res, next) => {
  DebugControl.log.flow('authorize')
  oauth.authorize(new oauthServer.Request(req), new oauthServer.Response(res),{
    authenticateHandler: {
      handle: req => {
        return req.body.username
      }
    }
  }).then(
  function (code){
    res.redirect(code.redirectUri + '?code=' + code.authorizationCode + '&state=' + req.body.state)
  },
  function (err){
    res.status(400).send(err)
  })
})

module.exports = router
